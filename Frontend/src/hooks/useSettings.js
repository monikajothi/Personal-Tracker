// // import { useState, useEffect, useCallback } from "react";
// // import { settingsApi } from "../api/index.js";

// // const DEFAULTS = {
// //   theme: "sakura",
// //   isDark: false,
// //   animationsOn: true,
// //   companion: "cat",

// //   waterTarget: 8,
// //   essentials: ["sleep", "water", "mood", "movement"],
// //   customHabits: [],
// //   cycleEnabled: true,

// //   reminders: {
// //     enabled: false,
// //     time: "20:00",
// //   },

// //   hydration: {
// //     enabled: false,
// //     targetMl: 2500,
// //     cupMl: 250,
// //     startTime: "08:00",
// //     endTime: "20:00",
// //     minIntervalMin: 30,
// //     maxIntervalMin: 60,
// //     snoozeMin: 30,
// //     adaptive: false,
// //     repeatEveryMin: "",
// //     quietHours: {
// //       start: "22:00",
// //       end: "07:00",
// //     },
// //   },
// // };

// // function mergeSettings(saved = {}) {
// //   return {
// //     ...DEFAULTS,
// //     ...saved,

// //     reminders: {
// //       ...DEFAULTS.reminders,
// //       ...(saved.reminders || {}),
// //     },

// //     hydration: {
// //       ...DEFAULTS.hydration,
// //       ...(saved.hydration || {}),

// //       quietHours: {
// //         ...DEFAULTS.hydration.quietHours,
// //         ...(saved.hydration?.quietHours || {}),
// //       },
// //     },

// //     customHabits: saved.customHabits ?? DEFAULTS.customHabits,
// //     essentials: saved.essentials ?? DEFAULTS.essentials,
// //   };
// // }

// // export function useSettings(enabled) {
// //   const [settings, setSettings] = useState(DEFAULTS);
// //   const [loaded, setLoaded] = useState(false);

// //   // Load settings once
// //   useEffect(() => {
// //     if (!enabled) return;

// //     let alive = true;

// //     settingsApi
// //       .get()
// //       .then((saved) => {
// //         if (!alive) return;
// //         setSettings(mergeSettings(saved));
// //       })
// //       .catch((err) => {
// //         console.error("Failed to load settings:", err);
// //       })
// //       .finally(() => {
// //         if (alive) setLoaded(true);
// //       });

// //     return () => {
// //       alive = false;
// //     };
// //   }, [enabled]);

// //   // Save complete settings object
// //   const saveSettings = useCallback(async (next) => {
// //     const normalized = mergeSettings(next);

// //     // Instant UI update
// //     setSettings(normalized);

// //     try {
// //       const saved = await settingsApi.save(normalized);

// //       if (saved) {
// //         setSettings((current) =>
// //           mergeSettings({
// //             ...current,
// //             ...saved,
// //             hydration: {
// //               ...current.hydration,
// //               ...(saved.hydration || {}),
// //             },
// //           })
// //         );
// //       }
// //     } catch (err) {
// //       console.error("Failed to save settings:", err);
// //     }
// //   }, []);

// //   // Update only hydration settings
// //   const updateHydration = useCallback(
// //     async (changes) => {
// //       const next = {
// //         ...settings,
// //         hydration: {
// //           ...settings.hydration,
// //           ...changes,
// //         },
// //       };

// //       await saveSettings(next);
// //     },
// //     [settings, saveSettings]
// //   );

// //   return {
// //     settings,
// //     loaded,
// //     saveSettings,
// //     updateHydration,
// //   };
// // }

// import {
//   useState,
//   useEffect,
//   useCallback,
//   useRef,
// } from "react";

// import { settingsApi } from "../api/index.js";

// import {
//   getSettingsCache,
//   setSettingsCache,
//   getSettingsQueue,
//   setSettingsQueue,
//   isOnline,
// } from "../utils/localStore.js";

// const DEFAULTS = {
//   theme: "sakura",
//   isDark: false,
//   animationsOn: true,
//   companion: "cat",

//   waterTarget: 8,

//   essentials: [
//     "sleep",
//     "water",
//     "mood",
//     "movement",
//   ],

//   customHabits: [],

//   cycleEnabled: true,

//   reminders: {
//     enabled: false,
//     time: "20:00",
//   },

//   hydration: {
//     enabled: false,

//     targetMl: 2500,
//     cupMl: 250,

//     startTime: "08:00",
//     endTime: "20:00",

//     minIntervalMin: 30,
//     maxIntervalMin: 60,

//     snoozeMin: 30,

//     adaptive: false,

//     repeatEveryMin: "",

//     quietHours: {
//       start: "22:00",
//       end: "07:00",
//     },
//   },
// };

// /* ============================================================
//    MERGE SETTINGS
// ============================================================ */

// function mergeSettings(
//   saved = {}
// ) {
//   return {
//     ...DEFAULTS,
//     ...saved,

//     reminders: {
//       ...DEFAULTS.reminders,
//       ...(saved.reminders || {}),
//     },

//     hydration: {
//       ...DEFAULTS.hydration,
//       ...(saved.hydration || {}),

//       quietHours: {
//         ...DEFAULTS.hydration.quietHours,
//         ...(saved.hydration?.quietHours || {}),
//       },
//     },

//     customHabits:
//       saved.customHabits ??
//       DEFAULTS.customHabits,

//     essentials:
//       saved.essentials ??
//       DEFAULTS.essentials,
//   };
// }

// /* ============================================================
//    HOOK
// ============================================================ */

// export function useSettings(
//   enabled,
//   userId
// ) {
//   const [settings, setSettings] =
//     useState(DEFAULTS);

//   const [loaded, setLoaded] =
//     useState(false);

//   const settingsRef =
//     useRef(DEFAULTS);

//   const savingRef =
//     useRef(false);

//   /* ========================================================
//      KEEP REF UPDATED
//   ======================================================== */

//   useEffect(() => {
//     settingsRef.current =
//       settings;
//   }, [settings]);

//   /* ========================================================
//      LOCAL LOAD
//   ======================================================== */

//   const loadLocal =
//     useCallback(() => {
//       if (!userId) return null;

//       const cached =
//         getSettingsCache(
//           userId
//         );

//       if (
//         cached &&
//         typeof cached === "object"
//       ) {
//         const merged =
//           mergeSettings(
//             cached
//           );

//         settingsRef.current =
//           merged;

//         setSettings(
//           merged
//         );

//         return merged;
//       }

//       return null;
//     }, [userId]);

//   /* ========================================================
//      LOCAL SAVE
//   ======================================================== */

//   const saveLocal =
//     useCallback(
//       (next) => {
//         const normalized =
//           mergeSettings(next);

//         settingsRef.current =
//           normalized;

//         setSettings(
//           normalized
//         );

//         if (userId) {
//           setSettingsCache(
//             userId,
//             normalized
//           );
//         }

//         return normalized;
//       },
//       [userId]
//     );

//   /* ========================================================
//      INITIAL LOAD
//   ======================================================== */

//   useEffect(() => {
//     if (!enabled || !userId) {
//       return;
//     }

//     let alive = true;

//     /*
//       LOCAL FIRST
//     */
//     const cached =
//       loadLocal();

//     if (!cached) {
//       setLoaded(true);
//     }

//     /*
//       SERVER IN BACKGROUND
//     */
//     const refresh =
//       async () => {
//         try {
//           const server =
//             await settingsApi.get();

//           if (!alive) return;

//           const pending =
//             getSettingsQueue(
//               userId
//             );

//           /*
//             If a newer local save exists,
//             it wins over server.
//           */
//           if (
//             pending &&
//             pending.timestamp
//           ) {
//             const serverTime =
//               Number(
//                 pending.serverTimestamp || 0
//               );

//             if (
//               pending.timestamp >
//               serverTime
//             ) {
//               return;
//             }
//           }

//           const merged =
//             mergeSettings(
//               server
//             );

//           saveLocal(
//             merged
//           );
//         } catch (err) {
//           console.warn(
//             "[useSettings] Background refresh failed:",
//             err
//           );
//         } finally {
//           if (alive) {
//             setLoaded(true);
//           }
//         }
//       };

//     refresh();

//     return () => {
//       alive = false;
//     };
//   }, [
//     enabled,
//     userId,
//     loadLocal,
//     saveLocal,
//   ]);

//   /* ========================================================
//      SERVER SYNC
//   ======================================================== */

//   const syncSettings =
//     useCallback(
//       async () => {
//         if (
//           !userId ||
//           savingRef.current ||
//           !isOnline()
//         ) {
//           return;
//         }

//         const pending =
//           getSettingsQueue(
//             userId
//           );

//         if (!pending) {
//           return;
//         }

//         savingRef.current =
//           true;

//         try {
//           const saved =
//             await settingsApi.save(
//               pending.settings
//             );

//           /*
//             Check if user changed settings
//             again while request was running.
//           */
//           const latest =
//             getSettingsQueue(
//               userId
//             );

//           if (
//             latest &&
//             latest.timestamp >
//               pending.timestamp
//           ) {
//             /*
//               Newer local settings exist.
//               Do NOT overwrite them.
//             */
//             return;
//           }

//           /*
//             Server accepted latest settings.
//           */
//           setSettingsQueue(
//             userId,
//             null
//           );

//           if (saved) {
//             const merged =
//               mergeSettings(
//                 saved
//               );

//             saveLocal(
//               merged
//             );
//           }
//         } catch (err) {
//           console.warn(
//             "[useSettings] Sync failed. Keeping local settings.",
//             err
//           );
//         } finally {
//           savingRef.current =
//             false;
//         }
//       },
//       [
//         userId,
//         saveLocal,
//       ]
//     );

//   /* ========================================================
//      ONLINE / VISIBILITY
//   ======================================================== */

//   useEffect(() => {
//     if (!enabled || !userId) {
//       return;
//     }

//     const sync =
//       () => {
//         syncSettings()
//           .catch(() => {});
//       };

//     window.addEventListener(
//       "online",
//       sync
//     );

//     document.addEventListener(
//       "visibilitychange",
//       sync
//     );

//     sync();

//     return () => {
//       window.removeEventListener(
//         "online",
//         sync
//       );

//       document.removeEventListener(
//         "visibilitychange",
//         sync
//       );
//     };
//   }, [
//     enabled,
//     userId,
//     syncSettings,
//   ]);

//   /* ========================================================
//      SAVE SETTINGS
//   ======================================================== */

//   const saveSettings =
//     useCallback(
//       async (next) => {
//         if (!userId) return;

//         /*
//           1. Update UI immediately.
//           2. Save local immediately.
//         */
//         const normalized =
//           saveLocal(next);

//         /*
//           3. Put latest snapshot
//              into sync queue.
//         */
//         setSettingsQueue(
//           userId,
//           {
//             settings:
//               normalized,

//             timestamp:
//               Date.now(),

//             serverTimestamp: 0,
//           }
//         );

//         /*
//           4. Try background sync.
//         */
//         if (isOnline()) {
//           syncSettings()
//             .catch(() => {});
//         }
//       },
//       [
//         userId,
//         saveLocal,
//         syncSettings,
//       ]
//     );

//   /* ========================================================
//      HYDRATION UPDATE
//   ======================================================== */

//   const updateHydration =
//     useCallback(
//       async (changes) => {
//         const next = {
//           ...settingsRef.current,

//           hydration: {
//             ...settingsRef
//               .current
//               .hydration,

//             ...changes,
//           },
//         };

//         await saveSettings(
//           next
//         );
//       },
//       [saveSettings]
//     );

//   return {
//     settings,
//     loaded,

//     saveSettings,
//     updateHydration,

//     syncSettings,
//   };
// }

import { useState, useEffect, useCallback, useRef } from "react";
import { settingsApi } from "../api/index.js";
import {
  getSettingsCache,
  setSettingsCache,
  getSettingsQueue,
  setSettingsQueue,
  isOnline,
} from "../utils/localStore.js";

const DEFAULTS = {
  theme: "sakura",
  isDark: false,
  animationsOn: true,
  companion: "cat",
  waterTarget: 8,
  essentials: ["sleep", "water", "mood", "movement"],
  customHabits: [],
  cycleEnabled: true,
  reminders: { enabled: false, time: "20:00" },
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
    quietHours: { start: "22:00", end: "07:00" },
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

export function useSettings(enabled, userId) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const settingsRef = useRef(DEFAULTS);
  const syncingRef = useRef(false);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const commitSettings = useCallback(
    (next) => {
      const normalized = mergeSettings(next);
      settingsRef.current = normalized;
      setSettings(normalized);
      if (userId) setSettingsCache(userId, normalized);
      return normalized;
    },
    [userId]
  );

  const loadCache = useCallback(() => {
    if (!userId) return null;
    const cached = getSettingsCache(userId);
    if (!cached || typeof cached !== "object" || Array.isArray(cached)) {
      return null;
    }
    const normalized = mergeSettings(cached);
    settingsRef.current = normalized;
    setSettings(normalized);
    return normalized;
  }, [userId]);

  const syncSettings = useCallback(async () => {
    if (!userId || syncingRef.current || !isOnline()) return;

    const pending = getSettingsQueue(userId);
    if (!pending?.settings) return;

    syncingRef.current = true;

    try {
      const saved = await settingsApi.save(pending.settings);
      const latest = getSettingsQueue(userId);

      // A newer local edit happened while the request was in flight.
      if (latest && latest.timestamp > pending.timestamp) return;

      setSettingsQueue(userId, null);
      const current = settingsRef.current;
      const mergedServer = saved
        ? {
            ...current,
            ...saved,
            hydration: {
              ...current.hydration,
              ...(saved.hydration || {}),
            },
          }
        : pending.settings;
      commitSettings(mergedServer);
    } catch (error) {
      console.warn("[useSettings] Sync paused; local settings kept.", error);
    } finally {
      syncingRef.current = false;
    }
  }, [userId, commitSettings]);

  const refresh = useCallback(async () => {
    if (!userId) return;

    const serverSettings = await settingsApi.get();
    const pending = getSettingsQueue(userId);

    // Never replace newer local edits with an older server snapshot.
    if (pending?.settings) {
      commitSettings(pending.settings);
      return;
    }

    commitSettings(serverSettings || DEFAULTS);
  }, [userId, commitSettings]);

  useEffect(() => {
    if (!enabled || !userId) return;

    let alive = true;
    const cached = loadCache();
    if (!cached) setLoaded(true);

    refresh()
      .catch((error) => {
        console.warn("[useSettings] Background refresh failed:", error);
      })
      .finally(() => {
        if (alive) setLoaded(true);
      });

    return () => {
      alive = false;
    };
  }, [enabled, userId, loadCache, refresh]);

  useEffect(() => {
    if (!enabled || !userId) return;

    const retry = () => syncSettings().catch(() => {});
    retry();
    window.addEventListener("online", retry);
    document.addEventListener("visibilitychange", retry);

    return () => {
      window.removeEventListener("online", retry);
      document.removeEventListener("visibilitychange", retry);
    };
  }, [enabled, userId, syncSettings]);

  const saveSettings = useCallback(
    (next) => {
      if (!userId) return;

      const normalized = commitSettings(next);
      setSettingsQueue(userId, {
        settings: normalized,
        timestamp: Date.now(),
      });

      if (isOnline()) syncSettings().catch(() => {});
    },
    [userId, commitSettings, syncSettings]
  );

  const updateHydration = useCallback(
    (changes) => {
      saveSettings({
        ...settingsRef.current,
        hydration: {
          ...settingsRef.current.hydration,
          ...changes,
        },
      });
    },
    [saveSettings]
  );

  return {
    settings,
    loaded,
    saveSettings,
    updateHydration,
    sync: syncSettings,
  };
}
