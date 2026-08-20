import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

// Static imports (see useReminders.js for why) — this was the actual
// reason hydration notifications never appeared in the APK build.

function parseTimeToday(hhmm) {
  const [h, m] = (hhmm || "08:00").split(":").map(Number);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
}

function minutesBetween(a, b) {
  return Math.max(0, Math.round((b - a) / 60000));
}

function computeIntervalMin(remainingMl, cupMl, remainingMinutes, minInterval, maxInterval) {
  if (remainingMl <= 0) return null;
  const remindersNeeded = Math.max(1, Math.ceil(remainingMl / cupMl));
  const base = Math.max(1, Math.floor(remainingMinutes / remindersNeeded));
  return Math.max(minInterval, Math.min(maxInterval, base));
}

const QUICK_LOG_KEY = "hydrationQuickLogs";

function pushQuickLog(ml) {
  try {
    const raw = localStorage.getItem(QUICK_LOG_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({ ml: Number(ml) || 0, ts: Date.now() });
    if (arr.length > 50) arr.splice(0, arr.length - 50);
    localStorage.setItem(QUICK_LOG_KEY, JSON.stringify(arr));
  } catch { /* storage unavailable — safe to skip */ }
}

async function cancelHydrationNotifications() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const pending = await LocalNotifications.getPending();
    const mine = (pending?.notifications || []).filter(
      (n) => (n.id >= 2000 && n.id < 3000) || n.id === 3000
    );
    if (mine.length) {
      await LocalNotifications.cancel({ notifications: mine.map((n) => ({ id: n.id })) });
    }
  } catch { /* nothing pending */ }
}

export function useHydrationReminders({ settings, todayMl = 0, onLogMl }) {
  const scheduledRef = useRef(null);
  const nativeListenerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function scheduleNext() {
      if (!Capacitor.isNativePlatform()) return; // web fallback handled separately below
      if (!settings?.hydration?.enabled) {
        await cancelHydrationNotifications();
        return;
      }

      const h = settings.hydration;
      const cup = h.cupMl || 250;
      const target = h.targetMl || (settings.waterTarget || 8) * cup;
      const remainingMl = Math.max(0, target - (todayMl || 0));

      const now = new Date();
      let windowEnd = parseTimeToday(h.endTime || "20:00");
      let windowStart = parseTimeToday(h.startTime || "08:00");
      if (windowEnd <= windowStart) windowEnd.setDate(windowEnd.getDate() + 1);

      if (now < windowStart) {
        await scheduleAtMinutes(minutesBetween(now, windowStart), cup, remainingMl, h, target);
        return;
      }
      if (now > windowEnd) {
        windowStart.setDate(windowStart.getDate() + 1);
        await scheduleAtMinutes(minutesBetween(now, windowStart), cup, remainingMl, h, target);
        return;
      }

      const remainingMinutes = minutesBetween(now, windowEnd);
      const intervalMin = computeIntervalMin(
        remainingMl, cup, remainingMinutes || 1,
        h.minIntervalMin || 30, h.maxIntervalMin || 180
      );

      if (intervalMin == null) {
        await cancelHydrationNotifications();
        return;
      }

      await scheduleAtMinutes(intervalMin, cup, remainingMl, h, target);
    }

    async function scheduleAtMinutes(minsFromNow, cup, remainingMl, h, target) {
      if (cancelled || !Capacitor.isNativePlatform()) return;

      const when = new Date(Date.now() + minsFromNow * 60_000);

      const quietStart = parseTimeToday(h.quietHours?.start || "22:00");
      const quietEnd = parseTimeToday(h.quietHours?.end || "07:00");
      if (quietEnd <= quietStart) quietEnd.setDate(quietEnd.getDate() + 1);
      if (when >= quietStart && when <= quietEnd) when.setTime(quietEnd.getTime());

      const bodies = [
        "A tiny sip for today's garden 🌱",
        "Your body is asking for a little refreshment 💧",
        "Time for a small, happy sip ✨",
        "Hydration check — a quick glass? 🥛",
      ];
      const body = bodies[Math.floor(Math.random() * bodies.length)];
      const remainingLiters = Math.max(0, Math.round(remainingMl / 100) / 10);

      try {
        await cancelHydrationNotifications();

        try {
          await LocalNotifications.registerActionTypes({
            types: [{
              id: "WATER_ACTIONS",
              actions: [
                { id: "add250", title: "+250 ml" },
                { id: "add500", title: "+500 ml" },
                { id: "snooze30", title: "Snooze 30m" },
              ],
            }],
          });
        } catch { /* already registered */ }

        try {
          await LocalNotifications.createChannel({
            id: "hydration",
            name: "Hydration reminders",
            importance: 4,
            visibility: 1,
          });
        } catch { /* channel already exists */ }

        const repeatMin = h.repeatEveryMin;
        const notifications = [];

        if (repeatMin && repeatMin > 0) {
          const nowTime = Date.now();
          const step = repeatMin * 60_000;
          for (let offset = Math.max(minsFromNow, 1) * 60_000, i = 0; offset < 24 * 60 * 60_000 && i < 24; offset += step, i++) {
            notifications.push({
              id: 2000 + i,
              title: "💧 Hydration reminder",
              body: `${body} — ${remainingLiters} L remaining`,
              schedule: { at: new Date(nowTime + offset) },
              actionTypeId: "WATER_ACTIONS",
              channelId: "hydration",
              smallIcon: "ic_stat_notify",
            });
          }
        } else {
          notifications.push({
            id: 2000,
            title: "💧 Hydration reminder",
            body: `${body} — ${remainingLiters} L remaining`,
            schedule: { at: when },
            actionTypeId: "WATER_ACTIONS",
            channelId: "hydration",
            smallIcon: "ic_stat_notify",
          });
        }

        await LocalNotifications.schedule({ notifications });
        scheduledRef.current = notifications[0].schedule.at;

        if (!nativeListenerRef.current) {
          nativeListenerRef.current = await LocalNotifications.addListener(
            "localNotificationActionPerformed",
            (args) => {
              const id = args.actionId;
              if (!id) return;
              if (id === "add250") {
                pushQuickLog(250);
                try { onLogMl?.(250); } catch { /* app not focused to log immediately */ }
                window.dispatchEvent(new Event("hydration-quicklog-flush"));
              } else if (id === "add500") {
                pushQuickLog(500);
                try { onLogMl?.(500); } catch { /* app not focused to log immediately */ }
                window.dispatchEvent(new Event("hydration-quicklog-flush"));
              } else if (id === "snooze30") {
                const snooze = settings?.hydration?.snoozeMin || 30;
                LocalNotifications.schedule({
                  notifications: [{
                    id: 3000,
                    title: "💧 Hydration reminder",
                    body: "Snoozed — time for a sip soon",
                    schedule: { at: new Date(Date.now() + snooze * 60_000) },
                    actionTypeId: "WATER_ACTIONS",
                    channelId: "hydration",
                    smallIcon: "ic_stat_notify",
                  }],
                }).catch(() => {});
              }
            }
          );
        }
      } catch (err) {
        console.error("Native hydration scheduling failed:", err);
      }
    }

    scheduleNext();
    return () => { cancelled = true; };
  }, [settings, todayMl, onLogMl]);

  // Web-only fallback: a single in-tab browser Notification, since there is
  // no way to schedule real background notifications from a browser tab.
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    if (!settings?.hydration?.enabled) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") Notification.requestPermission();

    const h = settings.hydration;
    const cup = h.cupMl || 250;
    const target = h.targetMl || (settings.waterTarget || 8) * cup;
    const remainingMl = Math.max(0, target - (todayMl || 0));
    if (remainingMl <= 0) return;

    const now = new Date();
    const windowEnd = parseTimeToday(h.endTime || "20:00");
    const windowStart = parseTimeToday(h.startTime || "08:00");
    if (now < windowStart || now > windowEnd) return;

    const remainingMinutes = minutesBetween(now, windowEnd);
    const intervalMin = computeIntervalMin(remainingMl, cup, remainingMinutes || 1, h.minIntervalMin || 30, h.maxIntervalMin || 180);
    if (intervalMin == null) return;

    const timeout = setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification("💧 Hydration reminder", { body: "Time for a small, happy sip ✨" });
      }
    }, intervalMin * 60_000);

    return () => clearTimeout(timeout);
  }, [settings, todayMl]);
}