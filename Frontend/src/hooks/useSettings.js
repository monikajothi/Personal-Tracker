import { useState, useEffect, useCallback } from "react";
import { settingsApi } from "../api/index.js";

const DEFAULTS = {
  theme: "sakura",
  isDark: false,
  animationsOn: true,
  companion: "cat",

  waterTarget: 8,
  essentials: ["sleep", "water", "mood", "movement"],
  customHabits: [],
  cycleEnabled: true,

  reminders: {
    enabled: false,
    time: "20:00",
  },

  hydration: {
    enabled: false,
    targetMl: 2500,
    cupMl: 250,
    startTime: "08:00",
    endTime: "20:00",
    minIntervalMin: 30,
    maxIntervalMin: 60,
    snoozeMin: 30,
    adaptive: false,
    repeatEveryMin: "",
    quietHours: {
      start: "22:00",
      end: "07:00",
    },
  },
};

function mergeSettings(saved = {}) {
  return {
    ...DEFAULTS,
    ...saved,

    reminders: {
      ...DEFAULTS.reminders,
      ...(saved.reminders || {}),
    },

    hydration: {
      ...DEFAULTS.hydration,
      ...(saved.hydration || {}),

      quietHours: {
        ...DEFAULTS.hydration.quietHours,
        ...(saved.hydration?.quietHours || {}),
      },
    },

    customHabits: saved.customHabits ?? DEFAULTS.customHabits,
    essentials: saved.essentials ?? DEFAULTS.essentials,
  };
}

export function useSettings(enabled) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  // Load settings once
  useEffect(() => {
    if (!enabled) return;

    let alive = true;

    settingsApi
      .get()
      .then((saved) => {
        if (!alive) return;
        setSettings(mergeSettings(saved));
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
      })
      .finally(() => {
        if (alive) setLoaded(true);
      });

    return () => {
      alive = false;
    };
  }, [enabled]);

  // Save complete settings object
  const saveSettings = useCallback(async (next) => {
    const normalized = mergeSettings(next);

    // Instant UI update
    setSettings(normalized);

    try {
      const saved = await settingsApi.save(normalized);

      if (saved) {
        setSettings((current) =>
          mergeSettings({
            ...current,
            ...saved,
            hydration: {
              ...current.hydration,
              ...(saved.hydration || {}),
            },
          })
        );
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  }, []);

  // Update only hydration settings
  const updateHydration = useCallback(
    async (changes) => {
      const next = {
        ...settings,
        hydration: {
          ...settings.hydration,
          ...changes,
        },
      };

      await saveSettings(next);
    },
    [settings, saveSettings]
  );

  return {
    settings,
    loaded,
    saveSettings,
    updateHydration,
  };
}