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
      padding: "3px 9px", borderRadius: 20,
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
      background: toast.err ? "#7f1d1d" : "#14532d",
      color: "white", padding: "12px 16px", borderRadius: 12,
      fontWeight: 600, fontSize: 14, textAlign: "center",
      animation: "tin .3s ease", boxShadow: "0 8px 32px rgba(0,0,0,.5)",
    }}>
      {toast.msg}
    </div>
  );
}

export function GhostCard({ emoji, title, subtitle, children }) {
  return (
    <div style={{
      background: "#141414", border: "1.5px dashed #222",
      borderRadius: 14, padding: "36px 20px", textAlign: "center",
    }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>{emoji}</div>
      <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 19, marginBottom: 6 }}>{title}</div>
      <div style={{ color: "#555", fontSize: 13, marginBottom: children ? 16 : 0 }}>{subtitle}</div>
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
        background: "#d4af37", color: "#0a0a0a",
        border: "none", borderRadius: 12, padding: "13px",
        fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 15,
        cursor: disabled || loading ? "default" : "pointer",
        width: "100%", display: "flex", alignItems: "center",
        justifyContent: "center", gap: 8,
        opacity: disabled || loading ? 0.45 : 1,
        transition: "opacity .15s",
        ...style,
      }}
    >
      {loading ? <><Spinner color="#0a0a0a" size={16} /> Génération…</> : children}
    </button>
  );
}

export function SecondaryBtn({ onClick, disabled, loading, children, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        background: "#1a1a1a", color: "#f0ebe0",
        border: "1px solid #2a2a2a", borderRadius: 12, padding: "11px",
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
      disabled={disabled}
      style={{
        background: "#1c1c1c", border: "1px solid #252525", color: "#888",
        borderRadius: 8, padding: "5px 10px", fontSize: 12,
        fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
        display: "flex", alignItems: "center", gap: 4,
        whiteSpace: "nowrap", opacity: disabled ? 0.4 : 1,
      }}
    >
      {loading ? <Spinner size={12} /> : children}
    </button>
  );
}

export function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, marginBottom: 2 }}>{children}</div>
      {sub && <div style={{ fontSize: 12, color: "#555" }}>{sub}</div>}
    </div>
  );
}
