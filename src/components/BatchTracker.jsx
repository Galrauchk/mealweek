import React from "react";

export default function BatchTracker({ batches }) {
  if (!batches || Object.keys(batches).length === 0) return null;

  const available = Object.entries(batches).filter(([, b]) => b.remaining > 0);
  if (available.length === 0) return null;

  return (
    <div style={{ background: "#2d1a00", border: "1px solid #4a2e00", borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#fb923c", marginBottom: 10 }}>🥘 Portions batch disponibles</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {available.map(([key, b]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "#f0ebe0", fontWeight: 600 }}>{b.nom}</div>
              <div style={{ fontSize: 11, color: "#a06030", marginTop: 1 }}>Préparé le {b.day}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {Array.from({ length: b.total }).map((_, i) => (
                  <div key={i} style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: i < b.remaining ? "#fb923c" : "#2a1800",
                    border: "1px solid #4a2e00",
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 12, color: "#fb923c", fontWeight: 700 }}>{b.remaining}/{b.total}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
