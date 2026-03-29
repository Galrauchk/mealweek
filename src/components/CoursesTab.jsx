import React, { useState } from "react";
import { SectionTitle, SecondaryBtn, GhostCard, Spinner } from "./UI.jsx";
import { BUDGET_TARGET } from "../utils/constants";

function ShopCat({ cat, items }) {
  const [checked, setChecked] = useState({});
  const tog = i => setChecked(c => ({ ...c, [i]: !c[i] }));
  const done = Object.values(checked).filter(Boolean).length;
  const isFresh = cat.toLowerCase().includes("frais");
  const isFreeze = cat.toLowerCase().includes("surgel") || cat.includes("❄");

  const borderColor = isFresh ? "#3a2e00" : isFreeze ? "#1a3a5c" : "#1e1e1e";
  const accentColor = isFresh ? "#d4af37" : isFreeze ? "#60a5fa" : "#4ade80";

  return (
    <div style={{ background: "#141414", border: `1px solid ${borderColor}`, borderRadius: 14, padding: "13px 14px", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{cat}</div>
        <div style={{ fontSize: 11, color: "#555" }}>{done}/{items.length}</div>
      </div>
      <div style={{ height: 2, background: "#1e1e1e", borderRadius: 2, marginBottom: 10 }}>
        <div style={{ height: "100%", background: accentColor, borderRadius: 2, width: `${items.length ? (done / items.length) * 100 : 0}%`, transition: "width .3s" }} />
      </div>
      {items.map((item, i) => (
        <div key={i} onClick={() => tog(i)}
          style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: i < items.length - 1 ? "1px solid #1a1a1a" : "none", cursor: "pointer", userSelect: "none" }}>
          <input type="checkbox" checked={!!checked[i]} onChange={() => tog(i)}
            style={{ width: 18, height: 18, accentColor: "#d4af37", cursor: "pointer", flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 14, textDecoration: checked[i] ? "line-through" : "none", color: checked[i] ? "#444" : "#f0ebe0" }}>
              {item.item}
            </span>
            {item.qty && <span style={{ fontSize: 11, color: "#555", marginLeft: 6 }}>({item.qty})</span>}
            {item.prix_estime && <span style={{ fontSize: 11, color: "#d4af37", marginLeft: 6 }}>~{item.prix_estime}€</span>}
            {item.note && <div style={{ fontSize: 11, color: "#d4af37", marginTop: 2, lineHeight: 1.4 }}>→ {item.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CoursesTab({ courses, plan, generating, onGenerate }) {
  const hasPlan = Object.keys(plan).length > 0;

  // Estimate total budget from items
  const totalEst = courses
    ? Object.values(courses).flat().reduce((sum, item) => sum + (parseFloat(item.prix_estime) || 0), 0)
    : 0;
  const budgetPct = Math.min(100, (totalEst / BUDGET_TARGET) * 100);
  const budgetColor = totalEst > BUDGET_TARGET ? "#ef4444" : totalEst > BUDGET_TARGET * 0.8 ? "#f59e0b" : "#4ade80";

  return (
    <div>
      <SectionTitle sub="2 personnes · cochez au fur et à mesure">Liste de courses</SectionTitle>

      {hasPlan && (
        <SecondaryBtn onClick={onGenerate} loading={generating} style={{ marginBottom: 14 }}>
          ↻ Régénérer la liste
        </SecondaryBtn>
      )}

      {/* Budget tracker */}
      {courses && totalEst > 0 && (
        <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>💰 Budget estimé</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: budgetColor }}>~{totalEst.toFixed(0)}€ / {BUDGET_TARGET}€</span>
          </div>
          <div style={{ height: 6, background: "#1e1e1e", borderRadius: 3 }}>
            <div style={{ height: "100%", background: budgetColor, borderRadius: 3, width: `${budgetPct}%`, transition: "width .4s" }} />
          </div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 6 }}>
            {totalEst > BUDGET_TARGET ? `⚠️ Dépassement de ${(totalEst - BUDGET_TARGET).toFixed(0)}€` : `✓ ${(BUDGET_TARGET - totalEst).toFixed(0)}€ de marge`}
          </div>
        </div>
      )}

      {generating && !courses && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spinner size={32} color="#555" />
          <div style={{ color: "#555", marginTop: 14, fontSize: 14 }}>Calcul des courses…</div>
        </div>
      )}

      {!courses && !generating && (
        <GhostCard emoji="🛒" title="Aucune liste"
          subtitle={hasPlan ? "Allez dans Planning → 'Générer la liste de courses'" : "Générez d'abord votre planning de la semaine"} />
      )}

      {courses && Object.entries(courses).map(([cat, items]) => (
        <ShopCat key={cat} cat={cat} items={items} />
      ))}
    </div>
  );
}
