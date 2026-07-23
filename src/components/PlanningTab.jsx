import React, { useState } from "react";
import { DAYS, BATCH_DAYS, SOURCE_STYLE } from "../utils/constants";
import { Badge, GhostCard, PrimaryBtn, SecondaryBtn, IconBtn, Spinner } from "./UI.jsx";
import FreezerPanel from "./FreezerPanel.jsx";
import BatchTracker from "./BatchTracker.jsx";

function ValidationRow({ validation, day, slot, onValidate, disabled }) {
  const people = [
    { id: "jeffrey", label: "Jeffrey", emoji: "💪" },
    { id: "laurine", label: "Laurine", emoji: "🌿" },
  ];

  const bothApproved = validation?.jeffrey === true && validation?.laurine === true;

  return (
    <div style={{ marginTop: 11 }}>
      {bothApproved ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#052e16", border: "1px solid #14532d", borderRadius: 12, padding: "8px 12px" }}>
          <span style={{ fontSize: 14 }}>✅</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#4ade80" }}>Approuvé par Jeffrey & Laurine</span>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 6 }}>
          {people.map(({ id, label, emoji }) => {
            const state = validation?.[id]; // null | true
            return (
              <div key={id} style={{
                flex: 1, borderRadius: 12, padding: "8px 10px",
                background: state === true ? "#052e16" : "#161412",
                border: `1px solid ${state === true ? "#14532d" : "#2a2320"}`,
                transition: "all .2s",
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: state === true ? "#4ade80" : "#5a5450", marginBottom: state === true ? 0 : 7 }}>
                  {emoji} {label}
                </div>
                {state === true ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 700 }}>✓ OK !</span>
                    <button
                      onClick={() => !disabled && onValidate(day, slot, id, null)}
                      disabled={disabled}
                      style={{ background: "none", border: "none", color: "#3a3530", fontSize: 11, cursor: "pointer", padding: 0 }}>
                      annuler
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 5 }}>
                    <button
                      onClick={() => !disabled && onValidate(day, slot, id, true)}
                      disabled={disabled}
                      style={{ flex: 1, background: "#0a2e14", border: "1px solid #14532d", color: "#4ade80", borderRadius: 8, padding: "6px 0", fontSize: 14, cursor: disabled ? "default" : "pointer", fontWeight: 700, opacity: disabled ? 0.4 : 1 }}>
                      ✓
                    </button>
                    <button
                      onClick={() => !disabled && onValidate(day, slot, id, false)}
                      disabled={disabled}
                      style={{ flex: 1, background: "#2d0707", border: "1px solid #7f1d1d", color: "#f87171", borderRadius: 8, padding: "6px 0", fontSize: 14, cursor: disabled ? "default" : "pointer", fontWeight: 700, opacity: disabled ? 0.4 : 1 }}>
                      ✗
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MealCard({ day, slot, meal, loading, disabled, validation, onRegen, onValidate }) {
  const isBatch = meal?.batch;
  const bothApproved = validation?.jeffrey === true && validation?.laurine === true;

  return (
    <div style={{
      background: "#0f0d0c",
      borderRadius: 14, padding: "13px 14px",
      border: `1px solid ${bothApproved ? "#14532d" : "#2a2320"}`,
      marginTop: 8,
      boxShadow: bothApproved ? "0 0 0 1px #14532d20" : "none",
      transition: "border-color .3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
          color: slot === "midi" ? "#fbbf24" : "#c084fc",
        }}>
          {slot === "midi" ? "☀️ Déjeuner" : "🌙 Dîner"}
        </span>
        <IconBtn onClick={onRegen} loading={loading} disabled={disabled || bothApproved}>
          {!loading && <>↻ changer</>}
        </IconBtn>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4a4540", fontSize: 13, padding: "4px 0" }}>
          <Spinner size={14} color="#666" /> Inspiration en cours…
        </div>
      ) : meal ? (
        <>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, lineHeight: 1.3 }}>{meal.nom}</div>
          <div style={{ fontSize: 12, color: "#5a5450", lineHeight: 1.6, marginBottom: 9 }}>{meal.description}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <Badge type={meal.source} />
            {isBatch && <Badge type="batch" />}
            {meal.freezer_item && (
              <span style={{ background: "#0c2340", color: "#60a5fa", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                ❄️ {meal.freezer_item}
              </span>
            )}
          </div>
          {meal.decongel_note && (
            <div style={{ marginTop: 9, background: "#1a1200", border: "1px solid #3a2800", borderRadius: 10, padding: "7px 11px", fontSize: 11, color: "#d4af37", lineHeight: 1.5 }}>
              ⚠️ {meal.decongel_note}
            </div>
          )}
          {meal.batch_portions && (
            <div style={{ marginTop: 7, fontSize: 11, color: "#fb923c", lineHeight: 1.5 }}>
              🥘 Prépare {meal.batch_portions} portions · {meal.batch_used_days?.join(" + ")}
            </div>
          )}

          <ValidationRow
            validation={validation}
            day={day} slot={slot}
            onValidate={onValidate}
            disabled={disabled || loading}
          />
        </>
      ) : (
        <div style={{ color: "#2e2820", fontSize: 13, fontStyle: "italic" }}>Pas encore planifié</div>
      )}
    </div>
  );
}

export default function PlanningTab({
  plan, weekDates, weekLabel, weekOff, setWeekOff,
  batches, freezerStock, setFreezerStock,
  validations, onValidate,
  loadingWeek, loadingCell, onGenWeek, onRegenDay, onRegenMeal, onGenCourses,
}) {
  const [open, setOpen] = useState(null);
  const [showFreezer, setShowFreezer] = useState(false);
  const hasPlan = Object.keys(plan).length > 0;

  // Compte les repas validés par les deux
  const totalMeals = DAYS.reduce((n, day) => n + (plan[day] ? 2 : 0), 0);
  const approvedMeals = Object.values(validations).filter(v => v?.jeffrey === true && v?.laurine === true).length;

  return (
    <div>
      {/* Week nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button onClick={() => setWeekOff(w => w - 1)}
          style={{ background: "#161412", border: "1px solid #2e2820", color: "#f0ebe0", borderRadius: 12, padding: "10px 16px", cursor: "pointer", fontSize: 18, flexShrink: 0 }}>‹</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f0ebe0" }}>
            {weekOff === 0 ? "Cette semaine ✨" : weekOff === 1 ? "Semaine prochaine" : weekOff === -1 ? "Semaine dernière" : `Semaine +${weekOff}`}
          </div>
          <div style={{ fontSize: 11, color: "#4a4540", marginTop: 2 }}>{weekLabel}</div>
        </div>
        <button onClick={() => setWeekOff(w => w + 1)}
          style={{ background: "#161412", border: "1px solid #2e2820", color: "#f0ebe0", borderRadius: 12, padding: "10px 16px", cursor: "pointer", fontSize: 18, flexShrink: 0 }}>›</button>
      </div>

      {/* Progression validation */}
      {hasPlan && totalMeals > 0 && (
        <div style={{ background: "#141210", border: "1px solid #2a2320", borderRadius: 14, padding: "11px 14px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#f0ebe0" }}>Repas approuvés par les deux</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: approvedMeals === totalMeals ? "#4ade80" : "#e8c14e" }}>
              {approvedMeals}/{totalMeals}
            </span>
          </div>
          <div style={{ height: 5, background: "#1e1c1a", borderRadius: 3 }}>
            <div style={{
              height: "100%", borderRadius: 3,
              background: approvedMeals === totalMeals ? "#4ade80" : "linear-gradient(90deg, #e8c14e, #d4914a)",
              width: `${totalMeals ? (approvedMeals / totalMeals) * 100 : 0}%`,
              transition: "width .4s",
            }} />
          </div>
          {approvedMeals === totalMeals && (
            <div style={{ fontSize: 11, color: "#4ade80", marginTop: 6, fontWeight: 600 }}>
              🎉 Toute la semaine est validée !
            </div>
          )}
        </div>
      )}

      {/* Batch session pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["🍳 Dimanche — Batch cooking", "🍳 Mercredi — Batch cooking"].map(label => (
          <div key={label} style={{ flex: 1, background: "#1a1200", border: "1px solid #3a2800", borderRadius: 12, padding: "8px 10px", fontSize: 10, color: "#d4af37", fontWeight: 700, textAlign: "center", lineHeight: 1.4 }}>{label}</div>
        ))}
      </div>

      {/* Badges legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
        {Object.entries(SOURCE_STYLE).map(([k, v]) => (
          <span key={k} style={{ background: v.bg, color: v.color, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>{v.label}</span>
        ))}
      </div>

      {/* Freezer toggle */}
      <button onClick={() => setShowFreezer(s => !s)}
        style={{ background: "#0c1e33", border: "1px solid #1a3a5c", color: "#60a5fa", borderRadius: 12, padding: "10px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, width: "100%", marginBottom: 12, fontFamily: "'DM Sans',sans-serif" }}>
        ❄️ {showFreezer ? "Masquer" : "Gérer"} le stock congélateur
      </button>

      {showFreezer && <FreezerPanel stock={freezerStock} setStock={setFreezerStock} />}

      {/* Batch tracker */}
      <BatchTracker batches={batches} />

      {/* Generate */}
      <PrimaryBtn onClick={onGenWeek} loading={loadingWeek} style={{ marginBottom: 10 }}>
        {!loadingWeek && (hasPlan ? "✨ Nouvelle semaine" : "✨ Créer notre menu de la semaine")}
      </PrimaryBtn>

      {hasPlan && (
        <SecondaryBtn onClick={onGenCourses} disabled={loadingWeek} style={{ marginBottom: 16 }}>
          🛍 Générer la liste de courses
        </SecondaryBtn>
      )}

      {!hasPlan && !loadingWeek && (
        <GhostCard
          emoji="🍽️"
          title="Rien de prévu encore !"
          subtitle={"Génère votre menu de la semaine et laissez-vous inspirer 🌿\nDîners en duo, batch cooking du dimanche, le tout sans prise de tête."}
        />
      )}

      {/* Day accordion */}
      {DAYS.map((day, i) => {
        const dd = plan[day];
        const isBatch = BATCH_DAYS[day];
        const isOpen = open === day;
        const dayLoad = loadingCell === `${day}_day`;

        const dayApproved = dd && ["midi", "soir"].every(s => {
          const v = validations[`${day}_${s}`];
          return v?.jeffrey === true && v?.laurine === true;
        });

        return (
          <div key={day} style={{ background: "#141210", borderRadius: 16, border: `1px solid ${dayApproved ? "#14532d" : isBatch ? "#3a2800" : "#2a2320"}`, marginBottom: 8, overflow: "hidden" }}>
            {/* Header */}
            <div onClick={() => setOpen(isOpen ? null : day)}
              style={{ padding: "13px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
              <div style={{
                width: 44, height: 44,
                background: dayApproved
                  ? "linear-gradient(135deg, #14532d, #166534)"
                  : isBatch ? "linear-gradient(135deg, #e8c14e, #d4914a)" : "#1c1a18",
                borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {dayApproved
                  ? <span style={{ fontSize: 18 }}>✅</span>
                  : <>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isBatch ? "#0a0a0a" : "#666", lineHeight: 1.1 }}>{day.slice(0, 3).toUpperCase()}</span>
                    <span style={{ fontSize: 9, color: isBatch ? "#0a0a0a90" : "#444" }}>{weekDates[i]}</span>
                  </>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
                  {day}{isBatch ? " 🍳" : ""}
                  {dayApproved && <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 600, marginLeft: 6 }}>· validé ✓</span>}
                </div>
                <div style={{ fontSize: 11, color: "#4a4540", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {dd ? `${dd.midi?.nom || "—"} · ${dd.soir?.nom || "—"}` : <span style={{ color: "#2e2820", fontStyle: "italic" }}>Pas encore planifié</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                {dd && (
                  <IconBtn onClick={e => { e.stopPropagation(); onRegenDay(day); }} loading={dayLoad} disabled={loadingWeek || !!loadingCell}>
                    {!dayLoad && "↻"}
                  </IconBtn>
                )}
                <span style={{ color: "#3a3530", fontSize: 13 }}>{isOpen ? "▴" : "▾"}</span>
              </div>
            </div>

            {/* Expanded */}
            {isOpen && (
              <div style={{ padding: "0 12px 14px", borderTop: "1px solid #2a2320" }}>
                {["midi", "soir"].map(slot => (
                  <MealCard
                    key={slot}
                    day={day} slot={slot}
                    meal={dd?.[slot]}
                    loading={loadingCell === `${day}_${slot}`}
                    disabled={loadingWeek || (!!loadingCell && loadingCell !== `${day}_${slot}`)}
                    validation={validations[`${day}_${slot}`]}
                    onValidate={onValidate}
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
