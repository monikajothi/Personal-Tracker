import { useState, useEffect, useCallback } from "react";
import { settingsApi } from "../api/index.js";

const DEFAULTS = {
  theme: "sakura", isDark: false, animationsOn: true, companion: "cat",
  waterTarget: 8, essentials: ["sleep", "water", "mood", "movement"],
  customHabits: [], cycleEnabled: true, reminders: { enabled: false, time: "20:00" },
};

export function useSettings(enabled) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    settingsApi.get()
      .then((s) => setSettings({ ...DEFAULTS, ...s }))
      .catch((err) => console.error("Failed to load settings:", err))
      .finally(() => setLoaded(true));
  }, [enabled]);

  const saveSettings = useCallback(async (next) => {
    setSettings(next); // optimistic
    try {
      const saved = await settingsApi.save(next);
      setSettings((prev) => ({ ...prev, ...saved }));
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  }, []);

  return { settings, loaded, saveSettings };
}
