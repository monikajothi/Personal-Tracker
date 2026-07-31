import React, { useState } from "react";
import { Panel, SectionTitle, Chip, Toggle, inputStyle, btnCircle, TimeInput } from "../components/ui.jsx";
import { THEMES } from "../theme/tokens.js";
import { DEFAULT_CATEGORIES, uid } from "../constants.js";
import { useAuth } from "../hooks/useAuth.jsx";

export default function SettingsView({ theme, settings, onChange }) {
  const { user, logout } = useAuth();
  const [newHabit, setNewHabit] = useState("");
  const cycleVisible = user?.gender === "female";

  const addHabit = () => {
    if (!newHabit.trim()) return;
    onChange({ ...settings, customHabits: [...settings.customHabits, { id: uid(), name: newHabit.trim(), emoji: "🌿" }] });
    setNewHabit("");
  };
  const removeHabit = (id) => onChange({ ...settings, customHabits: settings.customHabits.filter((h) => h.id !== id) });

  return (
    <div>
      <SectionTitle theme={theme}>⚙️ Customize</SectionTitle>

      <Panel theme={theme} style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 4 }}>👋 {user?.name}</div>
        <div style={{ fontSize: 12.5, opacity: 0.6, marginBottom: 10 }}>{user?.email}</div>
        <button onClick={logout} style={{ padding: "8px 14px", borderRadius: 12, border: `1.5px solid ${theme.border}`, background: theme.bg, color: theme.ink, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Log out</button>
      </Panel>

      <Panel theme={theme} style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>🎨 Theme</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(THEMES).map(([key, t]) => <Chip key={key} theme={theme} active={settings.theme === key} onClick={() => onChange({ ...settings, theme: key })}>{t.name}</Chip>)}
        </div>
        <div style={{ marginTop: 12 }}>
          <Toggle on={settings.isDark} onClick={() => onChange({ ...settings, isDark: !settings.isDark })} theme={theme} label="Dark mode" />
        </div>
      </Panel>

      <Panel theme={theme} style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>🐾 Companion</div>
        <div style={{ display: "flex", gap: 8 }}>
          <Chip theme={theme} active={settings.companion === "cat"} onClick={() => onChange({ ...settings, companion: "cat" })}>🐱 Cat</Chip>
          <Chip theme={theme} active={settings.companion === "dog"} onClick={() => onChange({ ...settings, companion: "dog" })}>🐶 Puppy</Chip>
        </div>
        <div style={{ marginTop: 12 }}>
          <Toggle on={settings.animationsOn} onClick={() => onChange({ ...settings, animationsOn: !settings.animationsOn })} theme={theme} label="Animations" />
        </div>
      </Panel>

      <Panel theme={theme} style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>🔔 Reminders</div>
        <Toggle on={settings.reminders?.enabled} onClick={() => onChange({ ...settings, reminders: { ...settings.reminders, enabled: !settings.reminders?.enabled } })} theme={theme} label="Daily check-in reminder" />
        {settings.reminders?.enabled && (
          <div style={{ marginTop: 10 }}>
            <TimeInput
              value={settings.reminders?.time || "20:00"}
              onChange={(t) => onChange({ ...settings, reminders: { ...settings.reminders, time: t } })}
              theme={theme}
              style={{ maxWidth: 240 }}
            />
            <p style={{ fontSize: 11, opacity: 0.55, marginTop: 6, marginBottom: 0 }}>Uses your browser's notification permission — only fires while this tab is open.</p>
          </div>
        )}
      </Panel>

      <Panel theme={theme} style={{ marginBottom: 14 }}>
  <div
    style={{
      fontWeight: 800,
      marginBottom: 10,
    }}
  >
    ⭐ Daily essentials (count toward streak)
  </div>

  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
    }}
  >
    {DEFAULT_CATEGORIES
      .filter((c) => c.id !== "cycle" || cycleVisible)
      .map((c) => (
        <Chip
          key={c.id}
          theme={theme}
          active={settings.essentials.includes(c.id)}
          onClick={() => {
            const has = settings.essentials.includes(c.id);

            onChange({
              ...settings,
              essentials: has
                ? settings.essentials.filter((x) => x !== c.id)
                : [...settings.essentials, c.id],
            });
          }}
        >
          {c.emoji} {c.label}
        </Chip>
      ))}
  </div>

  {cycleVisible && (
    <div style={{ marginTop: 12 }}>
      <Toggle
        on={settings.cycleEnabled}
        onClick={() =>
          onChange({
            ...settings,
            cycleEnabled: !settings.cycleEnabled,
          })
        }
        theme={theme}
        label="Show cycle tracker"
      />
    </div>
  )}
</Panel>

      <Panel theme={theme}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>🌿 Custom habits</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input value={newHabit} onChange={(e) => setNewHabit(e.target.value)} placeholder="e.g. Reading, Meditation…" style={inputStyle(theme)} />
          <button onClick={addHabit} style={{ ...btnCircle(theme), width: 42, borderRadius: 12 }}>+</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {settings.customHabits.map((h) => (
            <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 6, background: theme.soft, borderRadius: 999, padding: "5px 10px" }}>
              <span style={{ fontSize: 13 }}>{h.emoji} {h.name}</span>
              <button onClick={() => removeHabit(h.id)} style={{ border: "none", background: "none", cursor: "pointer", opacity: 0.6 }}>✕</button>
            </div>
          ))}
          {settings.customHabits.length === 0 && <span style={{ fontSize: 13, opacity: 0.5 }}>None yet — add your own above.</span>}
        </div>
      </Panel>
    </div>
  );
}
