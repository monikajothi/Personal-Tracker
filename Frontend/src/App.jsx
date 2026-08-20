import React, {
  useState,
  useCallback,
  lazy,
  Suspense,
} from "react";

import { GlobalStyle } from "./components/GlobalStyle.jsx";
import {
  FloatingDecor,
  Companion,
  BottomNav,
} from "./components/nav-and-companion.jsx";

import { App as CapacitorApp } from "@capacitor/app";
import CategoryModal from "./components/CategoryModal.jsx";
import DayDetailModal from "./components/DayDetailModal.jsx";
import MicroCelebration from "./components/MicroCelebration.jsx";
import SharedJarPage from "./pages/SharedJarPage.jsx";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";
import { useEntries } from "./hooks/useEntries.js";
import { useSettings } from "./hooks/useSettings.js";
import { useReminders } from "./hooks/useReminders.js";
import { useHydrationReminders } from "./hooks/useHydrationReminders.js";

import { resolveTheme } from "./theme/tokens.js";
import {
  DEFAULT_CATEGORIES,
  todayStr,
  isCategoryDone,
  COMPANIONS,
} from "./constants.js";
import { glassesToMl, mlToGlasses } from "./utils/hydration.js";

/* =========================================================
   LAZY LOAD PAGES
   ========================================================= */

const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const CalendarView = lazy(() => import("./pages/CalendarPage.jsx"));
const AnalyticsView = lazy(() => import("./pages/AnalyticsPage.jsx"));
const JournalView = lazy(() => import("./pages/JournalPage.jsx"));
const GardenView = lazy(() => import("./pages/GardenPage.jsx"));
const SettingsView = lazy(() => import("./pages/SettingsPage.jsx"));

/* =========================================================
   APP SHELL
   ========================================================= */

function AppShell() {
  const { user, ready } = useAuth();

  /*
    Authentication itself is localStorage based,
    so this should become ready almost immediately.
  */

  if (!ready) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <LoginPage />
      </Suspense>
    );
  }

  return <TrackerApp />;
}

/* =========================================================
   INITIAL LOADING
   ========================================================= */

function LoadingBrand({ size = 58 }) {
  return (
    <>
      <style>{`
        @keyframes mwt-loading-pulse {
          0% {
            transform: scale(0.88);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
          100% {
            transform: scale(0.88);
            opacity: 0.6;
          }
        }
      `}</style>

      <img
        src="/favicon.png"
        alt="Loading"
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          display: "block",
          animation: "mwt-loading-pulse 2.8s ease-in-out infinite",
          filter: "drop-shadow(0 8px 18px rgba(143, 110, 90, 0.18))",
        }}
      />
    </>
  );
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        fontFamily: "sans-serif",
        color: "#888",
        background: "#fffafc",
      }}
    >
      <LoadingBrand size={60} />

      <div
        style={{
          fontSize: 13,
          opacity: 0.65,
          fontWeight: 600,
          letterSpacing: "0.04em",
        }}
      >
        Growing your space…
      </div>
    </div>
  );
}

/* =========================================================
   PAGE LOADING
   ========================================================= */

function PageLoading({ theme }) {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        color: theme?.ink || "#777",
        fontSize: 14,
        opacity: 0.7,
      }}
    >
      <LoadingBrand size={36} />
      <span>Loading…</span>
    </div>
  );
}

/* =========================================================
   TRACKER APP
   ========================================================= */

function TrackerApp() {
  const { user } = useAuth();

  /*
    IMPORTANT:
    These hooks now run in the background.
    They do NOT block the UI.
  */

  const {
    entries,
    saveCategory,
    toggleHabit,
    getHistory,
  } = useEntries(true);

  const {
    settings,
    saveSettings,
  } = useSettings(true);

  /* =======================================================
     UI STATE
     ======================================================= */

  const [tab, setTab] = useState("home");
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayDetailOpen, setDayDetailOpen] = useState(false);
  const [celebrateTick, setCelebrateTick] = useState(0);

  const fireCelebration = useCallback(() => {
    setCelebrateTick((n) => n + 1);
  }, []);

  /* =======================================================
     DERIVED DATA
     ======================================================= */

  const theme = resolveTheme(settings);

  const t = todayStr();

  const editingDay = selectedDay || t;

  const dayEntry = entries[editingDay] || {};

  const todayEntry = entries[t] || {};
  const QUICK_LOG_KEY = "hydrationQuickLogs";

  // Flush quick hydration logs stored while app was backgrounded.
  const flushQuickHydrationLogs = useCallback(async () => {
    try {
      const raw = localStorage.getItem(QUICK_LOG_KEY);
      if (!raw) return;
      const logs = JSON.parse(raw || "[]");
      if (!Array.isArray(logs) || logs.length === 0) return;

      // Sum cached actions into the same 8-glass model used by the water card.
      const totalMl = logs.reduce((s, l) => s + (Number(l.ml) || 0), 0);
      const totalGlasses = logs.reduce((s, l) => s + (Number(l.glasses) || 0), 0);
      const addGlasses = totalGlasses + mlToGlasses(totalMl, settings);
      if (addGlasses > 0) {
        const current = todayEntry.water?.glasses || 0;
        saveCategory(t, "water", { glasses: current + addGlasses });
      }

      // clear cache
      localStorage.removeItem(QUICK_LOG_KEY);
    } catch (err) {
      console.error("Failed to flush quick hydration logs:", err);
    }
  }, [saveCategory, t, todayEntry, settings.hydration]);

  // Run flush when app becomes visible / active
  React.useEffect(() => {
    // Browser visibility
    const onVis = () => {
      if (document.visibilityState === "visible") flushQuickHydrationLogs();
    };
    document.addEventListener("visibilitychange", onVis);

    // Capacitor app state
    // NEW:
const appListenerPromise = CapacitorApp.addListener("appStateChange", (state) => {
  if (state.isActive) flushQuickHydrationLogs();
});

    // Also attempt an immediate flush on mount if the document is visible
    if (document.visibilityState === "visible") {
      flushQuickHydrationLogs();
    }

    // Listen for immediate flush requests from native action handlers
    const onQuickFlush = () => flushQuickHydrationLogs();
    window.addEventListener("hydration-quicklog-flush", onQuickFlush);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      appListenerPromise.then((appListener) => {
        if (appListener && typeof appListener.remove === "function") {
          appListener.remove();
        }
      });
      window.removeEventListener("hydration-quicklog-flush", onQuickFlush);
    };
  }, [flushQuickHydrationLogs]);

  const isFemaleUser = user?.gender === "female";

  const cycleEnabled =
    isFemaleUser && settings.cycleEnabled;

  const essentials = settings.essentials.filter((id) =>
    DEFAULT_CATEGORIES.some((c) => c.id === id)
  );

  const doneTodayCount = essentials.filter((id) =>
    isCategoryDone(id, todayEntry[id])
  ).length;

  const progressPct = essentials.length
    ? Math.round((doneTodayCount / essentials.length) * 100)
    : 0;

  const todayComplete =
    essentials.length > 0 &&
    essentials.every((id) =>
      isCategoryDone(id, todayEntry[id])
    );

  /* =======================================================
     REMINDERS
     ======================================================= */

  useReminders({
    enabled: settings.reminders?.enabled,
    time: settings.reminders?.time,
    todayComplete,
  });

  // Hydration reminders: schedules adaptive water reminders based on
  // settings and today's logged water. Uses native LocalNotifications
  // when available and falls back to browser notifications.
  const todayMl = glassesToMl(todayEntry.water?.glasses || 0, settings);

  const logWaterMl = (ml) => {
    const addGlasses = mlToGlasses(ml, settings);
    saveCategory(t, "water", { glasses: (todayEntry.water?.glasses || 0) + addGlasses });
  };

  const logWaterGlasses = (glasses) => {
    saveCategory(t, "water", { glasses: (todayEntry.water?.glasses || 0) + glasses });
  };

  useHydrationReminders({ settings, todayMl, onLogMl: logWaterMl, onLogGlasses: logWaterGlasses });

  /* =======================================================
     CATEGORY ACTIONS
     ======================================================= */

  const openCategory = useCallback(
    (category) => {
      setSelectedDay(t);
      setActiveCategory(category);
    },
    [t]
  );

  const openHabit = useCallback(
    (habit) => {
      const wasDone = !!todayEntry.habits?.[habit.id];

      toggleHabit(t, habit.id);

      if (!wasDone) {
        fireCelebration();
      }
    },
    [
      t,
      toggleHabit,
      todayEntry,
      fireCelebration,
    ]
  );

  const closeModal = useCallback(() => {
    setActiveCategory(null);

    if (!dayDetailOpen) {
      setSelectedDay(null);
    }
  }, [dayDetailOpen]);

  /* =======================================================
     CALENDAR ACTIONS
     ======================================================= */

  const openDay = useCallback((date) => {
    setSelectedDay(date);
    setDayDetailOpen(true);
  }, []);

  const closeDayDetail = useCallback(() => {
    setDayDetailOpen(false);
    setSelectedDay(null);
  }, []);
React.useEffect(() => {
    const backListenerPromise = CapacitorApp.addListener("backButton", () => {
      if (activeCategory) {
        closeModal();
      } else if (dayDetailOpen) {
        closeDayDetail();
      } else if (tab !== "home") {
        setTab("home");
      } else {
        CapacitorApp.exitApp();
      }
    });
    return () => {
      backListenerPromise.then((l) => l.remove());
    };
  }, [activeCategory, dayDetailOpen, tab, closeModal, closeDayDetail]);

  const openCategoryForSelectedDay = useCallback(
    (category) => {
      setActiveCategory(category);
    },
    []
  );

  const toggleHabitForSelectedDay = useCallback(
    (habit) => {
      const wasDone =
        !!dayEntry.habits?.[habit.id];

      toggleHabit(editingDay, habit.id);

      if (!wasDone) {
        fireCelebration();
      }
    },
    [
      editingDay,
      dayEntry,
      toggleHabit,
      fireCelebration,
    ]
  );

  /* =======================================================
     CATEGORY SAVE + CELEBRATION
     ======================================================= */

  const saveCategoryWithCelebration =
    useCallback(
      (categoryId, patch) => {
        const wasDone = isCategoryDone(
          categoryId,
          dayEntry[categoryId]
        );

        saveCategory(
          editingDay,
          categoryId,
          patch
        );

        if (
          !wasDone &&
          isCategoryDone(categoryId, patch)
        ) {
          fireCelebration();
        }
      },
      [
        editingDay,
        dayEntry,
        saveCategory,
        fireCelebration,
      ]
    );

  /* =======================================================
     MAIN UI
     ======================================================= */

  return (
    <div
  className={`mwt ${settings.animationsOn ? "mwt-anim" : ""}`}
  style={{
    minHeight: "100dvh",
    width: "100%",
    background: theme.bg,
    color: theme.ink,
    position: "relative",
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
  }}
>
      <GlobalStyle />

      <FloatingDecor
        animationsOn={settings.animationsOn}
        themeKey={settings.theme}
      />

      {/* ===================================================
          PAGE CONTENT
          =================================================== */}

      <Suspense fallback={<PageLoading theme={theme} />}>
  <div className="tracker-page">
    {tab === "home" && (
      <Dashboard
        theme={theme}
        entries={entries}
        settings={settings}
        animationsOn={settings.animationsOn}
        onOpenCategory={openCategory}
        onOpenHabit={openHabit}
      />
    )}

    {tab === "calendar" && (
      <CalendarView
        theme={theme}
        entries={entries}
        essentials={essentials}
        onSelectDay={openDay}
        cycleEnabled={cycleEnabled}
      />
    )}

    {tab === "insights" && (
      <AnalyticsView
        theme={theme}
        entries={entries}
        cycleEnabled={cycleEnabled}
      />
    )}

    {tab === "journal" && (
      <JournalView
        theme={theme}
        entries={entries}
        onSave={saveCategory}
      />
    )}

    {tab === "garden" && (
      <GardenView
        theme={theme}
        entries={entries}
        animationsOn={settings.animationsOn}
      />
    )}

    {tab === "settings" && (
      <SettingsView
        theme={theme}
        settings={settings}
        onChange={saveSettings}
      />
    )}
  </div>
</Suspense>

      {/* ===================================================
          DAY DETAIL
          =================================================== */}

      {dayDetailOpen &&
        selectedDay && (
          <DayDetailModal
            theme={theme}
            date={selectedDay}
            entries={entries}
            settings={settings}
            onOpenCategory={
              openCategoryForSelectedDay
            }
            onToggleHabit={
              toggleHabitForSelectedDay
            }
            onClose={
              closeDayDetail
            }
          />
        )}

      {/* ===================================================
          CATEGORY MODAL
          =================================================== */}

      {activeCategory && (
        <CategoryModal
          theme={theme}
          category={activeCategory}
          dayEntry={dayEntry}
          onClose={closeModal}
          onSave={
            saveCategoryWithCelebration
          }
          waterTarget={
            8
          }
          onWaterTarget={null}
          hydrationTargetMl={settings.hydration?.targetMl}
          getHistory={() =>
            getHistory(editingDay)
          }
        />
      )}

      {/* ===================================================
          FLOATING COMPANION
          =================================================== */}

      <Companion
        theme={theme}
        animationsOn={
          settings.animationsOn
        }
        kind={settings.companion}
        user={user}
        entries={entries}
        todayComplete={todayComplete}
        progressPct={progressPct}
        emojiSet={
          COMPANIONS[
            settings.companion
          ]
        }
      />

      {/* ===================================================
          BOTTOM NAVIGATION
          =================================================== */}

      <BottomNav
        theme={theme}
        tab={tab}
        setTab={setTab}
      />

      {/* ===================================================
          CELEBRATION
          =================================================== */}

      {settings.animationsOn && (
        <MicroCelebration
          trigger={celebrateTick}
        />
      )}
    </div>
  );
}

/* =========================================================
   ROOT
   ========================================================= */

export default function App() {
  const path =
    typeof window !== "undefined"
      ? window.location.pathname
      : "/";

  const match = path.match(/^\/share\/jar\/([^/]+)/);

  if (match) {
    return <SharedJarPage token={match[1]} />;
  }

  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
