import { useEffect, useRef } from "react";

// Helper: parse HH:MM -> Date for today
function parseTimeToday(hhmm) {
  const [h, m] = (hhmm || "08:00").split(":").map(Number);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
}

function minutesBetween(a, b) {
  return Math.max(0, Math.round((b - a) / 60000));
}

// Compute next interval (in minutes) given remaining ml and active minutes
function computeIntervalMin(remainingMl, cupMl, remainingMinutes, minInterval, maxInterval) {
  if (remainingMl <= 0) return null;
  const remindersNeeded = Math.max(1, Math.ceil(remainingMl / cupMl));
  const base = Math.max(1, Math.floor(remainingMinutes / remindersNeeded));
  return Math.max(minInterval, Math.min(maxInterval, base));
}

export function useHydrationReminders({ settings, todayMl = 0, onLogMl }) {
  const scheduledRef = useRef(null);
  // keep reference to native listener so we can remove it
  const nativeListenerRef = useRef(null);

  const QUICK_LOG_KEY = "hydrationQuickLogs";

  function pushQuickLog(ml) {
    try {
      const raw = localStorage.getItem(QUICK_LOG_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push({ ml: Number(ml) || 0, ts: Date.now() });
      // cap stored logs to 50
      if (arr.length > 50) arr.splice(0, arr.length - 50);
      localStorage.setItem(QUICK_LOG_KEY, JSON.stringify(arr));
    } catch (e) {
      // ignore storage failures
    }
  }
  useEffect(() => {
    let cancelled = false;

    async function scheduleNext() {
      if (!settings?.hydration?.enabled) {
        // cancel native notifications we scheduled (only our own IDs)
        try {
          const pkg = "@capacitor/local-notifications";
          const mod = await import(pkg);
          const LocalNotifications = mod.LocalNotifications || mod.default || mod;
          try {
            const pending = await LocalNotifications.getPending();
            const mine = (pending?.notifications || []).filter(n => (n.id >= 2000 && n.id < 3000) || n.id === 3000);
            if (mine.length) {
              await LocalNotifications.cancel({ notifications: mine.map(n => ({ id: n.id })) });
            }
          } catch (_) {}
        } catch (_) {}
        return;
      }

      const h = settings.hydration;
      const cup = h.cupMl || 250;
      const target = h.targetMl || (settings.waterTarget || 8) * cup;

      // compute remaining
      const remainingMl = Math.max(0, target - (todayMl || 0));

      // compute active window
      const now = new Date();
      let windowEnd = parseTimeToday(h.endTime || "20:00");
      let windowStart = parseTimeToday(h.startTime || "08:00");
      if (windowEnd <= windowStart) windowEnd.setDate(windowEnd.getDate() + 1);

      // if we're outside active window, schedule at next window start
      if (now < windowStart) {
        const minutesToStart = minutesBetween(now, windowStart);
        // schedule a gentle reminder at start
        await scheduleAtMinutes(minutesToStart, cup, remainingMl, h);
        return;
      }

      if (now > windowEnd) {
        // schedule for next day's window start
        windowStart.setDate(windowStart.getDate() + 1);
        const minutesToStart = minutesBetween(now, windowStart);
        await scheduleAtMinutes(minutesToStart, cup, remainingMl, h);
        return;
      }

      const remainingMinutes = minutesBetween(now, windowEnd);
      const intervalMin = computeIntervalMin(
        remainingMl,
        cup,
        remainingMinutes || 1,
        h.minIntervalMin || 30,
        h.maxIntervalMin || 180
      );

      if (intervalMin == null) {
        // nothing to schedule — cancel only our scheduled hydration IDs
        try {
          const pkg = "@capacitor/local-notifications";
          const mod = await import(pkg);
          const LocalNotifications = mod.LocalNotifications || mod.default || mod;
          try {
            const pending = await LocalNotifications.getPending();
            const mine = (pending?.notifications || []).filter(n => (n.id >= 2000 && n.id < 3000) || n.id === 3000);
            if (mine.length) {
              await LocalNotifications.cancel({ notifications: mine.map(n => ({ id: n.id })) });
            }
          } catch (_) {}
        } catch (_) {}
        return;
      }

      await scheduleAtMinutes(intervalMin, cup, remainingMl, h);
    }

    async function scheduleAtMinutes(minsFromNow, cup, remainingMl, h) {
      if (cancelled) return;

      const when = new Date(Date.now() + minsFromNow * 60_000);

      // clamp quiet hours: if within quiet hours, move to end of quiet
      const quietStart = parseTimeToday(h.quietHours?.start || "22:00");
      const quietEnd = parseTimeToday(h.quietHours?.end || "07:00");
      if (quietEnd <= quietStart) quietEnd.setDate(quietEnd.getDate() + 1);
      if (when >= quietStart && when <= quietEnd) {
        // schedule after quietEnd
        when.setTime(quietEnd.getTime());
      }

      // Prepare a friendly body based on remaining
      const pct = Math.round((( (settings.hydration?.targetMl || (settings.waterTarget||8)*cup) - remainingMl) / (settings.hydration?.targetMl || (settings.waterTarget||8)*cup)) * 100);
      const bodies = [
        "A tiny sip for today's garden 🌱",
        "Your body is asking for a little refreshment 💧",
        "Time for a small, happy sip ✨",
        "Hydration check — a quick glass? 🥛",
      ];
      const body = bodies[Math.floor(Math.random() * bodies.length)];

      // Try native schedule with action buttons
      try {
        const pkg = "@capacitor/local-notifications";
        const mod = await import(pkg);
        const LocalNotifications = mod.LocalNotifications || mod.default || mod;

        // cancel prior schedules for this hook (only our IDs)
        try {
          const pending = await LocalNotifications.getPending();
          const mine = (pending?.notifications || []).filter(n => (n.id >= 2000 && n.id < 3000));
          if (mine.length) {
            await LocalNotifications.cancel({ notifications: mine.map(n => ({ id: n.id })) });
          }
        } catch (_) {}

        // Register action types (safe to call repeatedly)
        try {
          await LocalNotifications.registerActionTypes({
            types: [
              {
                id: "WATER_ACTIONS",
                actions: [
                  { id: "add250", title: "+250 ml" },
                  { id: "add500", title: "+500 ml" },
                  { id: "snooze30", title: "Snooze 30m" },
                ],
              },
            ],
          });
        } catch (_) {}

        // Create Android channel for hydration reminders
        try {
          await LocalNotifications.createChannel({
            id: "hydration",
            name: "Hydration reminders",
            importance: 4,
            visibility: 1,
          });
        } catch (_) {}

        // If repeatEveryMin is set, schedule a series until window end
        const repeatMin = settings?.hydration?.repeatEveryMin;
        const notifications = [];

        if (repeatMin && repeatMin > 0) {
          // schedule multiple notifications between now and window end
          const nowTime = Date.now();
          const step = repeatMin * 60_000;
          // cap to 24 notifications to avoid huge batches
          for (let offset = Math.max(minsFromNow, 1) * 60_000, i = 0; offset < 24 * 60 * 60_000 && i < 24; offset += step, i++) {
            const at = new Date(nowTime + offset);
            notifications.push({
              id: 2000 + i,
              title: "💧 Hydration reminder",
              body: `${body} — ${Math.max(0, Math.round(remainingMl/100)/10)} L remaining`,
              schedule: { at },
              actionTypeId: "WATER_ACTIONS",
              channelId: "hydration",
              smallIcon: "ic_stat_notify",
            });
          }
        } else {
          notifications.push({
            id: 2000,
            title: "💧 Hydration reminder",
            body: `${body} — ${Math.max(0, Math.round(remainingMl/100)/10)} L remaining`,
            schedule: { at: when },
            actionTypeId: "WATER_ACTIONS",
            channelId: "hydration",
            smallIcon: "ic_stat_notify",
          });
        }

        if (notifications.length > 0) {
          await LocalNotifications.schedule({ notifications });
          scheduledRef.current = notifications[0].schedule.at;
        }

        // Setup action listener once
        if (!nativeListenerRef.current) {
          try {
            nativeListenerRef.current = LocalNotifications.addListener(
              "localNotificationActionPerformed",
              (args) => {
                const id = args.actionId || args.actionId?.toString();
                if (!id) return;
                if (id === "add250") {
                  // store quick log so we can flush when app resumes, and attempt immediate callback
                  pushQuickLog(250);
                  try { onLogMl?.(250); } catch (_) {}
                  try { window.dispatchEvent(new Event("hydration-quicklog-flush")); } catch (_) {}
                } else if (id === "add500") {
                  pushQuickLog(500);
                  try { onLogMl?.(500); } catch (_) {}
                  try { window.dispatchEvent(new Event("hydration-quicklog-flush")); } catch (_) {}
                } else if (id === "snooze30") {
                  // reschedule next notification after snoozeMin
                  const snooze = settings?.hydration?.snoozeMin || 30;
                  // schedule a single notification after snooze
                  (async () => {
                    try {
                      await LocalNotifications.schedule({
                        notifications: [
                          {
                            id: 3000,
                            title: "💧 Hydration reminder",
                            body: "Snoozed — time for a sip soon",
                            schedule: { at: new Date(Date.now() + snooze * 60_000) },
                            actionTypeId: "WATER_ACTIONS",
                            channelId: "hydration",
                            smallIcon: "ic_stat_notify",
                          },
                        ],
                      });
                    } catch (_) {}
                  })();
                }
              }
            );
          } catch (_) {
            nativeListenerRef.current = null;
          }
        }

      } catch (err) {
        // Native not available — fall back to browser Notification if open
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          const delay = Math.max(0, when.getTime() - Date.now());
          setTimeout(() => {
            new Notification("💧 Hydration reminder", { body: body });
          }, delay);
          scheduledRef.current = when;
        }
      }
    }

    scheduleNext();

    return () => {
      cancelled = true;
    };
  }, [settings, todayMl, onLogMl]);
}
