import { useState, useEffect, useCallback } from "react";
import { settingsApi } from "../api/index.js";

const DEFAULTS = {
  theme: "sakura", isDark: false, animationsOn: true, companion: "cat",
  waterTarget: 8, essentials: ["sleep", "water", "mood", "movement"],
  customHabits: [], cycleEnabled: true, reminders: { enabled: false, time: "20:00" },
  hydration: {
    enabled: false,
    targetMl: 2000,
    cupMl: 250,
    startTime: "08:00",
    endTime: "20:00",
    minIntervalMin: 30,
    maxIntervalMin: 180,
    snoozeMin: 30,
    quietHours: { start: "22:00", end: "07:00" },
  },
};

export function useSettings(enabled) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    settingsApi.get()
      .then((s) => setSettings({
        ...DEFAULTS,
        ...s,
        // Deep-merge these two specifically — a shallow spread would let a
        // partially-saved hydration/reminders object silently wipe out
        // fields it didn't include, instead of falling back to defaults.
        hydration: { ...DEFAULTS.hydration, ...(s.hydration || {}) },
        reminders: { ...DEFAULTS.reminders, ...(s.reminders || {}) },
      }))
      .catch((err) => console.error("Failed to load settings:", err))
      .finally(() => setLoaded(true));
  }, [enabled]);

  const saveSettings = useCallback(async (next) => {
    setSettings(next); // optimistic
    try {
      const saved = await settingsApi.save(next);
      setSettings((prev) => ({
        ...prev,
        ...saved,
        hydration: { ...DEFAULTS.hydration, ...(prev.hydration || {}), ...(saved.hydration || {}) },
        reminders: { ...DEFAULTS.reminders, ...(prev.reminders || {}), ...(saved.reminders || {}) },
      }));
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  }, []);

  return { settings, loaded, saveSettings };
}