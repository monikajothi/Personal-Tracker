import React, {
  useState,
  useCallback,
  useEffect,
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
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

import CategoryModal from "./components/CategoryModal.jsx";
import DayDetailModal from "./components/DayDetailModal.jsx";
import MicroCelebration from "./components/MicroCelebration.jsx";


import SharedJarPage from "./pages/SharedJarPage.jsx";

import {
  AuthProvider,
  useAuth,
} from "./hooks/useAuth.jsx";

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

import {
  glassesToMl,
  mlToGlasses,
} from "./utils/hydration.js";


/* =========================================================
   STORAGE KEYS
========================================================= */

const QUICK_LOG_KEY =
  "hydrationQuickLogs";

const HYDRATION_OPEN_KEY =
  "hydrationOpenWater";

const INSIGHT_REMINDER_KEY = "mwt-insight-reminders";
const SUNDAY_RECAP_KEY = "mwt-sunday-recap";

function shuffle(list) {
  const items = [...list];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function buildInsightCandidates(entries) {
  const rows = Object.entries(entries || {})
    .filter(([, value]) => value && typeof value === "object")
    .map(([date, value]) => ({ date, ...value }));

  if (rows.length < 7) return [];

  const candidates = [];

  const walkDays = rows.filter((entry) => Number(entry.movement?.minutes || 0) >= 20);
  const nonWalkDays = rows.filter((entry) => Number(entry.movement?.minutes || 0) < 20);

  if (walkDays.length && nonWalkDays.length) {
    const avgWalkSleep = walkDays
      .map((entry) => Number(entry.sleep?.duration || 0))
      .filter((v) => Number.isFinite(v) && v > 0);
    const avgNonWalkSleep = nonWalkDays
      .map((entry) => Number(entry.sleep?.duration || 0))
      .filter((v) => Number.isFinite(v) && v > 0);

    if (avgWalkSleep.length && avgNonWalkSleep.length) {
      const diff = avgWalkSleep.reduce((sum, v) => sum + v, 0) / avgWalkSleep.length - avgNonWalkSleep.reduce((sum, v) => sum + v, 0) / avgNonWalkSleep.length;
      if (diff > 0.4) {
        candidates.push(`You sleep ${diff.toFixed(1)}h longer on walk`);
      }
    }
  }

  const hydratedDays = rows.filter((entry) => Number(entry.water?.glasses || 0) >= 6);
  const dehydratedDays = rows.filter((entry) => Number(entry.water?.glasses || 0) < 6);

  if (hydratedDays.length && dehydratedDays.length) {
    const moodHydrated = hydratedDays
      .map((entry) => Number(entry.mood?.energy || 0))
      .filter((v) => Number.isFinite(v) && v > 0);
    const moodDry = dehydratedDays
      .map((entry) => Number(entry.mood?.energy || 0))
      .filter((v) => Number.isFinite(v) && v > 0);

    if (moodHydrated.length && moodDry.length) {
      const avgHydrated = moodHydrated.reduce((sum, v) => sum + v, 0) / moodHydrated.length;
      const avgDry = moodDry.reduce((sum, v) => sum + v, 0) / moodDry.length;
      if (avgHydrated > avgDry + 0.2) {
        candidates.push(`Your energy is ${Math.max(0.1, avgHydrated - avgDry).toFixed(1)} points higher on hydrated days.`);
      }
    }
  }

  const sleeps = rows
    .map((entry) => Number(entry.sleep?.duration || 0))
    .filter((v) => Number.isFinite(v) && v > 0);

  if (sleeps.length) {
    const avgSleep = sleeps.reduce((sum, v) => sum + v, 0) / sleeps.length;
    if (avgSleep >= 7.5) {
      candidates.push(`Your average sleep is ${avgSleep.toFixed(1)}h — that is likely helping your energy stay steadier.`);
    }
  }

  return Array.from(new Set(candidates)).slice(0, 4);
}

function dispatchInsightNotification(title, body, id) {
  if (Capacitor.isNativePlatform()) {
    LocalNotifications.requestPermissions().then(async () => {
      try {
        const pending = await LocalNotifications.getPending().catch(() => ({ notifications: [] }));
        const hasSameId = (pending?.notifications || []).some((n) => n.id === id);

        if (hasSameId) {
          return;
        }

        await LocalNotifications.schedule({
          notifications: [{
            id,
            title,
            body,
            channelId: "hydration",
            smallIcon: "ic_stat_notify",
            sound: "default",
            schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true },
          }],
        });
      } catch {
        /* notification silently skipped */
      }
    }).catch(() => {});
    return;
  }

  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification(title, { body, tag: `insight-${id}` });
  }
}

function dispatchSundayRecapNotification() {
  const message = "Your week in 20 seconds: small habits are adding up.";

  if (Capacitor.isNativePlatform()) {
    LocalNotifications.requestPermissions().then(async () => {
      try {
        const pending = await LocalNotifications.getPending().catch(() => ({ notifications: [] }));
        const hasSameId = (pending?.notifications || []).some((n) => n.id === 5001);

        if (hasSameId) {
          return;
        }

        await LocalNotifications.schedule({
          notifications: [{
            id: 5001,
            title: "Sunday recap",
            body: message,
            channelId: "hydration",
            smallIcon: "ic_stat_notify",
            sound: "default",
            schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true },
          }],
        });
      } catch {
        /* notification silently skipped */
      }
    }).catch(() => {});
    return;
  }

  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification("Sunday recap", { body: message, tag: "sunday-recap" });
  }
}

/* =========================================================
   LAZY LOAD PAGES
========================================================= */

const LoginPage =
  lazy(() =>
    import("./pages/LoginPage.jsx")
  );

const Dashboard =
  lazy(() =>
    import("./pages/Dashboard.jsx")
  );

const CalendarView =
  lazy(() =>
    import("./pages/CalendarPage.jsx")
  );

const AnalyticsView =
  lazy(() =>
    import("./pages/AnalyticsPage.jsx")
  );

const JournalView =
  lazy(() =>
    import("./pages/JournalPage.jsx")
  );

const ExpensesView =
  lazy(() =>
    import("./pages/ExpensesPage.jsx")
  );

const SettingsView =
  lazy(() =>
    import("./pages/SettingsPage.jsx")
  );


/* =========================================================
   APP SHELL
========================================================= */

function AppShell() {
  const {
    user,
    ready,
  } = useAuth();


  if (!ready) {
    return <LoadingScreen />;
  }


  if (!user) {
    return (
      <Suspense
        fallback={
          <LoadingScreen />
        }
      >
        <LoginPage />
      </Suspense>
    );
  }


  return <TrackerApp />;
}


/* =========================================================
   LOADING BRAND
========================================================= */

function LoadingBrand({
  size = 58,
}) {
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

          objectFit:
            "contain",

          display:
            "block",

          animation:
            "mwt-loading-pulse 2.8s ease-in-out infinite",

          filter:
            "drop-shadow(0 8px 18px rgba(143, 110, 90, 0.18))",
        }}
      />
    </>
  );
}


/* =========================================================
   LOADING SCREEN
========================================================= */

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight:
          "100vh",

        display:
          "flex",

        flexDirection:
          "column",

        alignItems:
          "center",

        justifyContent:
          "center",

        gap: 12,

        fontFamily:
          "sans-serif",

        color:
          "#888",

        background:
          "#fffafc",
      }}
    >
      <LoadingBrand
        size={60}
      />

      <div
        style={{
          fontSize: 13,

          opacity: 0.65,

          fontWeight: 600,

          letterSpacing:
            "0.04em",
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

function PageLoading({
  theme,
}) {
  return (
    <div
      style={{
        minHeight:
          "60vh",

        display:
          "flex",

        flexDirection:
          "column",

        alignItems:
          "center",

        justifyContent:
          "center",

        gap: 10,

        color:
          theme?.ink ||
          "#777",

        fontSize: 14,

        opacity: 0.7,
      }}
    >
      <LoadingBrand
        size={36}
      />

      <span>
        Loading…
      </span>
    </div>
  );
}


/* =========================================================
   TRACKER APP
========================================================= */

function TrackerApp() {
  const {
    user,
  } = useAuth();


  /* =======================================================
     DATA HOOKS
  ======================================================= */

  const userId =
    user?.id ||
    user?._id ||
    user?.email;


  const {
    entries,
    saveCategory,
    updateCategory,
    toggleHabit,
  } = useEntries(
    true,
    userId
  );


  const {
    settings,
    saveSettings,
  } = useSettings(
    true,
    userId
  );


  /* =======================================================
     UI STATE
  ======================================================= */

  const [
    tab,
    setTab,
  ] = useState(
    "home"
  );


  const [
    activeCategory,
    setActiveCategory,
  ] = useState(
    null
  );


  const [
    selectedDay,
    setSelectedDay,
  ] = useState(
    null
  );


  const [
    dayDetailOpen,
    setDayDetailOpen,
  ] = useState(
    false
  );


  const [
    celebrateTick,
    setCelebrateTick,
  ] = useState(
    0
  );


  const fireCelebration =
    useCallback(() => {
      setCelebrateTick(
        (n) => n + 1
      );
    }, []);


  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const theme =
    resolveTheme(
      settings
    );


  const t =
    todayStr();


  const editingDay =
    selectedDay ||
    t;


  const dayEntry =
    entries[
      editingDay
    ] || {};


  const todayEntry =
    entries[t] || {};


  /* =======================================================
     WATER VALUE
  ======================================================= */

  const todayMl =
    glassesToMl(
      todayEntry
        .water
        ?.glasses ||
        0,

      settings
    );


  /* =======================================================
     WATER LOG FUNCTIONS
  ======================================================= */

  const logWaterMl =
    useCallback(
      (ml) => {
        const addGlasses =
          mlToGlasses(
            ml,
            settings
          );


        updateCategory(
          t,
          "water",

          (current = {}) => ({
            ...current,

            glasses:
              (
                current.glasses ||
                0
              ) +
              addGlasses,
          })
        );
      },

      [
        updateCategory,
        t,
        settings,
      ]
    );


  const logWaterGlasses =
    useCallback(
      (glasses) => {
        updateCategory(
          t,
          "water",

          (current = {}) => ({
            ...current,

            glasses:
              (
                current.glasses ||
                0
              ) +
              glasses,
          })
        );
      },

      [
        updateCategory,
        t,
      ]
    );


  /* =======================================================
     OPEN WATER FROM NOTIFICATION
  ======================================================= */

  const openPendingWaterComponent =
    useCallback(() => {
      try {

        const raw =
          localStorage.getItem(
            HYDRATION_OPEN_KEY
          );


        /*
         * Nothing requested.
         */
        if (!raw) {
          return;
        }


        const request =
          JSON.parse(
            raw
          );


        /*
         * Invalid request.
         */
        if (
          !request ||
          !request.timestamp
        ) {
          localStorage.removeItem(
            HYDRATION_OPEN_KEY
          );

          return;
        }


        /*
         * Only accept a recent request.
         *
         * This prevents an old notification action
         * from opening Water unexpectedly later.
         */
        const age =
          Date.now() -
          Number(
            request.timestamp
          );


        if (
          age >
          10 * 60 * 1000
        ) {
          localStorage.removeItem(
            HYDRATION_OPEN_KEY
          );

          return;
        }


        /*
         * Find the actual Water category.
         */
        const waterCategory =
          DEFAULT_CATEGORIES.find(
            (category) =>
              category.id ===
              "water"
          );


        if (!waterCategory) {
          console.warn(
            "Water category not found."
          );

          localStorage.removeItem(
            HYDRATION_OPEN_KEY
          );

          return;
        }


        /*
         * Open today's Water component.
         */
        setSelectedDay(
          t
        );


        setActiveCategory(
          waterCategory
        );


        /*
         * Consume the intent.
         */
        localStorage.removeItem(
          HYDRATION_OPEN_KEY
        );

      } catch (err) {
        console.error(
          "Failed to open Water from hydration notification:",
          err
        );

        localStorage.removeItem(
          HYDRATION_OPEN_KEY
        );
      }

    }, [
      t,
    ]);


  /* =======================================================
     FLUSH QUICK HYDRATION LOGS
  ======================================================= */

  const flushQuickHydrationLogs =
    useCallback(
      async () => {
        try {

          const raw =
            localStorage.getItem(
              QUICK_LOG_KEY
            );


          /*
           * No cached water action.
           *
           * Still check whether Water was requested.
           */
          if (!raw) {
            openPendingWaterComponent();
            return;
          }


          const logs =
            JSON.parse(
              raw ||
                "[]"
            );


          if (
            !Array.isArray(
              logs
            ) ||
            logs.length === 0
          ) {
            openPendingWaterComponent();
            return;
          }


          /* ==============================================
             TOTAL GLASSES
          ============================================== */

          const totalMl =
            logs.reduce(
              (
                sum,
                item
              ) =>
                sum +
                (
                  Number(
                    item.ml
                  ) || 0
                ),

              0
            );


          const totalGlasses =
            logs.reduce(
              (
                sum,
                item
              ) =>
                sum +
                (
                  Number(
                    item.glasses
                  ) || 0
                ),

              0
            );


          /*
           * Convert any legacy ml logs into
           * the user's configured glass size.
           */
          const addGlasses =
            totalGlasses +
            mlToGlasses(
              totalMl,
              settings
            );


          /* ==============================================
             SAVE TO TODAY
          ============================================== */

          if (
            addGlasses > 0
          ) {
            updateCategory(
              t,
              "water",

              (
                current = {}
              ) => ({
                ...current,

                glasses:
                  (
                    current.glasses ||
                    0
                  ) +
                  addGlasses,
              })
            );
          }


          /* ==============================================
             CLEAR QUICK LOG
          ============================================== */

          localStorage.removeItem(
            QUICK_LOG_KEY
          );


          /*
           * Open Water component.
           *
           * We do this after processing the log.
           */
          openPendingWaterComponent();

        } catch (err) {
          console.error(
            "Failed to flush quick hydration logs:",
            err
          );
        }

      },

      [
        updateCategory,
        t,
        settings,
        openPendingWaterComponent,
      ]
    );


  /* =======================================================
     APP VISIBILITY / RESUME
  ======================================================= */

  useEffect(() => {

    /*
     * Browser visibility.
     */
    const onVisibility =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          flushQuickHydrationLogs();
          void checkInsightNotifications();
          void checkSundayRecapNotification();
        }
      };


    document.addEventListener(
      "visibilitychange",
      onVisibility
    );


    /*
     * Capacitor Android/iOS app state.
     *
     * This is the important part for the APK.
     */
    let appListener = null;


    CapacitorApp.addListener(
      "appStateChange",

      (state) => {
        if (
          state.isActive
        ) {
          flushQuickHydrationLogs();
          void checkInsightNotifications();
          void checkSundayRecapNotification();
        }
      }
    )
      .then(
        (listener) => {
          appListener =
            listener;
        }
      )
      .catch(
        () => {}
      );


    /*
     * If the app is already visible
     * when this effect runs.
     */
    if (
      document.visibilityState ===
      "visible"
    ) {
      flushQuickHydrationLogs();
    }


    /*
     * Immediate event from the
     * notification action handler.
     */
    const onQuickFlush =
      () => {
        flushQuickHydrationLogs();
      };


    window.addEventListener(
      "hydration-quicklog-flush",
      onQuickFlush
    );


    return () => {

      document.removeEventListener(
        "visibilitychange",
        onVisibility
      );


      if (
        appListener &&
        typeof appListener.remove ===
          "function"
      ) {
        appListener.remove();
      }


      window.removeEventListener(
        "hydration-quicklog-flush",
        onQuickFlush
      );

    };

  }, [
    flushQuickHydrationLogs,
    checkInsightNotifications,
    checkSundayRecapNotification,
  ]);


  /* =======================================================
     USER / CYCLE
  ======================================================= */

  const isFemaleUser =
    user?.gender ===
    "female";


  const cycleEnabled =
    isFemaleUser &&
    settings.cycleEnabled;


  /* =======================================================
     ESSENTIALS
  ======================================================= */

  const essentials =
    settings.essentials.filter(
      (id) =>
        DEFAULT_CATEGORIES.some(
          (c) =>
            c.id === id
        )
    );


  const doneTodayCount =
    essentials.filter(
      (id) =>
        isCategoryDone(
          id,
          todayEntry[id]
        )
    ).length;


  const progressPct =
    essentials.length
      ? Math.round(
          (
            doneTodayCount /
            essentials.length
          ) *
            100
        )
      : 0;


  const todayComplete =
    essentials.length >
      0 &&
    essentials.every(
      (id) =>
        isCategoryDone(
          id,
          todayEntry[id]
        )
    );


  /* =======================================================
     REMINDERS
  ======================================================= */

  useReminders({
    enabled:
      settings.reminders
        ?.enabled,

    time:
      settings.reminders
        ?.time,

    todayComplete,
  });


  /* =======================================================
     HYDRATION REMINDERS
  ======================================================= */

  useHydrationReminders({
    settings,

    todayMl,

    onLogMl:
      logWaterMl,

    onLogGlasses:
      logWaterGlasses,
  });

  const checkInsightNotifications = useCallback(async () => {
    if (!userId || !settings?.hydration?.enabled) return;

    const todayKey = todayStr();
    const state = JSON.parse(localStorage.getItem(INSIGHT_REMINDER_KEY) || "{}") || {};

    if (Capacitor.isNativePlatform()) {
      try {
        const pending = await LocalNotifications.getPending().catch(() => ({ notifications: [] }));
        const hasInsightPending = (pending?.notifications || []).some(
          (n) => n.id >= 4000 && n.id < 5000
        );

        if (state.date === todayKey && hasInsightPending) {
          return;
        }
      } catch {
        /* fallback below will still attempt to send */
      }
    } else if (state.date === todayKey) {
      return;
    }

    const insights = buildInsightCandidates(entries);
    if (!insights.length) return;

    const picks = shuffle(insights).slice(0, 2);

    picks.forEach((text, index) => {
      dispatchInsightNotification("Insight unlocked", text, 4000 + index);
    });

    localStorage.setItem(INSIGHT_REMINDER_KEY, JSON.stringify({ date: todayKey, insights: picks }));
  }, [entries, settings, userId]);

  const checkSundayRecapNotification = useCallback(async () => {
    if (!userId) return;

    const today = new Date();
    const todayKey = todayStr();
    const sundayState = JSON.parse(localStorage.getItem(SUNDAY_RECAP_KEY) || "{}") || {};

    if (today.getDay() !== 0) return;

    if (Capacitor.isNativePlatform()) {
      try {
        const pending = await LocalNotifications.getPending().catch(() => ({ notifications: [] }));
        const hasRecapPending = (pending?.notifications || []).some((n) => n.id === 5001);

        if (sundayState.date === todayKey && hasRecapPending) {
          return;
        }
      } catch {
        /* fallback below will still attempt to send */
      }
    } else if (sundayState.date === todayKey) {
      return;
    }

    const stories = buildInsightCandidates(entries);
    if (!stories.length) return;

    dispatchSundayRecapNotification();
    localStorage.setItem(SUNDAY_RECAP_KEY, JSON.stringify({ date: todayKey }));
  }, [entries, userId]);

  useEffect(() => {
    void checkInsightNotifications();
  }, [checkInsightNotifications]);

  useEffect(() => {
    void checkSundayRecapNotification();
  }, [checkSundayRecapNotification]);


  /* =======================================================
     CATEGORY ACTIONS
  ======================================================= */

  const openCategory =
    useCallback(
      (category) => {
        setSelectedDay(t);

        setActiveCategory(
          category
        );
      },

      [t]
    );


  const openHabit =
    useCallback(
      (habit) => {

        const wasDone =
          !!todayEntry
            .habits
            ?.[
              habit.id
            ];


        toggleHabit(
          t,
          habit.id
        );


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
  /*
   * Closing an individual category form
   * returns to DayDetail.
   *
   * Do NOT clear selectedDay here.
   */
  setActiveCategory(null);
}, []);


  /* =======================================================
     CALENDAR
  ======================================================= */

  const openDay = useCallback((date) => {
  setSelectedDay(date);
  setDayDetailOpen(true);
}, []);


  const closeDayDetail = useCallback(() => {
  /*
   * Close DayDetail, but preserve selectedDay.
   *
   * This returns the user to the Calendar's
   * inline summary card.
   */
  setDayDetailOpen(false);
}, []);


  /* =======================================================
     ANDROID BACK BUTTON
  ======================================================= */

  useEffect(() => {

    const backListenerPromise =
      CapacitorApp.addListener(
        "backButton",

        () => {

          if (
            activeCategory
          ) {
            closeModal();

          } else if (
            tab !== "home"
          ) {
            setTab(
              "home"
            );

          } else {
            CapacitorApp.exitApp();
          }

        }
      );


    return () => {
      backListenerPromise.then(
        (listener) =>
          listener.remove()
      );
    };

  }, [
    activeCategory,
    dayDetailOpen,
    tab,
    closeModal,
    closeDayDetail,
  ]);


  const openCategoryForSelectedDay =
    useCallback(
      (category) => {
        setActiveCategory(
          category
        );
      },

      []
    );

useEffect(() => {
  const backListenerPromise =
    CapacitorApp.addListener(
      "backButton",
      () => {
        /*
         * Category form is the deepest level.
         */
        if (activeCategory) {
          closeModal();
          return;
        }

        /*
         * Then DayDetail.
         */
        if (dayDetailOpen) {
          closeDayDetail();
          return;
        }

        /*
         * Then app tabs.
         */
        if (tab !== "home") {
          setTab("home");
          return;
        }

        /*
         * Finally exit.
         */
        CapacitorApp.exitApp();
      }
    );

  return () => {
    backListenerPromise.then(
      (listener) =>
        listener.remove()
    );
  };
}, [
  activeCategory,
  dayDetailOpen,
  tab,
  closeModal,
  closeDayDetail,
]);
  const toggleHabitForSelectedDay =
    useCallback(
      (habit) => {

        const wasDone =
          !!dayEntry
            .habits
            ?.[
              habit.id
            ];


        toggleHabit(
          editingDay,
          habit.id
        );


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
      (
        categoryId,
        patch
      ) => {

        const wasDone =
          isCategoryDone(
            categoryId,
            dayEntry[
              categoryId
            ]
          );


        saveCategory(
          editingDay,
          categoryId,
          patch
        );


        if (
          !wasDone &&
          isCategoryDone(
            categoryId,
            patch
          )
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
      className={`mwt ${
        settings.animationsOn
          ? "mwt-anim"
          : ""
      }`}

      style={{
        minHeight:
          "100dvh",

        width:
          "100%",

        background:
          `radial-gradient(circle at top left, rgba(147, 197, 253, 0.16), transparent 26%),
           radial-gradient(circle at bottom right, rgba(191, 156, 255, 0.12), transparent 24%),
           ${theme.bg || "#fffafc"}`,

        color:
          theme.ink,

        position:
          "relative",

        display:
          "flex",

        flexDirection:
          "column",

        overflowX:
          "hidden",
      }}
    >

      <GlobalStyle />


      <FloatingDecor
        animationsOn={
          settings.animationsOn
        }

        themeKey={
          settings.theme
        }
      />


      {/* ===================================================
          PAGE CONTENT
      =================================================== */}

      <Suspense
        fallback={
          <PageLoading
            theme={theme}
          />
        }
      >

        <div
          className="tracker-page"
        >

          {tab === "home" && (
            <Dashboard
              theme={theme}

              entries={entries}

              settings={settings}

              animationsOn={
                settings.animationsOn
              }

              onOpenCategory={
                openCategory
              }

              onOpenHabit={
                openHabit
              }
            />
          )}


          {tab === "calendar" && (
            <CalendarView
  theme={theme}
  entries={entries}
  essentials={essentials}

  /*
   * Calendar date click:
   * only select the date and show
   * the inline summary card.
   */
  onSelectDay={(date) => {
    setSelectedDay(date);
  }}

  selectedDay={selectedDay}

  cycleEnabled={
    cycleEnabled
  }

  /*
   * Inline card Edit button:
   * opens the existing DayDetailModal.
   */
  onEditDay={
    openDay
  }
/>
          )}


          {tab === "insights" && (
            <AnalyticsView
              theme={theme}

              entries={entries}

              cycleEnabled={
                cycleEnabled
              }

              userId={
                userId
              }

              settings={settings}
            />
          )}


          {tab === "journal" && (
            <JournalView
              theme={theme}

              entries={entries}

              onSave={
                saveCategory
              }

              userId={
                userId
              }

            />
          )}

          {tab === "expenses" && (
            <ExpensesView
              theme={theme}

              entries={entries}

              animationsOn={
                settings.animationsOn
              }
            />
          )}


          {tab === "settings" && (
            <SettingsView
              theme={theme}

              settings={settings}

              onChange={
                saveSettings
              }
            />
          )}

        </div>

      </Suspense>


      {/* ===================================================
          DAY DETAIL
      =================================================== */}

      {dayDetailOpen && selectedDay && (
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

    /*
     * IMPORTANT:
     * WaterForm / HydrationWaterCard needs
     * the COMPLETE settings object.
     *
     * This was missing.
     */
    settings={settings}

    onClose={closeModal}

    onSave={
      saveCategoryWithCelebration
    }

    waterTarget={
      settings.waterTarget || 8
    }

    onWaterTarget={(value) =>
      saveSettings({
        ...settings,
        waterTarget: value,
      })
    }

    hydrationTargetMl={
      settings.hydration?.targetMl
    }

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

        kind={
          settings.companion
        }

        user={
          user
        }

        entries={
          entries
        }

        todayComplete={
          todayComplete
        }

        progressPct={
          progressPct
        }

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

        setTab={
          setTab
        }
      />


      {/* ===================================================
          CELEBRATION
      =================================================== */}

      {settings.animationsOn && (
        <MicroCelebration
          trigger={
            celebrateTick
          }
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
    typeof window !==
    "undefined"

      ? window.location
          .pathname

      : "/";


  const match =
    path.match(
      /^\/share\/jar\/([^/]+)/
    );


  if (match) {
    return (
      <SharedJarPage
        token={
          match[1]
        }
      />
    );
  }


  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
