import React, { useState, useEffect } from "react";
import { CATEGORY_FORMS, WaterForm } from "./forms.jsx";
import { fmtNiceDate } from "../constants.js";

export default function CategoryModal({ theme, category, dayEntry, onClose, onSave, waterTarget, onWaterTarget, getHistory }) {
  const [local, setLocal] = useState(dayEntry?.[category.id] || {});
  const [history, setHistory] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { setLocal(dayEntry?.[category.id] || {}); }, [category.id]);

  const Form = CATEGORY_FORMS[category.id];
  const save = (patch) => { setLocal(patch); onSave(category.id, patch); };

  const loadHistory = async () => {
    setShowHistory((v) => !v);
    if (!history) {
      try {
        const h = await getHistory();
        setHistory(h);
      } catch {
        setHistory([]);
      }
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(30,20,15,0.35)", zIndex: 10001, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} className="mwt-fadeup" style={{ background: theme.paper, borderRadius: "24px 24px 0 0", padding: "22px 20px max(36px, env(safe-area-inset-bottom))", width: "100%", maxWidth: 460, maxHeight: "calc(100dvh - 32px)", overflowY: "auto" }}>
        <div style={{ width: 40, height: 4, borderRadius: 4, background: theme.border, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 26 }}>{category.emoji}</span>
          <h3 className="font-display" style={{ margin: 0, fontSize: 20, color: theme.ink }}>{category.label}</h3>
        </div>

        {category.id === "water"
          ? <WaterForm data={local} onChange={save} theme={theme} target={waterTarget} onTargetChange={onWaterTarget} />
          : Form
            ? <Form data={local} onChange={save} theme={theme} />
            : <p style={{ color: theme.ink, opacity: 0.6 }}>Tap the card on the dashboard to toggle this habit.</p>}

        <button onClick={loadHistory} style={{ marginTop: 16, background: "none", border: "none", color: theme.accent, fontWeight: 700, fontSize: 12.5, cursor: "pointer", padding: 0 }}>
          {showHistory ? "Hide edit history" : "View edit history"}
        </button>

        {showHistory && (
          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            {history === null && <div style={{ fontSize: 12.5, opacity: 0.6 }}>Loading…</div>}
            {history?.length === 0 && <div style={{ fontSize: 12.5, opacity: 0.6 }}>No previous edits for this day yet.</div>}
            {history?.slice().reverse().map((h, i) => (
              <div key={i} style={{ fontSize: 11.5, background: theme.bg, borderRadius: 10, padding: "8px 10px", color: theme.ink, opacity: 0.75 }}>
                Saved {new Date(h.savedAt).toLocaleString()}
              </div>
            ))}
          </div>
        )}

        <button onClick={onClose} style={{ marginTop: 20, width: "100%", padding: "12px", borderRadius: 14, border: "none", background: theme.accent, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Done ✓</button>
      </div>
    </div>
  );
}
