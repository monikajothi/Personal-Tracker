import React, { useState, useCallback } from "react";
import { GlobalStyle } from "./components/GlobalStyle.jsx";
import { FloatingDecor, Companion, BottomNav } from "./components/nav-and-companion.jsx";
import CategoryModal from "./components/CategoryModal.jsx";
import DayDetailModal from "./components/DayDetailModal.jsx";
import MicroCelebration from "./components/MicroCelebration.jsx";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";
import { useEntries } from "./hooks/useEntries.js";
import { useSettings } from "./hooks/useSettings.js";
import { useReminders } from "./hooks/useReminders.js";
import { resolveTheme } from "./theme/tokens.js";
import { DEFAULT_CATEGORIES, todayStr, isCategoryDone } from "./constants.js";
import { COMPANIONS } from "./constants.js";

import LoginPage from "./pages/LoginPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CalendarView from "./pages/CalendarPage.jsx";
import AnalyticsView from "./pages/AnalyticsPage.jsx";
import JournalView from "./pages/JournalPage.jsx";
import GardenView from "./pages/GardenPage.jsx";
import SettingsView from "./pages/SettingsPage.jsx";

function AppShell() {
  const { user, ready } = useAuth();

  if (!ready) return <LoadingScreen />;
  if (!user) return <LoginPage />;
  return <TrackerApp />;
}

function LoadingScreen() {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", color: "#888" }}>🌱 loading…</div>;
}

const NAV_IDS = ["home", "calendar", "insights", "journal", "garden", "settings"];

function TrackerApp() {
  const { user } = useAuth();
  const { entries, loaded: entriesLoaded, saveCategory, toggleHabit, getHistory } = useEntries(true);
  const { settings, loaded: settingsLoaded, saveSettings } = useSettings(true);

  const [tab, setTab] = useState("home");
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayDetailOpen, setDayDetailOpen] = useState(false);
  const [celebrateTick, setCelebrateTick] = useState(0);
  const fireCelebration = useCallback(() => setCelebrateTick((n) => n + 1), []);

  const theme = resolveTheme(settings);
  const t = todayStr();
  const editingDay = selectedDay || t;
  const dayEntry = entries[editingDay] || {};
  const isFemaleUser = user?.gender === "female";
  const cycleEnabled = isFemaleUser && settings.cycleEnabled;

  const essentials = settings.essentials.filter((id) => DEFAULT_CATEGORIES.some((c) => c.id === id));
  const todayEntry = entries[t] || {};
  const todayComplete = essentials.length > 0 && essentials.every((id) => isCategoryDone(id, todayEntry[id]));
  useReminders({ enabled: settings.reminders?.enabled, time: settings.reminders?.time, todayComplete });

  const openCategory = useCallback((c) => { setSelectedDay(t); setActiveCategory(c); }, [t]);
  const openHabit = useCallback((h) => {
    const wasDone = !!todayEntry.habits?.[h.id];
    toggleHabit(t, h.id);
    if (!wasDone) fireCelebration();
  }, [t, toggleHabit, todayEntry, fireCelebration]);
  const closeModal = useCallback(() => {
    setActiveCategory(null);
    if (!dayDetailOpen) setSelectedDay(null);
  }, [dayDetailOpen]);

  const openDay = useCallback((d) => { setSelectedDay(d); setDayDetailOpen(true); }, []);
  const closeDayDetail = useCallback(() => { setDayDetailOpen(false); setSelectedDay(null); }, []);
  const openCategoryForSelectedDay = useCallback((c) => setActiveCategory(c), []);
  const toggleHabitForSelectedDay = useCallback((h) => {
    const wasDone = !!dayEntry.habits?.[h.id];
    toggleHabit(editingDay, h.id);
    if (!wasDone) fireCelebration();
  }, [editingDay, dayEntry, toggleHabit, fireCelebration]);

  const saveCategoryWithCelebration = useCallback((catId, patch) => {
    const wasDone = isCategoryDone(catId, dayEntry[catId]);
    saveCategory(editingDay, catId, patch);
    if (!wasDone && isCategoryDone(catId, patch)) fireCelebration();
  }, [editingDay, dayEntry, saveCategory, fireCelebration]);

  if (!entriesLoaded || !settingsLoaded) return <LoadingScreen />;

  return (
    <div className={`mwt ${settings.animationsOn ? "mwt-anim" : ""}`} style={{ minHeight: "100vh", background: theme.bg, color: theme.ink, position: "relative", paddingBottom: 84 }}>
      <GlobalStyle />
      <FloatingDecor
  animationsOn={settings.animationsOn}
  themeKey={settings.theme}
/>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "22px 16px 20px", position: "relative", zIndex: 1 }}>
        {tab === "home" && (
          <Dashboard theme={theme} entries={entries} settings={settings} animationsOn={settings.animationsOn} onOpenCategory={openCategory} onOpenHabit={openHabit} />
        )}
        {tab === "calendar" && (
          <CalendarView theme={theme} entries={entries} essentials={essentials} onSelectDay={openDay} cycleEnabled={cycleEnabled} />
        )}
        {tab === "insights" && <AnalyticsView theme={theme} entries={entries} cycleEnabled={cycleEnabled} />}
        {tab === "journal" && <JournalView theme={theme} entries={entries} onSave={saveCategory} />}
        {tab === "garden" && <GardenView theme={theme} entries={entries} animationsOn={settings.animationsOn} />}
        {tab === "settings" && <SettingsView theme={theme} settings={settings} onChange={saveSettings} />}
      </div>

      {dayDetailOpen && selectedDay && (
        <DayDetailModal
          theme={theme}
          date={selectedDay}
          entries={entries}
          settings={settings}
          onOpenCategory={openCategoryForSelectedDay}
          onToggleHabit={toggleHabitForSelectedDay}
          onClose={closeDayDetail}
        />
      )}

      {activeCategory && (
        <CategoryModal
          theme={theme}
          category={activeCategory}
          dayEntry={dayEntry}
          onClose={closeModal}
          onSave={saveCategoryWithCelebration}
          waterTarget={settings.waterTarget}
          onWaterTarget={(v) => saveSettings({ ...settings, waterTarget: v })}
          getHistory={() => getHistory(editingDay)}
        />
      )}

      <Companion theme={theme} animationsOn={settings.animationsOn} kind={settings.companion} emojiSet={COMPANIONS[settings.companion]} />
      <BottomNav theme={theme} tab={tab} setTab={setTab} />
      {settings.animationsOn && <MicroCelebration trigger={celebrateTick} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}