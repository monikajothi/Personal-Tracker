import { useEffect, useRef } from "react";
import { todayStr } from "../constants.js";

// useReminders now supports native scheduled notifications via
// @capacitor/local-notifications when running inside the Capacitor
// Android/iOS app. In the browser it falls back to the existing
// Notification API (fires only while the page is open).
export function useReminders({ enabled, time, todayComplete }) {
  const firedForRef = useRef(null); // "YYYY-MM-DD" already notified today
  const nativeScheduledRef = useRef(false);

  // Request browser permission when enabled (fallback)
  useEffect(() => {
    if (!enabled || typeof Notification === "undefined") return;
    if (Notification.permission === "default") Notification.requestPermission();
  }, [enabled]);

  // Main effect: either schedule native local notifications or run the
  // browser interval-based notifier.
  useEffect(() => {
    let intervalId = null;
    let cancelled = false;

    async function setupNative() {
      try {
        // Dynamic imports so bundlers don't fail for web builds
        const corePkg = "@capacitor/core";
        const coreMod = await import(corePkg);
        const Capacitor = coreMod.Capacitor || coreMod.default || coreMod;
        if (!Capacitor || !Capacitor.isNativePlatform || !Capacitor.isNativePlatform()) {
          return false;
        }

        const lnPkg = "@capacitor/local-notifications";
        const lnMod = await import(lnPkg);
        const LocalNotifications = lnMod.LocalNotifications || lnMod.default || lnMod;

        // Ask permission
        await LocalNotifications.requestPermissions();

        // Clear previously scheduled notifications for this app to avoid duplicates
        try {
          const pending = await LocalNotifications.getPending();
          const mine = (pending?.notifications || []).filter(n => n.id === 1000);
          if (mine.length) {
            await LocalNotifications.cancel({ notifications: mine.map(n => ({ id: n.id })) });
          }
        } catch (e) {
          // ignore cancel errors
        }

        if (!enabled) return true;

        // Parse configured time (HH:MM)
        const [h, m] = (time || "20:00").split(":").map(Number);

        // Compute next occurrence
        const now = new Date();
        const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 1);

        // Create Android channel for daily check-in
        try {
          await LocalNotifications.createChannel({
            id: "wellness-checkin",
            name: "Daily check-in",
            importance: 3,
          });
        } catch (_) {}

        // Schedule a daily notification at the chosen hour/minute using wall-clock `on`.
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

        nativeScheduledRef.current = true;
        return true;
      } catch (err) {
        // Not running inside Capacitor native platform or plugin not installed
        console.debug("Native notifications not available:", err?.message || err);
        return false;
      }
    }

    // Browser fallback notifier (single daily time while the tab is open)
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
        // If we have native scheduled notifications previously, cancel only our ID
        try {
          const lnPkg = "@capacitor/local-notifications";
          const lnMod = await import(lnPkg);
          const LocalNotifications = lnMod.LocalNotifications || lnMod.default || lnMod;
          try {
            const pending = await LocalNotifications.getPending();
            const mine = (pending?.notifications || []).filter(n => n.id === 1000);
            if (mine.length) {
              await LocalNotifications.cancel({ notifications: mine.map(n => ({ id: n.id })) });
            }
          } catch (_) {}
          nativeScheduledRef.current = false;
        } catch (_) {
          // ignore
        }
        return;
      }

      const nativeAvailable = await setupNative();
      if (!nativeAvailable && !cancelled) startBrowserInterval();
    })();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [enabled, time, todayComplete]);
}