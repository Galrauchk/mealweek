import React from "react";
import { FREEZER_CATEGORIES } from "../utils/constants";

export default function FreezerPanel({ stock, setStock }) {
  const update = (id, delta) => {
    setStock(s => ({ ...s, [id]: Math.max(0, (s[id] || 0) + delta) }));
  };

  const total = Object.values(stock).reduce((a, b) => a + b, 0);

  return (
    <div style={{ background: "#0c2340", border: "1px solid #1a3a5c", borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#60a5fa" }}>❄️ Stock congélateur</div>
          <div style={{ fontSize: 11, color: "#3b6ca0", marginTop: 1 }}>{total} portions/sachets disponibles</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {FREEZER_CATEGORIES.map(cat => {
          const qty = stock[cat.id] || 0;
          const isEmpty = qty === 0;
          return (
            <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 10, background: isEmpty ? "#1a0800" : "transparent", borderRadius: 8, padding: isEmpty ? "4px 6px" : "4px 6px", margin: "0 -6px" }}>
              <span style={{ fontSize: 18, flexShrink: 0, opacity: isEmpty ? 0.4 : 1 }}>{cat.emoji}</span>
              <span style={{ flex: 1, fontSize: 13, color: isEmpty ? "#c2410c" : "#a0c4e8" }}>{cat.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => update(cat.id, -1)}
                  style={{ background: "#0a1e33", border: "1px solid #1e3d5c", color: "#60a5fa", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
                >−</button>
                <span style={{ minWidth: 24, textAlign: "center", fontWeight: 700, color: isEmpty ? "#c2410c" : "#60a5fa", fontSize: 15 }}>{qty}</span>
                <button
                  onClick={() => update(cat.id, 1)}
                  style={{ background: "#0a1e33", border: "1px solid #1e3d5c", color: "#60a5fa", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
                >+</button>
              </div>
              {isEmpty
                ? <span style={{ fontSize: 10, color: "#c2410c", fontWeight: 700, minWidth: 70, textAlign: "right" }}>⚠ Épuisé</span>
                : <span style={{ fontSize: 11, color: "#3b6ca0", minWidth: 70 }}>{cat.unit}</span>
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}
