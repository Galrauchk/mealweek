import React, { useState } from "react";
import { DAYS, BATCH_DAYS, SOURCE_STYLE } from "../utils/constants";
import { Badge, GhostCard, PrimaryBtn, SecondaryBtn, IconBtn, Spinner } from "./UI.jsx";
import FreezerPanel from "./FreezerPanel.jsx";
import BatchTracker from "./BatchTracker.jsx";

function MealCard({ day, slot, meal, loading, disabled, onRegen }) {
  const isBatch = meal?.batch;

  return (
    <div style={{ background: "#0f0f0f", borderRadius: 12, padding: "12px 13px", border: "1px solid #1a1a1a", marginTop: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
          color: slot === "midi" ? "#60a5fa" : "#c084fc",
        }}>
          {slot === "midi" ? "☀ Midi" : "🌙 Soir"}
        </span>
        <IconBtn onClick={onRegen} loading={loading} disabled={disabled}>
          {!loading && <>↻ changer</>}
        </IconBtn>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#555", fontSize: 13, padding: "4px 0" }}>
          <Spinner size={14} color="#555" /> Génération…
        </div>
      ) : meal ? (
        <>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{meal.nom}</div>
          <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5, marginBottom: 8 }}>{meal.description}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <Badge type={meal.source} />
            {isBatch && <Badge type="batch" />}
            {meal.freezer_item && (
              <span style={{ background: "#0c2340", color: "#60a5fa", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>
                ❄️ {meal.freezer_item}
              </span>
            )}
          </div>
          {meal.decongel_note && (
            <div style={{ marginTop: 8, background: "#1a1300", border: "1px solid #3a2e00", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "#d4af37", lineHeight: 1.4 }}>
              ⚠️ {meal.decongel_note}
            </div>
          )}
          {meal.batch_portions && (
            <div style={{ marginTop: 6, fontSize: 11, color: "#fb923c" }}>
              🥘 Prépare {meal.batch_portions} portions — utilisées sur {meal.batch_used_days?.join(" + ")}
            </div>
          )}
        </>
      ) : (
        <div style={{ color: "#333", fontSize: 13, fontStyle: "italic" }}>Non généré</div>
      )}
    </div>
  );
}

export default function PlanningTab({
  plan, weekDates, weekLabel, weekOff, setWeekOff,
  batches, freezerStock, setFreezerStock,
  loadingWeek, loadingCell, onGenWeek, onRegenDay, onRegenMeal, onGenCourses,
}) {
  const [open, setOpen] = useState(null);
  const [showFreezer, setShowFreezer] = useState(false);
  const hasPlan = Object.keys(plan).length > 0;

  return (
    <div>
      {/* Week nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <button onClick={() => setWeekOff(w => w - 1)}
          style={{ background: "#141414", border: "1px solid #1e1e1e", color: "#f0ebe0", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 18, flexShrink: 0 }}>‹</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Semaine du</div>
          <div style={{ fontSize: 11, color: "#666" }}>{weekLabel}</div>
        </div>
        <button onClick={() => setWeekOff(w => w + 1)}
          style={{ background: "#141414", border: "1px solid #1e1e1e", color: "#f0ebe0", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 18, flexShrink: 0 }}>›</button>
      </div>

      {/* Batch session pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <div style={{ flex: 1, background: "#1a1300", border: "1px solid #3a2e00", borderRadius: 9, padding: "7px 10px", fontSize: 11, color: "#d4af37", fontWeight: 600, textAlign: "center" }}>🍳 Dim. APM batch</div>
        <div style={{ flex: 1, background: "#1a1300", border: "1px solid #3a2e00", borderRadius: 9, padding: "7px 10px", fontSize: 11, color: "#d4af37", fontWeight: 600, textAlign: "center" }}>🍳 Mer. APM batch</div>
      </div>

      {/* Badges legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {Object.entries(SOURCE_STYLE).map(([k, v]) => (
          <span key={k} style={{ background: v.bg, color: v.color, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>{v.label}</span>
        ))}
      </div>

      {/* Freezer toggle */}
      <button onClick={() => setShowFreezer(s => !s)}
        style={{ background: "#0c2340", border: "1px solid #1a3a5c", color: "#60a5fa", borderRadius: 10, padding: "9px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, width: "100%", marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>
        ❄️ {showFreezer ? "Masquer" : "Gérer"} le stock congélateur
      </button>

      {showFreezer && <FreezerPanel stock={freezerStock} setStock={setFreezerStock} />}

      {/* Batch tracker */}
      <BatchTracker batches={batches} />

      {/* Generate */}
      <PrimaryBtn onClick={onGenWeek} loading={loadingWeek} style={{ marginBottom: 10 }}>
        ✨ {hasPlan ? "Régénérer la semaine" : "Générer la semaine"}
      </PrimaryBtn>

      {hasPlan && (
        <SecondaryBtn onClick={onGenCourses} disabled={loadingWeek} style={{ marginBottom: 14 }}>
          🛒 Générer la liste de courses
        </SecondaryBtn>
      )}

      {!hasPlan && !loadingWeek && (
        <GhostCard emoji="🍴" title="Planning vide" subtitle="Appuyez sur 'Générer la semaine' pour démarrer" />
      )}

      {/* Day accordion */}
      {DAYS.map((day, i) => {
        const dd = plan[day];
        const isBatch = BATCH_DAYS[day];
        const isOpen = open === day;
        const dayLoad = loadingCell === `${day}_day`;

        return (
          <div key={day} style={{ background: "#141414", borderRadius: 14, border: "1px solid #1e1e1e", marginBottom: 8, overflow: "hidden" }}>
            {/* Header */}
            <div onClick={() => setOpen(isOpen ? null : day)}
              style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
              <div style={{ width: 42, height: 42, background: isBatch ? "#d4af37" : "#1a1a1a", borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: isBatch ? "#0a0a0a" : "#888", lineHeight: 1.1 }}>{day.slice(0, 3).toUpperCase()}</span>
                <span style={{ fontSize: 9, color: isBatch ? "#0a0a0a80" : "#555" }}>{weekDates[i]}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{day}{isBatch ? " 🍳" : ""}</div>
                <div style={{ fontSize: 11, color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {dd ? `${dd.midi?.nom || "—"} · ${dd.soir?.nom || "—"}` : "Non planifié"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                {dd && (
                  <IconBtn onClick={e => { e.stopPropagation(); onRegenDay(day); }} loading={dayLoad} disabled={loadingWeek || !!loadingCell}>
                    {!dayLoad && "↻"}
                  </IconBtn>
                )}
                <span style={{ color: "#333", fontSize: 14 }}>{isOpen ? "▴" : "▾"}</span>
              </div>
            </div>

            {/* Expanded */}
            {isOpen && (
              <div style={{ padding: "0 12px 12px", borderTop: "1px solid #1a1a1a" }}>
                {["midi", "soir"].map(slot => (
                  <MealCard
                    key={slot}
                    day={day} slot={slot}
                    meal={dd?.[slot]}
                    loading={loadingCell === `${day}_${slot}`}
                    disabled={loadingWeek || (!!loadingCell && loadingCell !== `${day}_${slot}`)}
                    onRegen={() => onRegenMeal(day, slot)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
