import React, { useMemo, useState } from "react";
import { Panel, SectionTitle } from "../components/ui.jsx";
import MonthWrapModal from "../components/MonthWrapModal.jsx";
import { DEFAULT_CATEGORIES, todayStr, addDays, fmtNiceDate, isCategoryDone } from "../constants.js";
import { useAuth } from "../hooks/useAuth.jsx";

// Streak counts consecutive tracked days, but forgives one missed day per
// every 7 tracked days (a "streak freeze") so one bad day doesn't erase
// weeks of consistency. The freeze is silent — no separate UI state to manage.
function computeStreak(entries) {
  let streak = 0;
  let cursor = todayStr();
  if (!entries[cursor] || Object.keys(entries[cursor]).length === 0) cursor = addDays(cursor, -1);

  let freezeAvailable = true;
  let sinceLastFreeze = 0;

  while (true) {
    const tracked = entries[cursor] && Object.keys(entries[cursor]).length > 0;
    if (tracked) {
      streak++;
      sinceLastFreeze++;
      if (sinceLastFreeze >= 7) { freezeAvailable = true; sinceLastFreeze = 0; }
    } else if (freezeAvailable) {
      freezeAvailable = false;
      sinceLastFreeze = 0;
    } else {
      break;
    }
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function useLastNDays(entries, n) {
  return useMemo(() => {
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const ds = addDays(todayStr(), -i);
      out.push({ date: ds, label: new Date(ds + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" }), entry: entries[ds] || {} });
    }
    return out;
  }, [entries, n]);
}

export default function Dashboard({ theme, entries, settings, onOpenCategory, onOpenHabit, animationsOn }) {
  const { user } = useAuth();
  const [wrapOpen, setWrapOpen] = useState(false);
  const t = todayStr();
  const todayEntry = entries[t] || {};
  const cycleVisible = user?.gender === "female" && settings.cycleEnabled;
  const cats = DEFAULT_CATEGORIES.filter((c) => c.id !== "cycle" || cycleVisible);
  const essentials = settings.essentials.filter((id) => cats.some((c) => c.id === id));
  const doneCount = essentials.filter((id) => isCategoryDone(id, todayEntry[id])).length;
  const pct = essentials.length ? Math.round((doneCount / essentials.length) * 100) : 0;
  const streak = useMemo(() => computeStreak(entries), [entries]);
  const hour = new Date().getHours();
  // const name = user?.name?.trim() || "there";
  const fullName = user?.name?.trim();
  const name = fullName ? fullName.split(/\s+/)[0] : "there";

  const greeting =
    hour < 5
      ? `Still up, ${name}? 🌙`
      : hour < 12
      ? `Good morning, ${name} 🌤️`
      : hour < 17
      ? `Good afternoon, ${name} ☀️`
      : hour < 21
      ? `Good evening, ${name} 🌆`
      : `Winding down, ${name}? 🌙`;
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
      <div style={{ marginBottom: 18 }}>
        <div className="font-display" style={{ fontSize: 26, fontWeight: 600, color: theme.ink }}>{greeting}</div>
        <div style={{ fontSize: 13.5, opacity: 0.6, marginTop: 2 }}>{fmtNiceDate(t)}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <StatCard theme={theme} emoji="🔥" value={streak} label="day streak" />
        <StatCard theme={theme} emoji="💗" value={`${pct}%`} label="today's check-in" />
      </div>

      {pct === 100 && essentials.length > 0 && (
        <Panel theme={theme} style={{ textAlign: "center", marginBottom: 16, background: theme.soft, border: "none" }}>
          <div className={animationsOn ? "mwt-pop" : ""} style={{ fontSize: 15, fontWeight: 800, color: theme.ink }}>
            🎉 Today's little check-in is complete! 🌷✨<br />
            <span style={{ fontWeight: 600, fontSize: 13, opacity: 0.75 }}>See you tomorrow 🐾💗</span>
          </div>
        </Panel>
      )}

      <SectionTitle theme={theme} sub="Swipe →">🌷 Today's Check-In</SectionTitle>
      <div className="mwt-scroll" style={{
        display: "flex", gap: 10, overflowX: "auto", scrollSnapType: "x mandatory",
        paddingBottom: 10, marginBottom: 10, marginInline: -16, paddingInline: 16,
      }}>
        {cats.map((c) => {
          const done = isCategoryDone(c.id, todayEntry[c.id]);
          return (
            <button key={c.id} onClick={() => onOpenCategory(c)} className="mwt-card" style={{
              textAlign: "left", padding: 16, borderRadius: 20, cursor: "pointer",
              border: `1.5px solid ${done ? theme.accent : theme.border}`,
              background: done ? theme.soft : theme.paper, position: "relative",
              flex: "0 0 128px", minWidth: 128, scrollSnapAlign: "start",
            }}>
              <div style={{ fontSize: 26 }}>{c.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: 13.5, color: theme.ink, marginTop: 8 }}>{c.label}</div>
              {done && <div style={{ position: "absolute", top: 10, right: 12, fontSize: 12, color: theme.accent, fontWeight: 800 }}>✓</div>}
            </button>
          );
        })}
        {settings.customHabits.map((h) => {
          const done = !!todayEntry.habits?.[h.id];
          return (
            <button key={h.id} onClick={() => onOpenHabit(h)} className="mwt-card" style={{
              textAlign: "left", padding: 16, borderRadius: 20, cursor: "pointer",
              border: `1.5px solid ${done ? theme.accent : theme.border}`,
              background: done ? theme.soft : theme.paper, position: "relative",
              flex: "0 0 128px", minWidth: 128, scrollSnapAlign: "start",
            }}>
              <div style={{ fontSize: 26 }}>{h.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: 13.5, color: theme.ink, marginTop: 8 }}>{h.name}</div>
              {done && <div style={{ position: "absolute", top: 10, right: 12, fontSize: 12, color: theme.accent, fontWeight: 800 }}>✓</div>}
            </button>
          );
        })}
      </div>

      <SectionTitle theme={theme}>📊 This week</SectionTitle>
      <WeekStrip theme={theme} entries={entries} essentials={essentials} />

      <button onClick={() => setWrapOpen(true)} className="mwt-card" style={{
        width: "100%", marginTop: 16, padding: 16, borderRadius: 18, cursor: "pointer",
        border: "none", background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
        color: "#fff", fontWeight: 800, fontSize: 14, textAlign: "left",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span>✨ See my Month Wrap</span>
        <span style={{ opacity: 0.8 }}>→</span>
      </button>

      {wrapOpen && <MonthWrapModal theme={theme} entries={entries} onClose={() => setWrapOpen(false)} />}
    </div>
  );
}

const StatCard = ({ theme, emoji, value, label }) => (
  <Panel theme={theme} style={{ textAlign: "center" }}>
    <div style={{ fontSize: 26 }}>{emoji}</div>
    <div className="font-display" style={{ fontSize: 24, fontWeight: 700, color: theme.ink }}>{value}</div>
    <div style={{ fontSize: 11.5, opacity: 0.6, fontWeight: 700 }}>{label}</div>
  </Panel>
);

function WeekStrip({ theme, entries, essentials }) {
  const days = useLastNDays(entries, 7);
  return (
    <Panel theme={theme}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {days.map((d) => {
          const doneCount = essentials.filter((id) => isCategoryDone(id, d.entry[id])).length;
          const pct = essentials.length ? doneCount / essentials.length : 0;
          const isToday = d.date === todayStr();
          return (
            <div key={d.date} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, opacity: 0.55 }}>{d.label}</div>
              <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: pct >= 1 ? theme.accent : pct > 0 ? theme.accent2 : theme.bg, border: isToday ? `2px solid ${theme.ink}` : `1px solid ${theme.border}`, fontSize: 11 }}>
                {pct >= 1 ? "✓" : pct > 0 ? "•" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export { useLastNDays };