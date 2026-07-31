import React from "react";
import { DEFAULT_CATEGORIES, isCategoryDone, fmtNiceDate } from "../constants.js";
import { useAuth } from "../hooks/useAuth.jsx";

// Bottom-sheet listing every category for one specific date (not just today).
// Tapping a card opens the existing CategoryModal for that category, scoped
// to this date — closing it returns here instead of losing the date.
export default function DayDetailModal({ theme, date, entries, settings, onOpenCategory, onToggleHabit, onClose }) {
  const { user } = useAuth();
  const dayEntry = entries[date] || {};
  const cycleVisible = user?.gender === "female" && settings.cycleEnabled;
  const cats = DEFAULT_CATEGORIES.filter((c) => c.id !== "cycle" || cycleVisible);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(30,20,15,0.35)", zIndex: 10000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} className="mwt-fadeup" style={{ background: theme.paper, borderRadius: "24px 24px 0 0", padding: "22px 20px max(36px, env(safe-area-inset-bottom))", width: "100%", maxWidth: 460, maxHeight: "calc(100dvh - 32px)", overflowY: "auto" }}>
        <div style={{ width: 40, height: 4, borderRadius: 4, background: theme.border, margin: "0 auto 16px" }} />
        <h3 className="font-display" style={{ margin: "0 0 4px", fontSize: 20, color: theme.ink }}>{fmtNiceDate(date)}</h3>
        <p style={{ margin: "0 0 16px", fontSize: 12.5, opacity: 0.6 }}>Tap any category to view or edit it for this day.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {cats.map((c) => {
            const done = isCategoryDone(c.id, dayEntry[c.id]);
            return (
              <button key={c.id} onClick={() => onOpenCategory(c)} className="mwt-card" style={{
                textAlign: "left", padding: 14, borderRadius: 18, cursor: "pointer",
                border: `1.5px solid ${done ? theme.accent : theme.border}`,
                background: done ? theme.soft : theme.bg, position: "relative",
              }}>
                <div style={{ fontSize: 22 }}>{c.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: theme.ink, marginTop: 4 }}>{c.label}</div>
                {done && <div style={{ position: "absolute", top: 10, right: 12, fontSize: 12, color: theme.accent, fontWeight: 800 }}>✓</div>}
              </button>
            );
          })}
          {settings.customHabits.map((h) => {
            const done = !!dayEntry.habits?.[h.id];
            return (
              <button key={h.id} onClick={() => onToggleHabit(h)} className="mwt-card" style={{
                textAlign: "left", padding: 14, borderRadius: 18, cursor: "pointer",
                border: `1.5px solid ${done ? theme.accent : theme.border}`,
                background: done ? theme.soft : theme.bg, position: "relative",
              }}>
                <div style={{ fontSize: 22 }}>{h.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: theme.ink, marginTop: 4 }}>{h.name}</div>
                {done && <div style={{ position: "absolute", top: 10, right: 12, fontSize: 12, color: theme.accent, fontWeight: 800 }}>✓</div>}
              </button>
            );
          })}
        </div>

        <button onClick={onClose} style={{ marginTop: 20, width: "100%", padding: "12px", borderRadius: 14, border: `1.5px solid ${theme.border}`, background: theme.bg, color: theme.ink, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Close</button>
      </div>
    </div>
  );
}
