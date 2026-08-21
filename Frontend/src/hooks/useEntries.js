// // import { useState, useEffect, useCallback } from "react";
// // import { entriesApi } from "../api/index.js";
// // import { addDays, todayStr } from "../constants.js";

// // // Keeps ~4 months of history in memory — enough for calendar + analytics
// // // without pulling a user's entire multi-year history on every load.
// // const RANGE_DAYS = 120;

// // export function useEntries(enabled) {
// //   const [entries, setEntries] = useState({});
// //   const [loaded, setLoaded] = useState(false);

// //   const refetch = useCallback(async () => {
// //     const start = addDays(todayStr(), -RANGE_DAYS);
// //     const end = todayStr();
// //     const data = await entriesApi.range(start, end);
// //     setEntries(data);
// //     setLoaded(true);
// //   }, []);

// //   useEffect(() => {
// //     if (!enabled) return;
// //     refetch().catch((err) => {
// //       console.error("Failed to load entries:", err);
// //       setLoaded(true);
// //     });
// //   }, [enabled, refetch]);

// //   const saveCategory = useCallback(async (date, category, data) => {
// //     // optimistic update so the UI feels instant
// //     setEntries((prev) => ({ ...prev, [date]: { ...(prev[date] || {}), [category]: data } }));
// //     try {
// //       const saved = await entriesApi.save(date, category, data);
// //       setEntries((prev) => ({ ...prev, [date]: saved }));
// //     } catch (err) {
// //       console.error("Failed to save entry, refetching to stay in sync:", err);
// //       refetch().catch(() => {});
// //     }
// //   }, [refetch]);

// //   const toggleHabit = useCallback(async (date, habitId) => {
// //     const current = entries[date]?.habits || {};
// //     const nextHabits = { ...current, [habitId]: !current[habitId] };
// //     await saveCategory(date, "habits", nextHabits);
// //   }, [entries, saveCategory]);

// //   const getHistory = useCallback((date) => entriesApi.history(date), []);

// //   return { entries, loaded, saveCategory, toggleHabit, getHistory, refetch };
// // }


// import {
//   useState,
//   useEffect,
//   useCallback,
//   useRef,
// } from "react";

// import { entriesApi } from "../api/index.js";
// import {
//   addDays,
//   todayStr,
// } from "../constants.js";

// import {
//   getEntriesCache,
//   setEntriesCache,
//   getEntryQueue,
//   setEntryQueue,
//   isOnline,
// } from "../utils/localStore.js";

// /*
//   Keep recent history locally.

//   120 days gives:
//   - calendar
//   - dashboard
//   - analytics
//   - streak calculations
//   - recent journal data

//   without loading the entire history every time.
// */
// const RANGE_DAYS = 120;

// export function useEntries(enabled, userId) {
//   const [entries, setEntries] = useState({});
//   const [loaded, setLoaded] = useState(false);

//   const entriesRef = useRef({});
//   const syncingRef = useRef(false);

//   /*
//     Keep ref synchronized.
//   */
//   useEffect(() => {
//     entriesRef.current = entries;
//   }, [entries]);

//   /* ========================================================
//      CACHE
//   ======================================================== */

//   const loadLocalCache = useCallback(() => {
//     if (!userId) return null;

//     const cached = getEntriesCache(userId);

//     if (
//       cached &&
//       typeof cached === "object" &&
//       !Array.isArray(cached)
//     ) {
//       setEntries(cached);
//       entriesRef.current = cached;

//       return cached;
//     }

//     return null;
//   }, [userId]);

//   /* ========================================================
//      SAVE CACHE
//   ======================================================== */

//   const cacheEntries = useCallback(
//     (next) => {
//       if (!userId) return;

//       entriesRef.current = next;

//       setEntries(next);

//       setEntriesCache(
//         userId,
//         next
//       );
//     },
//     [userId]
//   );

//   /* ========================================================
//      SYNC QUEUE
//   ======================================================== */

//   const queueMutation = useCallback(
//     (mutation) => {
//       if (!userId) return;

//       const queue =
//         getEntryQueue(userId);

//       /*
//         Replace an existing mutation for
//         the same date + category.

//         Example:

//         water 5
//         water 6
//         water 7

//         We only need to send the newest
//         state eventually.
//       */
//       const filtered =
//         queue.filter(
//           (item) =>
//             !(
//               item.date === mutation.date &&
//               item.category === mutation.category
//             )
//         );

//       filtered.push(mutation);

//       setEntryQueue(
//         userId,
//         filtered
//       );
//     },
//     [userId]
//   );

//   /* ========================================================
//      SYNC LOCAL CHANGES
//   ======================================================== */

//   const syncQueue = useCallback(
//     async () => {
//       if (
//         !userId ||
//         syncingRef.current ||
//         !isOnline()
//       ) {
//         return;
//       }

//       syncingRef.current = true;

//       try {
//         const queue =
//           getEntryQueue(userId);

//         if (!queue.length) {
//           return;
//         }

//         /*
//           Work through the queue one mutation
//           at a time.

//           This prevents overlapping writes
//           from racing each other.
//         */
//         for (
//           const mutation of queue
//         ) {
//           try {
//             const saved =
//               await entriesApi.save(
//                 mutation.date,
//                 mutation.category,
//                 mutation.data
//               );

//             /*
//               IMPORTANT:

//               Only apply server response if
//               there isn't a newer local mutation
//               for this same date/category.
//             */
//             const latestQueue =
//               getEntryQueue(userId);

//             const hasNewer =
//               latestQueue.some(
//                 (item) =>
//                   item.date === mutation.date &&
//                   item.category === mutation.category &&
//                   item.timestamp >
//                     mutation.timestamp
//               );

//             if (!hasNewer && saved) {
//               const current =
//                 entriesRef.current;

//               const next = {
//                 ...current,
//                 [mutation.date]: {
//                   ...(current[mutation.date] || {}),
//                   ...saved,
//                 },
//               };

//               cacheEntries(next);
//             }

//             /*
//               Remove this exact mutation
//               from queue.
//             */
//             const remaining =
//               getEntryQueue(userId).filter(
//                 (item) =>
//                   item.id !== mutation.id
//               );

//             setEntryQueue(
//               userId,
//               remaining
//             );
//           } catch (err) {
//             console.warn(
//               "[useEntries] Sync failed. Keeping mutation queued.",
//               err
//             );

//             /*
//               Stop here.

//               If network is down, don't burn through
//               the entire queue.
//             */
//             break;
//           }
//         }
//       } finally {
//         syncingRef.current = false;
//       }
//     },
//     [userId, cacheEntries]
//   );

//   /* ========================================================
//      INITIAL LOAD
//   ======================================================== */

//   useEffect(() => {
//     if (!enabled || !userId) return;

//     let alive = true;

//     /*
//       STEP 1
//       Render local data immediately.
//     */
//     const cached =
//       loadLocalCache();

//     /*
//       Even if there is no cache,
//       UI should become usable.
//     */
//     if (!cached) {
//       setLoaded(true);
//     }

//     /*
//       STEP 2
//       Fetch server data in background.
//     */
//     const refresh = async () => {
//       try {
//         const start =
//           addDays(
//             todayStr(),
//             -RANGE_DAYS
//           );

//         const end =
//           todayStr();

//         const serverData =
//           await entriesApi.range(
//             start,
//             end
//           );

//         if (!alive) return;

//         /*
//           Merge server data with local
//           pending changes.

//           Local pending mutations win.
//         */
//         let merged = {
//           ...(serverData || {}),
//         };

//         const queue =
//           getEntryQueue(userId);

//         for (
//           const mutation of queue
//         ) {
//           merged = {
//             ...merged,

//             [mutation.date]: {
//               ...(merged[mutation.date] || {}),
//               [mutation.category]:
//                 mutation.data,
//             },
//           };
//         }

//         cacheEntries(merged);

//         /*
//           Background sync after fresh server
//           data arrives.
//         */
//         await syncQueue();
//       } catch (err) {
//         console.warn(
//           "[useEntries] Background refresh failed:",
//           err
//         );
//       } finally {
//         if (alive) {
//           setLoaded(true);
//         }
//       }
//     };

//     refresh();

//     return () => {
//       alive = false;
//     };
//   }, [
//     enabled,
//     userId,
//     loadLocalCache,
//     cacheEntries,
//     syncQueue,
//   ]);

//   /* ========================================================
//      ONLINE / VISIBILITY SYNC
//   ======================================================== */

//   useEffect(() => {
//     if (!enabled || !userId) {
//       return;
//     }

//     const sync = () => {
//       syncQueue().catch(() => {});
//     };

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
//     syncQueue,
//   ]);

//   /* ========================================================
//      SAVE CATEGORY
//   ======================================================== */

//   const saveCategory = useCallback(
//     async (
//       date,
//       category,
//       data
//     ) => {
//       if (!userId) return;

//       /*
//         LOCAL FIRST

//         Update UI immediately.
//       */
//       const current =
//         entriesRef.current;

//       const next = {
//         ...current,

//         [date]: {
//           ...(current[date] || {}),
//           [category]: data,
//         },
//       };

//       cacheEntries(next);

//       /*
//         Queue server mutation.
//       */
//       queueMutation({
//         id:
//           `${Date.now()}-${Math.random()
//             .toString(36)
//             .slice(2)}`,

//         date,
//         category,
//         data,

//         timestamp:
//           Date.now(),
//       });

//       /*
//         Try immediately if online.

//         UI does NOT wait for this.
//       */
//       if (isOnline()) {
//         syncQueue().catch(() => {});
//       }
//     },
//     [
//       userId,
//       cacheEntries,
//       queueMutation,
//       syncQueue,
//     ]
//   );

//   /* ========================================================
//      SAFE CATEGORY UPDATE
//   ======================================================== */

//   const updateCategory = useCallback(
//     (
//       date,
//       category,
//       updater
//     ) => {
//       const current =
//         entriesRef.current;

//       const previous =
//         current[date]?.[category];

//       const nextData =
//         typeof updater === "function"
//           ? updater(previous)
//           : updater;

//       saveCategory(
//         date,
//         category,
//         nextData
//       );
//     },
//     [saveCategory]
//   );

//   /* ========================================================
//      HABITS
//   ======================================================== */

//   const toggleHabit =
//     useCallback(
//       (
//         date,
//         habitId
//       ) => {
//         updateCategory(
//           date,
//           "habits",
//           (current = {}) => ({
//             ...current,
//             [habitId]:
//               !current[habitId],
//           })
//         );
//       },
//       [updateCategory]
//     );

//   /* ========================================================
//      HISTORY
//   ======================================================== */

//   const getHistory =
//     useCallback(
//       (date) =>
//         entriesApi.history(
//           date
//         ),
//       []
//     );

//   return {
//     entries,
//     loaded,

//     saveCategory,
//     updateCategory,

//     toggleHabit,

//     getHistory,

//     refetch: syncQueue,
//   };
// }

import { useState, useEffect, useCallback, useRef } from "react";
import { entriesApi } from "../api/index.js";
import { addDays, todayStr } from "../constants.js";
import {
  getEntriesCache,
  setEntriesCache,
  getEntryQueue,
  setEntryQueue,
  isOnline,
} from "../utils/localStore.js";

// Recent history is enough for the dashboard, calendar and most analytics.
const RANGE_DAYS = 120;

function mutationId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useEntries(enabled, userId) {
  const [entries, setEntries] = useState({});
  const [loaded, setLoaded] = useState(false);

  const entriesRef = useRef({});
  const syncingRef = useRef(false);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const commitEntries = useCallback(
    (next) => {
      entriesRef.current = next;
      setEntries(next);
      if (userId) setEntriesCache(userId, next);
    },
    [userId]
  );

  const loadCache = useCallback(() => {
    if (!userId) return null;

    const cached = getEntriesCache(userId);
    if (!cached || typeof cached !== "object" || Array.isArray(cached)) {
      return null;
    }

    entriesRef.current = cached;
    setEntries(cached);
    return cached;
  }, [userId]);

  const queueMutation = useCallback(
    (date, category, data) => {
      if (!userId) return;

      const queue = getEntryQueue(userId);
      const item = {
        id: mutationId(),
        date,
        category,
        data,
        timestamp: Date.now(),
      };

      // Only the newest value for a date/category needs to be synced.
      const nextQueue = queue.filter(
        (queued) => !(queued.date === date && queued.category === category)
      );
      nextQueue.push(item);
      setEntryQueue(userId, nextQueue);
    },
    [userId]
  );

  const syncQueue = useCallback(async () => {
    if (!userId || syncingRef.current || !isOnline()) return;

    syncingRef.current = true;

    try {
      while (true) {
        const queue = getEntryQueue(userId);
        if (!queue.length) break;

        // Oldest first makes the sync deterministic.
        const mutation = [...queue].sort(
          (a, b) => a.timestamp - b.timestamp
        )[0];

        try {
          const saved = await entriesApi.save(
            mutation.date,
            mutation.category,
            mutation.data
          );

          const latestQueue = getEntryQueue(userId);
          const newerMutation = latestQueue.some(
            (item) =>
              item.date === mutation.date &&
              item.category === mutation.category &&
              item.timestamp > mutation.timestamp
          );

          if (!newerMutation && saved) {
            const current = entriesRef.current;
            const next = {
              ...current,
              [mutation.date]: {
                ...(current[mutation.date] || {}),
                ...saved,
              },
            };
            commitEntries(next);
          }

          // Remove only the mutation we just sent. If a newer mutation was
          // created while the request was running, it stays in the queue.
          setEntryQueue(
            userId,
            getEntryQueue(userId).filter(
              (item) => item.id !== mutation.id
            )
          );
        } catch (error) {
          console.warn("[useEntries] Sync paused; mutation kept queued.", error);
          break;
        }
      }
    } finally {
      syncingRef.current = false;
    }
  }, [userId, commitEntries]);

  const refresh = useCallback(async () => {
    if (!userId) return;

    const start = addDays(todayStr(), -RANGE_DAYS);
    const end = todayStr();

    const serverData = await entriesApi.range(start, end);
    let merged = serverData && typeof serverData === "object" ? serverData : {};

    // Pending local mutations always win over the server snapshot.
    for (const mutation of getEntryQueue(userId)) {
      merged = {
        ...merged,
        [mutation.date]: {
          ...(merged[mutation.date] || {}),
          [mutation.category]: mutation.data,
        },
      };
    }

    commitEntries(merged);
    await syncQueue();
  }, [userId, commitEntries, syncQueue]);

  useEffect(() => {
    if (!enabled || !userId) return;

    let alive = true;

    // Render cached data first. The API never blocks the first usable render.
    const cached = loadCache();
    if (!cached) setLoaded(true);

    refresh()
      .catch((error) => {
        console.warn("[useEntries] Background refresh failed:", error);
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

    const retry = () => {
      syncQueue().catch(() => {});
    };

    window.addEventListener("online", retry);
    document.addEventListener("visibilitychange", retry);

    return () => {
      window.removeEventListener("online", retry);
      document.removeEventListener("visibilitychange", retry);
    };
  }, [enabled, userId, syncQueue]);

  const saveCategory = useCallback(
    (date, category, data) => {
      if (!userId) return;

      // Local-first: update the UI and persistent browser cache immediately.
      const current = entriesRef.current;
      const next = {
        ...current,
        [date]: {
          ...(current[date] || {}),
          [category]: data,
        },
      };

      commitEntries(next);
      queueMutation(date, category, data);

      // The UI does not await the network.
      if (isOnline()) syncQueue().catch(() => {});
    },
    [userId, commitEntries, queueMutation, syncQueue]
  );

  // Functional updates prevent rapid taps from reading stale todayEntry data.
  const updateCategory = useCallback(
    (date, category, updater) => {
      const current = entriesRef.current;
      const previous = current[date]?.[category];
      const nextData =
        typeof updater === "function" ? updater(previous) : updater;
      saveCategory(date, category, nextData);
    },
    [saveCategory]
  );

  const toggleHabit = useCallback(
    (date, habitId) => {
      updateCategory(date, "habits", (current = {}) => ({
        ...current,
        [habitId]: !current[habitId],
      }));
    },
    [updateCategory]
  );

  const getHistory = useCallback((date) => entriesApi.history(date), []);

  return {
    entries,
    loaded,
    saveCategory,
    updateCategory,
    toggleHabit,
    getHistory,
    refetch: refresh,
    sync: syncQueue,
  };
}
