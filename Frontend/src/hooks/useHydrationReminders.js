import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { getHydrationGlassMl, getHydrationTargetMl } from "../utils/hydration.js";


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

function pushQuickGlassLog(glasses) {
  try {
    const raw = localStorage.getItem(QUICK_LOG_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({ glasses: Number(glasses) || 0, ts: Date.now() });
    if (arr.length > 50) arr.splice(0, arr.length - 50);
    localStorage.setItem(QUICK_LOG_KEY, JSON.stringify(arr));
  } catch { /* storage unavailable */ }
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

export function useHydrationReminders({ settings, todayMl = 0, onLogMl, onLogGlasses }) {
  const scheduledRef = useRef(null);
  const nativeListenerRef = useRef(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    let cancelled = false;

    async function scheduleNext() {
      if (!Capacitor.isNativePlatform()) return; // web fallback handled separately below
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        console.warn('Hydration reminders need notification permission.');
        return;
      }
      if (!settings?.hydration?.enabled) {
        await cancelHydrationNotifications();
        return;
      }

      const h = settings.hydration;
      const cup = getHydrationGlassMl(settings);
      const target = getHydrationTargetMl(settings);
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

      const REMINDER_BODIES = [
  "A tiny sip for today's garden 🌱",
  "Your body is asking for a little refreshment 💧",
  "Time for a small, happy sip ✨",
  "Hydration check — a quick glass? 🥛",
  "Little sips, big glow ✨",
  "Pssst… your plants (and you) need water 🌿",
  "A quick water break sounds nice right now 💦",
  "Stay glowy — sip some water 🌸",
  "Your garden's thirsty, and so are you 🌷",
  "Just a sip, no big deal 🥰",
  "Water o'clock 💧⏰",
  "Keep the streak flowing — sip time 🌊",
];
function getReminderBody() {
  return REMINDER_BODIES[
    Math.floor(Math.random() * REMINDER_BODIES.length)
  ];
}
    const remainingLiters = Math.max(0, Math.round(remainingMl / 100) / 10);

      try {
        await cancelHydrationNotifications();

        try {
          await LocalNotifications.registerActionTypes({
            types: [{
              id: "WATER_ACTIONS",
              actions: [
                { id: "addGlass", title: "+1 glass", foreground: false  },
                { id: "addTwoGlasses", title: "+2 glasses" , foreground: false },
                { id: "snooze30", title: "Snooze 30m", foreground: false  },
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
              body: `${getReminderBody()} — ${remainingLiters} L remaining`,
              schedule: { at: new Date(nowTime + offset), allowWhileIdle: true },
              actionTypeId: "WATER_ACTIONS",
              channelId: "hydration",
              smallIcon: "ic_stat_notify",
            });
          }
        } else {
          notifications.push({
            id: 2000,
            title: "💧 Hydration reminder",
            body: `${getReminderBody()} — ${remainingLiters} L remaining`,
            schedule: { at: when, allowWhileIdle: true },
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
              if (id === "addGlass") {
                pushQuickGlassLog(1);
                window.dispatchEvent(new Event("hydration-quicklog-flush"));
              } else if (id === "addTwoGlasses") {
                pushQuickGlassLog(2);
                window.dispatchEvent(new Event("hydration-quicklog-flush"));
              } else if (id === "snooze30") {
                const snooze = settingsRef.current?.hydration?.snoozeMin || 30;
                LocalNotifications.schedule({
                  notifications: [{
                    id: 3000,
                    title: "💧 Hydration reminder",
                    body: getReminderBody(),
                    schedule: { at: new Date(Date.now() + snooze * 60_000), allowWhileIdle: true },
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
  }, [settings, todayMl, onLogMl, onLogGlasses]);

  // Web-only fallback: a single in-tab browser Notification, since there is
  // no way to schedule real background notifications from a browser tab.
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    if (!settings?.hydration?.enabled) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") Notification.requestPermission();

    const h = settings.hydration;
    const cup = getHydrationGlassMl(settings);
    const target = getHydrationTargetMl(settings);
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
        new Notification("💧 Hydration reminder", { body: getReminderBody() });
      }
    }, intervalMin * 60_000);

    return () => clearTimeout(timeout);
  }, [settings, todayMl]);
}
