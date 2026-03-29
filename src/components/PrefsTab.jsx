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
      <SectionTitle sub="Mémorisées entre les sessions · prises en compte à chaque génération">Préférences</SectionTitle>

      {/* Add form */}
      <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: 14, padding: 15, marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 11 }}>+ Ajouter une préférence</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <input
            value={input.text}
            onChange={e => setInput(i => ({ ...i, text: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && add()}
            placeholder="Ex: Risotto, Saumon, Curry, Tacos…"
            style={{ background: "#0f0f0f", border: "1px solid #2a2a2a", color: "#f0ebe0", borderRadius: 10, padding: "11px 13px", fontFamily: "'DM Sans',sans-serif", fontSize: 16, width: "100%", outline: "none" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            {["likes", "dislikes"].map(type => (
              <button key={type} onClick={() => setInput(i => ({ ...i, type }))}
                style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1.5px solid ${input.type === type ? (type === "likes" ? "#14532d" : "#7f1d1d") : "#1e1e1e"}`, background: input.type === type ? (type === "likes" ? "#052e16" : "#2d0707") : "#0f0f0f", color: type === "likes" ? "#4ade80" : "#f87171", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                {type === "likes" ? "❤️ Aime" : "❌ Évite"}
              </button>
            ))}
          </div>
          <select value={input.who} onChange={e => setInput(i => ({ ...i, who: e.target.value }))}
            style={{ background: "#0f0f0f", border: "1px solid #2a2a2a", color: "#f0ebe0", borderRadius: 10, padding: "11px 13px", fontFamily: "'DM Sans',sans-serif", fontSize: 16, width: "100%", outline: "none" }}>
            <option value="les deux">Les deux</option>
            <option value="Jeffrey">Jeffrey 💪</option>
            <option value="Laurine">Laurine 🌿</option>
          </select>
          <PrimaryBtn onClick={add}>Ajouter</PrimaryBtn>
        </div>
      </div>

      {/* Likes */}
      {["likes", "dislikes"].map(type => {
        const items = prefs[type];
        if (!items.length) return null;
        const s = chipStyle(type);
        return (
          <div key={type} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 9 }}>
              {type === "likes" ? "❤️ On aime" : "❌ On évite"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {items.map((p, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px 4px 11px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
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
        <div style={{ textAlign: "center", padding: "24px 0", color: "#444", fontSize: 13 }}>Aucune préférence enregistrée</div>
      )}

      {/* Fixed profiles */}
      <div style={{ fontSize: 12, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 8, marginBottom: 10 }}>Profils fixes</div>
      {[
        { name: "Jeffrey 💪", c: "#3b82f6", desc: "Protéiné & équilibré. Préfère ❄️ surgelé (valeur nutritionnelle). Mange de tout." },
        { name: "Laurine 🌿", c: "#10b981", desc: "Légère. Poulet & poisson OK. Pas de viande rouge. Légumes avec modération. Crème fraîche = curry seulement." },
      ].map(p => (
        <div key={p.name} style={{ background: "#141414", borderLeft: `3px solid ${p.c}`, borderRadius: 12, padding: "12px 14px", border: `1px solid #1e1e1e`, marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
          <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{p.desc}</div>
        </div>
      ))}
      <div style={{ background: "#1a1300", border: "1px solid #3a2e00", borderRadius: 12, padding: "11px 14px", marginTop: 4 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#d4af37", marginBottom: 3 }}>⚠️ Règle décongélation</div>
        <div style={{ fontSize: 12, color: "#8a7030", lineHeight: 1.5 }}>Produit décongelé = jamais recongeler. Le planning tient compte des jours de consommation pour éviter tout risque sanitaire.</div>
      </div>
    </div>
  );
}
