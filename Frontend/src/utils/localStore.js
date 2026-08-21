// /*
//   ============================================================
//   WELLNESS TRACKER — LOCAL FIRST STORAGE
//   ============================================================

//   Purpose:
//   - Keep recent data locally for instant rendering.
//   - Server remains the persistent source of truth.
//   - Local changes are never blocked by network requests.
//   - Pending writes survive temporary network failures.
//   - Cache is separated by user.
// */

// const VERSION = 1;

// const PREFIX = "moni-wellness";

// function safeUserId(userId) {
//   return String(userId || "anonymous")
//     .replace(/[^a-zA-Z0-9_-]/g, "_");
// }

// function key(userId, type) {
//   return `${PREFIX}:v${VERSION}:${safeUserId(userId)}:${type}`;
// }

// /* ============================================================
//    SAFE JSON
// ============================================================ */

// function readJSON(storageKey, fallback = null) {
//   try {
//     const raw = localStorage.getItem(storageKey);

//     if (!raw) return fallback;

//     return JSON.parse(raw);
//   } catch (err) {
//     console.warn(
//       `[localStore] Failed reading ${storageKey}`,
//       err
//     );

//     return fallback;
//   }
// }

// function writeJSON(storageKey, value) {
//   try {
//     localStorage.setItem(
//       storageKey,
//       JSON.stringify(value)
//     );

//     return true;
//   } catch (err) {
//     console.warn(
//       `[localStore] Failed writing ${storageKey}`,
//       err
//     );

//     return false;
//   }
// }

// function remove(storageKey) {
//   try {
//     localStorage.removeItem(storageKey);
//   } catch {
//     // Safe to ignore
//   }
// }

// /* ============================================================
//    ENTRIES
// ============================================================ */

// export function getEntriesCache(userId) {
//   return readJSON(
//     key(userId, "entries"),
//     null
//   );
// }

// export function setEntriesCache(userId, entries) {
//   return writeJSON(
//     key(userId, "entries"),
//     entries
//   );
// }

// /* ============================================================
//    SETTINGS
// ============================================================ */

// export function getSettingsCache(userId) {
//   return readJSON(
//     key(userId, "settings"),
//     null
//   );
// }

// export function setSettingsCache(userId, settings) {
//   return writeJSON(
//     key(userId, "settings"),
//     settings
//   );
// }

// /* ============================================================
//    ENTRY SYNC QUEUE
// ============================================================ */

// export function getEntryQueue(userId) {
//   return readJSON(
//     key(userId, "entry-sync-queue"),
//     []
//   );
// }

// export function setEntryQueue(userId, queue) {
//   return writeJSON(
//     key(userId, "entry-sync-queue"),
//     queue
//   );
// }

// /* ============================================================
//    SETTINGS SYNC QUEUE
// ============================================================ */

// export function getSettingsQueue(userId) {
//   return readJSON(
//     key(userId, "settings-sync-queue"),
//     null
//   );
// }

// export function setSettingsQueue(userId, value) {
//   return writeJSON(
//     key(userId, "settings-sync-queue"),
//     value
//   );
// }

// /* ============================================================
//    CACHE METADATA
// ============================================================ */

// export function getCacheMeta(userId) {
//   return readJSON(
//     key(userId, "meta"),
//     {}
//   );
// }

// export function setCacheMeta(userId, meta) {
//   return writeJSON(
//     key(userId, "meta"),
//     meta
//   );
// }

// /* ============================================================
//    USER CACHE CLEAR
// ============================================================ */

// export function clearUserCache(userId) {
//   remove(key(userId, "entries"));
//   remove(key(userId, "settings"));
//   remove(key(userId, "entry-sync-queue"));
//   remove(key(userId, "settings-sync-queue"));
//   remove(key(userId, "meta"));
// }

// /* ============================================================
//    NETWORK HELPER
// ============================================================ */

// export function isOnline() {
//   if (typeof navigator === "undefined") {
//     return true;
//   }

//   return navigator.onLine !== false;
// }

// /* ============================================================
//    STORAGE EVENT
// ============================================================ */

// export function subscribeToStorage(callback) {
//   if (
//     typeof window === "undefined" ||
//     typeof window.addEventListener !== "function"
//   ) {
//     return () => {};
//   }

//   const handler = (event) => {
//     if (!event.key) return;

//     if (
//       event.key.includes(`${PREFIX}:v${VERSION}:`)
//     ) {
//       callback(event);
//     }
//   };

//   window.addEventListener(
//     "storage",
//     handler
//   );

//   return () => {
//     window.removeEventListener(
//       "storage",
//       handler
//     );
//   };
// }

/*
 * Wellness Tracker - local-first cache
 *
 * The server remains the persistent source of truth, while this layer keeps
 * the most recent local state available for instant rendering and offline
 * mutations. All tracker data is scoped to the logged-in user.
 */

const VERSION = 1;
const PREFIX = `wellness:v${VERSION}`;

function normalizeUserId(userId) {
  return String(userId || "anonymous").replace(/[^a-zA-Z0-9._-]/g, "_");
}

function makeKey(userId, type) {
  return `${PREFIX}:${normalizeUserId(userId)}:${type}`;
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch (error) {
    console.warn(`[localStore] Could not read ${key}`, error);
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[localStore] Could not write ${key}`, error);
    return false;
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage cleanup errors.
  }
}

export function getEntriesCache(userId) {
  return readJSON(makeKey(userId, "entries"), null);
}

export function setEntriesCache(userId, entries) {
  return writeJSON(makeKey(userId, "entries"), entries);
}

export function getEntryQueue(userId) {
  const value = readJSON(makeKey(userId, "entry-sync-queue"), []);
  return Array.isArray(value) ? value : [];
}

export function setEntryQueue(userId, queue) {
  return writeJSON(makeKey(userId, "entry-sync-queue"), queue);
}

export function getSettingsCache(userId) {
  return readJSON(makeKey(userId, "settings"), null);
}

export function setSettingsCache(userId, settings) {
  return writeJSON(makeKey(userId, "settings"), settings);
}

export function getSettingsQueue(userId) {
  return readJSON(makeKey(userId, "settings-sync-queue"), null);
}

export function setSettingsQueue(userId, queueItem) {
  if (queueItem == null) {
    remove(makeKey(userId, "settings-sync-queue"));
    return true;
  }
  return writeJSON(makeKey(userId, "settings-sync-queue"), queueItem);
}

export function clearUserCache(userId) {
  remove(makeKey(userId, "entries"));
  remove(makeKey(userId, "entry-sync-queue"));
  remove(makeKey(userId, "settings"));
  remove(makeKey(userId, "settings-sync-queue"));
  remove(makeKey(userId, "stars"));
  remove(makeKey(userId, "analytics-weekly-summary"));
  remove(makeKey(userId, "analytics-correlation"));
}

export function isOnline() {
  return typeof navigator === "undefined" ? true : navigator.onLine !== false;
}

export function getStarsCache(userId) {
  const value = readJSON(makeKey(userId, "stars"), null);
  return Array.isArray(value) ? value : null;
}

export function setStarsCache(userId, stars) {
  return writeJSON(makeKey(userId, "stars"), stars);
}

export function getAnalyticsCache(userId, name) {
  return readJSON(makeKey(userId, `analytics-${name}`), null);
}

export function setAnalyticsCache(userId, name, value) {
  return writeJSON(makeKey(userId, `analytics-${name}`), {
    value,
    cachedAt: Date.now(),
  });
}

const CYCLE_CACHE_PREFIX = "mwt:cycle-history:";

function getCycleCacheKey(userId) {
  return `${CYCLE_CACHE_PREFIX}${userId || "anonymous"}`;
}

export function getCycleHistoryCache(userId) {
  try {
    const raw = localStorage.getItem(
      getCycleCacheKey(userId)
    );

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch (err) {
    console.warn(
      "[localStore] Failed to read cycle history cache:",
      err
    );

    return null;
  }
}

export function setCycleHistoryCache(
  userId,
  data
) {
  try {
    localStorage.setItem(
      getCycleCacheKey(userId),
      JSON.stringify(data)
    );

    return true;
  } catch (err) {
    console.warn(
      "[localStore] Failed to save cycle history cache:",
      err
    );

    return false;
  }
}

export function clearCycleHistoryCache(
  userId
) {
  try {
    localStorage.removeItem(
      getCycleCacheKey(userId)
    );
  } catch {
    // Ignore storage errors
  }
}