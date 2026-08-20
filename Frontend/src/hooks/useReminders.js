import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { todayStr } from "../constants.js";

// Static imports above are the fix — Capacitor's web build of these
// packages provides safe no-op fallbacks, so this same code path runs
// correctly in both the browser and the native Android/iOS app. The
// previous version used `await import(variableString)`, which Vite
// cannot bundle and which fails silently at runtime in the built APK.
export function useReminders({ enabled, time, todayComplete }) {
  const firedForRef = useRef(null); // "YYYY-MM-DD" already notified today (browser fallback only)

  useEffect(() => {
    if (!enabled || typeof Notification === "undefined") return;
    if (!Capacitor.isNativePlatform() && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [enabled]);

  useEffect(() => {
    let intervalId = null;
    let cancelled = false;

    async function setupNative() {
      if (!Capacitor.isNativePlatform()) return false;

      try {
        await LocalNotifications.requestPermissions();

        // Clear any previously scheduled daily check-in reminder (id 1000)
        // before rescheduling, so settings changes don't create duplicates.
        try {
          const pending = await LocalNotifications.getPending();
          const mine = (pending?.notifications || []).filter((n) => n.id === 1000);
          if (mine.length) {
            await LocalNotifications.cancel({ notifications: mine.map((n) => ({ id: n.id })) });
          }
        } catch { /* nothing pending yet */ }

        if (!enabled) return true;

        const [h, m] = (time || "20:00").split(":").map(Number);

        try {
          await LocalNotifications.createChannel({
            id: "wellness-checkin",
            name: "Daily check-in",
            importance: 3,
          });
        } catch { /* channel already exists */ }

        await LocalNotifications.schedule({
          notifications: [
            {
              id: 1000,
              title: "🌷 Wellness check-in",
              body: "Quickly update today's tracker before the day ends!",
              schedule: { on: { hour: h, minute: m }, allowWhileIdle: true },
              channelId: "wellness-checkin",
              smallIcon: "ic_stat_notify",
            },
          ],
        });

        return true;
      } catch (err) {
        console.error("Native daily reminder scheduling failed:", err);
        return false;
      }
    }

    function startBrowserInterval() {
      if (!enabled || typeof Notification === "undefined") return;

      const check = () => {
        if (Notification.permission !== "granted") return;
        if (todayComplete) return;

        const now = new Date();
        const [h, m] = (time || "20:00").split(":").map(Number);
        const todayKey = todayStr(now);

        const isTime = now.getHours() === h && now.getMinutes() === m;
        if (isTime && firedForRef.current !== todayKey) {
          firedForRef.current = todayKey;
          new Notification("🌷 Wellness check-in", {
            body: "Waittt... let's update today's tracker before the day ends 🥹",
          });
        }
      };

      intervalId = setInterval(check, 30_000);
    }

    (async () => {
      if (!enabled) {
        if (Capacitor.isNativePlatform()) {
          try {
            const pending = await LocalNotifications.getPending();
            const mine = (pending?.notifications || []).filter((n) => n.id === 1000);
            if (mine.length) {
              await LocalNotifications.cancel({ notifications: mine.map((n) => ({ id: n.id })) });
            }
          } catch { /* nothing to cancel */ }
        }
        return;
      }

      const nativeHandled = await setupNative();
      if (!nativeHandled && !cancelled) startBrowserInterval();
    })();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [enabled, time, todayComplete]);
}