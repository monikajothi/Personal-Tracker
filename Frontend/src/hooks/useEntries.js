import { useState, useEffect, useCallback } from "react";
import { entriesApi } from "../api/index.js";
import { addDays, todayStr } from "../constants.js";

// Keeps ~4 months of history in memory — enough for calendar + analytics
// without pulling a user's entire multi-year history on every load.
const RANGE_DAYS = 120;

export function useEntries(enabled) {
  const [entries, setEntries] = useState({});
  const [loaded, setLoaded] = useState(false);

  const refetch = useCallback(async () => {
    const start = addDays(todayStr(), -RANGE_DAYS);
    const end = todayStr();
    const data = await entriesApi.range(start, end);
    setEntries(data);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refetch().catch((err) => {
      console.error("Failed to load entries:", err);
      setLoaded(true);
    });
  }, [enabled, refetch]);

  const saveCategory = useCallback(async (date, category, data) => {
    // optimistic update so the UI feels instant
    setEntries((prev) => ({ ...prev, [date]: { ...(prev[date] || {}), [category]: data } }));
    try {
      const saved = await entriesApi.save(date, category, data);
      setEntries((prev) => ({ ...prev, [date]: saved }));
    } catch (err) {
      console.error("Failed to save entry, refetching to stay in sync:", err);
      refetch().catch(() => {});
    }
  }, [refetch]);

  const toggleHabit = useCallback(async (date, habitId) => {
    const current = entries[date]?.habits || {};
    const nextHabits = { ...current, [habitId]: !current[habitId] };
    await saveCategory(date, "habits", nextHabits);
  }, [entries, saveCategory]);

  const getHistory = useCallback((date) => entriesApi.history(date), []);

  return { entries, loaded, saveCategory, toggleHabit, getHistory, refetch };
}
