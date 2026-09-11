import React, { useState, useCallback } from "react";
import { askClaude, parseJSON, getWeekKey, getWeekDates } from "./utils/api.js";
import { DAYS, BATCH_DAYS } from "./utils/constants.js";
import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { Toast } from "./components/UI.jsx";
import PlanningTab from "./components/PlanningTab.jsx";
import CoursesTab from "./components/CoursesTab.jsx";
import PrefsTab from "./components/PrefsTab.jsx";

const GLOBAL_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes tin { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }
  @keyframes up { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
  ::-webkit-scrollbar { width: 0; }
  html, body, #root { height: 100%; background: #0a0a0a; }
  body { overscroll-behavior: none; }
`;

export default function App() {
  const [tab, setTab] = useState("plan");
  const [weekOff, setWeekOff] = useState(0);

  // Persisted state
  const [allPlans, setAllPlans] = useLocalStorage("mw_plans_v2", {});
  const [allCourses, setAllCourses] = useLocalStorage("mw_courses_v2", {});
  const [allBatches, setAllBatches] = useLocalStorage("mw_batches_v2", {});
  const [freezerStock, setFreezerStock] = useLocalStorage("mw_freezer_v2", {});
  const [prefs, setPrefs] = useLocalStorage("mw_prefs_v2", { likes: [], dislikes: [] });

  // Loading states
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [loadingCell, setLoadingCell] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmRegen, setConfirmRegen] = useState(false);

  const FREEZER_MAPPING = {
    "poulet": "poulet",
    "poisson": "poisson",
    "viande hachée": "hache",
    "haché": "hache",
    "hachée": "hache",
    "fruits de mer": "fruits_mer",
    "crevettes": "fruits_mer",
    "légumes": "legumes",
    "légumes surgelés": "legumes",
  };

  const decrementFreezerForMeals = (meals) => {
    const decrements = {};
    meals.forEach(meal => {
      if (meal?.source === "surgele" && meal?.freezer_item) {
        const key = meal.freezer_item.toLowerCase();
        const catId = FREEZER_MAPPING[key];
        if (catId) decrements[catId] = (decrements[catId] || 0) + 1;
      }
    });
    if (Object.keys(decrements).length === 0) return;
    setFreezerStock(s => {
      const updated = { ...s };
      Object.entries(decrements).forEach(([id, count]) => {
        updated[id] = Math.max(0, (updated[id] || 0) - count);
      });
      return updated;
    });
  };

  const weekKey = getWeekKey(weekOff);
  const weekDates = getWeekDates(weekOff);
  const plan = allPlans[weekKey] || {};
  const courses = allCourses[weekKey] || null;
  const batches = allBatches[weekKey] || {};

  const setPlan = useCallback(fn => {
    setAllPlans(prev => ({ ...prev, [weekKey]: typeof fn === "function" ? fn(prev[weekKey] || {}) : fn }));
  }, [weekKey, setAllPlans]);

  const setCourses = useCallback(data => {
    setAllCourses(prev => ({ ...prev, [weekKey]: data }));
  }, [weekKey, setAllCourses]);

  const setBatches = useCallback(fn => {
    setAllBatches(prev => ({ ...prev, [weekKey]: typeof fn === "function" ? fn(prev[weekKey] || {}) : fn }));
  }, [weekKey, setAllBatches]);

  const weekLabel = (() => {
    const d = weekDates;
    return `${d[0]} – ${d[6]}`;
  })();

  const notify = (msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 2500);
  };

  const freezerCtx = () => {
    const items = Object.entries(freezerStock)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const labels = { poulet: "poulet", hache: "viande hachée", poisson: "poisson", fruits_mer: "fruits de mer", legumes: "légumes surgelés" };
        return `${labels[id] || id}: ${qty} portions`;
      });
    return items.length ? `Stock congélateur disponible: ${items.join(", ")}` : "Stock congélateur non renseigné";
  };

  const prefCtx = () => {
    const l = prefs.likes.map(p => `${p.who} aime: ${p.text}`).join(", ");
    const d = prefs.dislikes.map(p => `${p.who} n'aime pas: ${p.text}`).join(", ");
    return [l, d].filter(Boolean).join(". ");
  };

  // Extract batch info from plan and track portions
  const extractBatches = (newPlan) => {
    const newBatches = {};
    DAYS.forEach(day => {
      if (!BATCH_DAYS[day]) return;
      const soir = newPlan[day]?.soir;
      if (soir?.batch && soir?.batch_portions) {
        const key = `${day}_soir`;
        newBatches[key] = {
          nom: soir.nom,
          day,
          total: soir.batch_portions,
          remaining: soir.batch_portions,
          batch_used_days: soir.batch_used_days || [],
        };
      }
    });
    return newBatches;
  };

  // Generate full week
  const doWeek = async () => {
    setLoadingWeek(true);
    const ctx = prefCtx();
    const fCtx = freezerCtx();
    const prompt = `Génère un planning complet lundi→dimanche, midi+soir, pour 2 personnes. Semaine du ${weekLabel}.

${fCtx}
${ctx ? `Préférences: ${ctx}` : ""}

Consignes batch cooking:
- Dimanche soir et Mercredi soir = plats batch (se conservent bien)
- batch_portions = nombre de portions préparées (entre 2 et 4)
- batch_used_days = liste des jours où ces portions seront utilisées

Pour chaque repas:
- source: "surgele" si utilise le congélo, "conserve" si conserves/épicerie, "frais" si produit frais acheté
- freezer_item: si source=surgele, indiquer quel produit du congélo (ex: "poulet", "poisson")
- decongel_note: si décongélation nécessaire, indiquer quand acheter le frais en remplacement si recongélation impossible, sinon null
- batch: true si c'est un repas batch cooking

JSON exact (7 jours obligatoires):
{
  "Lundi": {
    "midi": {"nom":"...","description":"...","source":"surgele","freezer_item":"poulet","batch":false,"batch_portions":null,"batch_used_days":null,"decongel_note":null},
    "soir": {"nom":"...","description":"...","source":"conserve","freezer_item":null,"batch":false,"batch_portions":null,"batch_used_days":null,"decongel_note":null}
  },
  "Mardi": {...},
  "Mercredi": {
    "midi": {...},
    "soir": {"nom":"...","description":"...","source":"surgele","freezer_item":"poulet","batch":true,"batch_portions":3,"batch_used_days":["Jeudi midi","Vendredi soir"],"decongel_note":null}
  },
  "Jeudi": {...},
  "Vendredi": {...},
  "Samedi": {...},
  "Dimanche": {
    "midi": {...},
    "soir": {"nom":"...","description":"...","source":"surgele","freezer_item":"viande hachée","batch":true,"batch_portions":4,"batch_used_days":["Lundi soir","Mardi midi"],"decongel_note":null}
  }
}`;

    try {
      const text = await askClaude(prompt);
      const parsed = parseJSON(text);
      if (parsed) {
        setPlan(parsed);
        setBatches(extractBatches(parsed));
        setCourses(null);
        const allMeals = DAYS.flatMap(day => ["midi", "soir"].map(slot => parsed[day]?.[slot]).filter(Boolean));
        decrementFreezerForMeals(allMeals);
        notify("Semaine générée ✓");
      } else {
        notify("Erreur de génération — réessaie", true);
      }
    } catch (e) {
      notify("Erreur réseau", true);
    }
    setLoadingWeek(false);
  };

  // Regen single meal
  const doMeal = async (day, slot) => {
    const key = `${day}_${slot}`;
    setLoadingCell(key);
    const isBatch = BATCH_DAYS[day] && slot === "soir";
    const ctx = prefCtx();
    const prompt = `Génère le repas du ${slot} pour ${day}. 2 personnes.
${freezerCtx()}
${ctx ? `Préférences: ${ctx}` : ""}
${isBatch ? "Ce repas est un plat batch cooking (se conserve, prépare 2-4 portions)." : ""}
JSON: {"nom":"","description":"","source":"surgele|conserve|frais","freezer_item":null,"batch":${isBatch},"batch_portions":${isBatch ? 3 : null},"batch_used_days":${isBatch ? '["exemple"]' : null},"decongel_note":null}`;

    try {
      const text = await askClaude(prompt);
      const parsed = parseJSON(text);
      if (parsed) {
        setPlan(p => ({ ...p, [day]: { ...(p[day] || {}), [slot]: parsed } }));
        if (BATCH_DAYS[day] && slot === "soir" && parsed.batch && parsed.batch_portions) {
          setBatches(b => ({ ...b, [`${day}_soir`]: { nom: parsed.nom, day, total: parsed.batch_portions, remaining: parsed.batch_portions, batch_used_days: parsed.batch_used_days || [] } }));
        }
        decrementFreezerForMeals([parsed]);
        notify("Repas changé ✓");
      } else notify("Erreur", true);
    } catch { notify("Erreur réseau", true); }
    setLoadingCell(null);
  };

  // Regen full day
  const doDay = async (day) => {
    setLoadingCell(`${day}_day`);
    const isBatch = BATCH_DAYS[day];
    const ctx = prefCtx();
    const prompt = `Génère midi et soir pour ${day}. 2 personnes.
${freezerCtx()}
${ctx ? `Préférences: ${ctx}` : ""}
${isBatch ? `${day} = session batch cooking, le soir prépare 2-4 portions.` : ""}
JSON: {"midi":{...},"soir":{...}}`;

    try {
      const text = await askClaude(prompt);
      const parsed = parseJSON(text);
      if (parsed) {
        setPlan(p => ({ ...p, [day]: parsed }));
        if (isBatch && parsed.soir?.batch && parsed.soir?.batch_portions) {
          setBatches(b => ({ ...b, [`${day}_soir`]: { nom: parsed.soir.nom, day, total: parsed.soir.batch_portions, remaining: parsed.soir.batch_portions, batch_used_days: parsed.soir.batch_used_days || [] } }));
        }
        const dayMeals = ["midi", "soir"].map(s => parsed[s]).filter(Boolean);
        decrementFreezerForMeals(dayMeals);
        notify(`${day} régénéré ✓`);
      } else notify("Erreur", true);
    } catch { notify("Erreur réseau", true); }
    setLoadingCell(null);
  };

  // Generate shopping list
  const doCourses = async () => {
    if (!Object.keys(plan).length) { notify("Générez d'abord le planning", true); return; }
    setLoadingCourses(true);
    setTab("courses");

    const flat = DAYS.map(day => {
      const dd = plan[day];
      if (!dd) return null;
      return ["midi", "soir"].map(slot => {
        const m = dd[slot];
        if (!m) return null;
        return `${day} ${slot}: ${m.nom} (${m.source}${m.freezer_item ? " – " + m.freezer_item + " du congélo" : ""}${m.decongel_note ? " – " + m.decongel_note : ""})`;
      }).filter(Boolean).join(", ");
    }).filter(Boolean).join(" | ");

    const ctx = prefCtx();
    const prompt = `Génère la liste de courses pour 2 personnes, budget cible 50-80€/semaine.
Repas: ${flat}
${ctx ? `Profil: ${ctx}` : ""}

RÈGLES:
- Les surgélés du congélo = NE PAS inclure (déjà en stock)
- Inclure: conserves/épicerie manquante, produits frais nécessaires, compléments
- Frais = indiquer quel jour acheter pour respecter la règle des 48h
- Estimer le prix de chaque article (prix grande surface française)
- Quantités précises pour 2 personnes

JSON:
{
  "🥫 Conserves & Épicerie": [{"item":"","qty":"","prix_estime":0.0,"note":null}],
  "🛒 Frais – Lundi": [{"item":"","qty":"","prix_estime":0.0,"note":"consommer avant mercredi"}],
  "🛒 Frais – Mercredi": [{"item":"","qty":"","prix_estime":0.0,"note":"consommer avant vendredi"}],
  "🛒 Frais – Vendredi": [{"item":"","qty":"","prix_estime":0.0,"note":null}],
  "🧀 Produits laitiers": [{"item":"","qty":"","prix_estime":0.0,"note":null}],
  "🌾 Féculents & Céréales": [{"item":"","qty":"","prix_estime":0.0,"note":null}],
  "🫙 Condiments & Sauces": [{"item":"","qty":"","prix_estime":0.0,"note":null}]
}`;

    try {
      const text = await askClaude(prompt);
      const parsed = parseJSON(text);
      if (parsed) { setCourses(parsed); notify("Liste générée ✓"); }
      else notify("Erreur liste", true);
    } catch { notify("Erreur réseau", true); }
    setLoadingCourses(false);
  };

  const handleGenWeek = () => {
    if (Object.keys(plan).length > 0) {
      setConfirmRegen(true);
    } else {
      doWeek();
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#0a0a0a", minHeight: "100dvh", color: "#f0ebe0", maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column" }}>
        <Toast toast={toast} />

        {confirmRegen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 18, padding: "24px 20px", maxWidth: 340, width: "100%" }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>⚠️</div>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, marginBottom: 8 }}>Remplacer le planning ?</div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 20, lineHeight: 1.5 }}>Le planning existant sera effacé et remplacé par une nouvelle génération.</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setConfirmRegen(false); doWeek(); }}
                  style={{ flex: 1, background: "#d4af37", color: "#0a0a0a", border: "none", borderRadius: 12, padding: "12px", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Oui, régénérer
                </button>
                <button onClick={() => setConfirmRegen(false)}
                  style={{ flex: 1, background: "#1a1a1a", color: "#f0ebe0", border: "1px solid #2a2a2a", borderRadius: 12, padding: "12px", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ background: "#0a0a0a", padding: "env(safe-area-inset-top, 12px) 16px 0", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingTop: 8 }}>
            <div>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, lineHeight: 1 }}>MealWeek</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>Jeffrey 💪 & Laurine 🌿</div>
            </div>
            <div style={{ textAlign: "right", fontSize: 11, color: "#555", background: "#141414", border: "1px solid #1e1e1e", borderRadius: 8, padding: "6px 10px" }}>
              <div style={{ color: "#d4af37", fontWeight: 700 }}>2 pers.</div>
              <div>❄️ Surgelé first</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #1a1a1a" }}>
            {[["plan", "📅", "Planning"], ["courses", "🛒", "Courses"], ["prefs", "❤️", "Préfs"]].map(([k, ic, lb]) => (
              <button key={k} onClick={() => setTab(k)}
                style={{
                  flex: 1, padding: "10px 0",
                  background: "none", border: "none", color: tab === k ? "#f0ebe0" : "#555",
                  fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13,
                  cursor: "pointer", position: "relative",
                }}>
                {ic} {lb}
                {tab === k && (
                  <span style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 20, height: 2, background: "#d4af37", borderRadius: 2 }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px calc(env(safe-area-inset-bottom, 16px) + 14px)" }}>
          {tab === "plan" && (
            <PlanningTab
              plan={plan} weekDates={weekDates} weekLabel={weekLabel}
              weekOff={weekOff} setWeekOff={setWeekOff}
              batches={batches} freezerStock={freezerStock} setFreezerStock={setFreezerStock}
              loadingWeek={loadingWeek} loadingCell={loadingCell}
              onGenWeek={handleGenWeek} onRegenDay={doDay} onRegenMeal={doMeal} onGenCourses={doCourses}
            />
          )}
          {tab === "courses" && (
            <CoursesTab
              courses={courses} plan={plan}
              generating={loadingCourses} onGenerate={doCourses}
            />
          )}
          {tab === "prefs" && <PrefsTab prefs={prefs} setPrefs={setPrefs} />}
          <p data-webtrafic-credit style={{ margin: "1rem", textAlign: "center", fontSize: "0.75rem", lineHeight: 1.6 }}>Site réalisé par <a href="https://webtrafic.fr/" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "0.2em" }}>WebTrafic</a></p>
        </div>
      </div>
    </>
  );
}
