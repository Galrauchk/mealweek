import React from "react";
import { SOURCE_STYLE } from "../utils/constants";

export function Spinner({ size = 16, color = "#888" }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: `2px solid ${color}30`, borderTopColor: color,
      borderRadius: "50%", animation: "spin .7s linear infinite", flexShrink: 0,
    }} />
  );
}

export function Badge({ type }) {
  const s = SOURCE_STYLE[type] || SOURCE_STYLE.frais;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700,
      padding: "3px 10px", borderRadius: 20,
      display: "inline-block",
    }}>
      {s.label}
    </span>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", top: 12, left: 12, right: 12, zIndex: 9999,
      background: toast.err ? "#7f1d1d" : "linear-gradient(135deg, #14532d, #166534)",
      color: "white", padding: "13px 16px", borderRadius: 16,
      fontWeight: 600, fontSize: 14, textAlign: "center",
      animation: "tin .3s ease", boxShadow: "0 8px 32px rgba(0,0,0,.5)",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    }}>
      {!toast.err && <span>✓</span>}
      {toast.msg}
    </div>
  );
}

export function GhostCard({ emoji, title, subtitle, children }) {
  return (
    <div style={{
      background: "linear-gradient(160deg, #141210, #111010)",
      border: "1.5px dashed #2e2620",
      borderRadius: 20, padding: "40px 24px", textAlign: "center",
    }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>{emoji}</div>
      <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, marginBottom: 6, color: "#f0ebe0" }}>{title}</div>
      <div style={{ color: "#4a4540", fontSize: 13, lineHeight: 1.6, marginBottom: children ? 18 : 0 }}>{subtitle}</div>
      {children}
    </div>
  );
}

export function PrimaryBtn({ onClick, disabled, loading, children, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        background: disabled || loading
          ? "#2a2a2a"
          : "linear-gradient(135deg, #e8c14e, #d4914a)",
        color: disabled || loading ? "#555" : "#0a0a0a",
        border: "none", borderRadius: 16, padding: "14px",
        fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 15,
        cursor: disabled || loading ? "default" : "pointer",
        width: "100%", display: "flex", alignItems: "center",
        justifyContent: "center", gap: 8,
        opacity: disabled || loading ? 0.6 : 1,
        transition: "opacity .15s",
        boxShadow: disabled || loading ? "none" : "0 4px 16px rgba(212,145,74,.25)",
        ...style,
      }}
    >
      {loading ? <><Spinner color="#888" size={16} /> Génération en cours…</> : children}
    </button>
  );
}

export function SecondaryBtn({ onClick, disabled, loading, children, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        background: "#161412", color: "#f0ebe0",
        border: "1px solid #2e2820", borderRadius: 14, padding: "12px",
        fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14,
        cursor: disabled || loading ? "default" : "pointer",
        width: "100%", display: "flex", alignItems: "center",
        justifyContent: "center", gap: 6,
        opacity: disabled || loading ? 0.4 : 1,
        ...style,
      }}
    >
      {loading ? <><Spinner size={14} /> Chargement…</> : children}
    </button>
  );
}

export function IconBtn({ onClick, disabled, loading, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        background: "#1a1714", border: "1px solid #2e2820", color: "#888",
        borderRadius: 10, padding: "6px 11px", fontSize: 12,
        fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
        cursor: disabled || loading ? "default" : "pointer",
        display: "flex", alignItems: "center", gap: 4,
        whiteSpace: "nowrap", opacity: disabled || loading ? 0.4 : 1,
        minHeight: 30,
      }}
    >
      {loading ? <Spinner size={12} /> : children}
    </button>
  );
}

export function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 23, marginBottom: 3, lineHeight: 1.2 }}>{children}</div>
      {sub && <div style={{ fontSize: 12, color: "#4a4540", lineHeight: 1.5 }}>{sub}</div>}
    </div>
  );
}
