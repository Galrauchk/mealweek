import React, { useState } from "react";
import { SectionTitle, PrimaryBtn } from "./UI.jsx";

export default function PrefsTab({ prefs, setPrefs }) {
  const [input, setInput] = useState({ text: "", type: "likes", who: "les deux" });

  const add = () => {
    if (!input.text.trim()) return;
    setPrefs(p => ({ ...p, [input.type]: [...p[input.type], { text: input.text.trim(), who: input.who }] }));
    setInput(i => ({ ...i, text: "" }));
  };

  const remove = (type, i) => setPrefs(p => ({ ...p, [type]: p[type].filter((_, j) => j !== i) }));

  const chipStyle = (type) => type === "likes"
    ? { bg: "#052e16", color: "#4ade80", border: "#14532d" }
    : { bg: "#2d0707", color: "#f87171", border: "#7f1d1d" };

  return (
    <div>
      <SectionTitle sub="Mémorisées entre les sessions · incluses à chaque génération 🌿">Nos préférences</SectionTitle>

      {/* Add form */}
      <div style={{ background: "#141210", border: "1px solid #2a2320", borderRadius: 18, padding: 16, marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>+ Ajouter une préférence</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            value={input.text}
            onChange={e => setInput(i => ({ ...i, text: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && add()}
            placeholder="Ex: Risotto, Saumon, Curry, Tacos…"
            style={{ background: "#0f0d0c", border: "1px solid #2e2820", color: "#f0ebe0", borderRadius: 12, padding: "12px 14px", fontFamily: "'DM Sans',sans-serif", fontSize: 16, width: "100%", outline: "none" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            {["likes", "dislikes"].map(type => (
              <button key={type} onClick={() => setInput(i => ({ ...i, type }))}
                style={{ flex: 1, padding: "10px", borderRadius: 12, border: `1.5px solid ${input.type === type ? (type === "likes" ? "#14532d" : "#7f1d1d") : "#2a2320"}`, background: input.type === type ? (type === "likes" ? "#052e16" : "#2d0707") : "#0f0d0c", color: type === "likes" ? "#4ade80" : "#f87171", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                {type === "likes" ? "❤️ On adore" : "🙅 On évite"}
              </button>
            ))}
          </div>
          <select value={input.who} onChange={e => setInput(i => ({ ...i, who: e.target.value }))}
            style={{ background: "#0f0d0c", border: "1px solid #2e2820", color: "#f0ebe0", borderRadius: 12, padding: "12px 14px", fontFamily: "'DM Sans',sans-serif", fontSize: 16, width: "100%", outline: "none" }}>
            <option value="les deux">Les deux 👫</option>
            <option value="Jeffrey">Jeffrey 💪</option>
            <option value="Laurine">Laurine 🌿</option>
          </select>
          <PrimaryBtn onClick={add}>Ajouter</PrimaryBtn>
        </div>
      </div>

      {/* Likes / Dislikes */}
      {["likes", "dislikes"].map(type => {
        const items = prefs[type];
        if (!items.length) return null;
        const s = chipStyle(type);
        return (
          <div key={type} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              {type === "likes" ? "❤️ Ce qu'on aime" : "🙅 Ce qu'on évite"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {items.map((p, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 9px 5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                  {p.text}
                  <span style={{ opacity: 0.5, fontSize: 10 }}>({p.who})</span>
                  <button onClick={() => remove(type, i)} style={{ background: "none", border: "none", color: s.color, cursor: "pointer", padding: 0, fontSize: 15, lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
          </div>
        );
      })}

      {prefs.likes.length === 0 && prefs.dislikes.length === 0 && (
        <div style={{ textAlign: "center", padding: "28px 0", color: "#3a3530", fontSize: 13 }}>
          Aucune préférence enregistrée encore 🌱
        </div>
      )}

      {/* Profils */}
      <div style={{ fontSize: 12, fontWeight: 700, color: "#3a3530", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 10, marginBottom: 12 }}>Profils fixes</div>
      {[
        { name: "Jeffrey 💪", c: "#3b82f6", desc: "Protéiné & équilibré. Préfère ❄️ surgelé (valeur nutritionnelle). Mange de tout sans restriction." },
        { name: "Laurine 🌿", c: "#f9a8d4", desc: "Légère et équilibrée. Poulet & poisson OK. Pas de viande rouge. Légumes avec modération. Crème fraîche seulement avec le curry 🍛" },
      ].map(p => (
        <div key={p.name} style={{ background: "#141210", borderLeft: `3px solid ${p.c}`, borderRadius: 14, padding: "13px 15px", border: `1px solid #2a2320`, borderLeftColor: p.c, marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 5, color: p.c }}>{p.name}</div>
          <div style={{ fontSize: 12, color: "#5a5450", lineHeight: 1.6 }}>{p.desc}</div>
        </div>
      ))}

      <div style={{ background: "#1a1200", border: "1px solid #3a2800", borderRadius: 14, padding: "12px 15px", marginTop: 6 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#e8c14e", marginBottom: 4 }}>⚠️ Règle décongélation</div>
        <div style={{ fontSize: 12, color: "#7a6030", lineHeight: 1.6 }}>Un produit décongelé ne se recongèle jamais. Le planning respecte les jours de consommation pour éviter tout risque sanitaire.</div>
      </div>
    </div>
  );
}
