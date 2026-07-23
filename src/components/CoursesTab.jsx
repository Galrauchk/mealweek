import React, { useState } from "react";
import { SectionTitle, SecondaryBtn, GhostCard, Spinner } from "./UI.jsx";
import { BUDGET_TARGET } from "../utils/constants";

function ShopCat({ cat, items }) {
  const [checked, setChecked] = useState({});
  const tog = i => setChecked(c => ({ ...c, [i]: !c[i] }));
  const done = Object.values(checked).filter(Boolean).length;
  const isFresh = cat.toLowerCase().includes("frais");
  const isFreeze = cat.toLowerCase().includes("surgel") || cat.includes("❄");

  const borderColor = isFresh ? "#3a2800" : isFreeze ? "#1a3a5c" : "#2a2320";
  const accentColor = isFresh ? "#e8c14e" : isFreeze ? "#60a5fa" : "#4ade80";

  return (
    <div style={{ background: "#141210", border: `1px solid ${borderColor}`, borderRadius: 16, padding: "14px 15px", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{cat}</div>
        <div style={{ fontSize: 11, color: "#4a4540", background: "#1c1a18", borderRadius: 20, padding: "2px 9px" }}>{done}/{items.length}</div>
      </div>
      <div style={{ height: 3, background: "#1e1c1a", borderRadius: 2, marginBottom: 11 }}>
        <div style={{ height: "100%", background: accentColor, borderRadius: 2, width: `${items.length ? (done / items.length) * 100 : 0}%`, transition: "width .3s" }} />
      </div>
      {items.map((item, i) => (
        <div key={i} onClick={() => tog(i)}
          style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: i < items.length - 1 ? "1px solid #1e1c1a" : "none", cursor: "pointer", userSelect: "none" }}>
          <input type="checkbox" checked={!!checked[i]} onChange={() => tog(i)}
            style={{ width: 18, height: 18, accentColor: "#e8c14e", cursor: "pointer", flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 14, textDecoration: checked[i] ? "line-through" : "none", color: checked[i] ? "#3a3530" : "#f0ebe0" }}>
              {item.item}
            </span>
            {item.qty && <span style={{ fontSize: 11, color: "#4a4540", marginLeft: 6 }}>({item.qty})</span>}
            {item.prix_estime && <span style={{ fontSize: 11, color: "#e8c14e", marginLeft: 6 }}>~{item.prix_estime}€</span>}
            {item.note && <div style={{ fontSize: 11, color: "#a07840", marginTop: 3, lineHeight: 1.5 }}>→ {item.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function RemindersBtn({ courses }) {
  const [sent, setSent] = useState(false);

  const sendToReminders = () => {
    if (!courses) return;

    // Formate chaque article : "Nom (quantité) ~prix€ [catégorie]"
    const lines = Object.entries(courses).flatMap(([cat, items]) =>
      items.map(item => {
        let line = item.item;
        if (item.qty) line += ` (${item.qty})`;
        if (item.prix_estime) line += ` ~${item.prix_estime}€`;
        return line;
      })
    );

    const text = encodeURIComponent(lines.join("\n"));
    window.location.href = `shortcuts://run-shortcut?name=MealWeek%20Courses&input=${text}`;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <button
      onClick={sendToReminders}
      style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        background: sent ? "#052e16" : "linear-gradient(135deg, #1a1a2e, #16213e)",
        border: `1px solid ${sent ? "#14532d" : "#2a2a4a"}`,
        color: sent ? "#4ade80" : "#a78bfa",
        borderRadius: 14, padding: "13px",
        fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14,
        cursor: "pointer", marginBottom: 10,
        transition: "all .3s",
      }}>
      <span style={{ fontSize: 18 }}>📲</span>
      {sent ? "Raccourci lancé ! Vérifie ton iPhone ✓" : "Envoyer vers Reminders Apple"}
    </button>
  );
}

export default function CoursesTab({ courses, plan, generating, onGenerate }) {
  const hasPlan = Object.keys(plan).length > 0;

  const totalEst = courses
    ? Object.values(courses).flat().reduce((sum, item) => sum + (parseFloat(item.prix_estime) || 0), 0)
    : 0;
  const budgetPct = Math.min(100, (totalEst / BUDGET_TARGET) * 100);
  const budgetColor = totalEst > BUDGET_TARGET ? "#ef4444" : totalEst > BUDGET_TARGET * 0.8 ? "#f59e0b" : "#4ade80";

  return (
    <div>
      <SectionTitle sub="Pour 2 personnes · cochez au fur et à mesure 🧺">Liste de courses</SectionTitle>

      {hasPlan && (
        <SecondaryBtn onClick={onGenerate} loading={generating} style={{ marginBottom: 10 }}>
          ↻ Régénérer la liste
        </SecondaryBtn>
      )}

      {courses && <RemindersBtn courses={courses} />}

      {/* Budget tracker */}
      {courses && totalEst > 0 && (
        <div style={{ background: "#141210", border: "1px solid #2a2320", borderRadius: 16, padding: "15px 16px", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>💰 Budget estimé</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: budgetColor }}>~{totalEst.toFixed(0)}€ / {BUDGET_TARGET}€</span>
          </div>
          <div style={{ height: 6, background: "#1e1c1a", borderRadius: 3 }}>
            <div style={{ height: "100%", background: budgetColor, borderRadius: 3, width: `${budgetPct}%`, transition: "width .4s" }} />
          </div>
          <div style={{ fontSize: 11, color: "#4a4540", marginTop: 7 }}>
            {totalEst > BUDGET_TARGET
              ? `⚠️ Dépassement de ${(totalEst - BUDGET_TARGET).toFixed(0)}€`
              : `🎉 Super ! ${(BUDGET_TARGET - totalEst).toFixed(0)}€ de marge cette semaine`}
          </div>
        </div>
      )}

      {generating && !courses && (
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spinner size={32} color="#666" />
          <div style={{ color: "#4a4540", marginTop: 16, fontSize: 14 }}>On prépare votre liste…</div>
        </div>
      )}

      {!courses && !generating && (
        <GhostCard
          emoji="🛍️"
          title="Liste vide pour l'instant"
          subtitle={hasPlan
            ? "Générez votre liste depuis l'onglet Planning — on s'occupe de tout ✨"
            : "Créez d'abord votre menu de la semaine pour avoir une liste personnalisée 🌿"}
        />
      )}

      {courses && Object.entries(courses).map(([cat, items]) => (
        <ShopCat key={cat} cat={cat} items={items} />
      ))}
    </div>
  );
}
