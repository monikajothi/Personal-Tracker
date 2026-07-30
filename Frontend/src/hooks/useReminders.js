import { useEffect, useRef } from "react";
import { todayStr } from "../constants.js";

export function useReminders({ enabled, time, todayComplete }) {
  const firedForRef = useRef(null); // "YYYY-MM-DD" already notified today

  useEffect(() => {
    if (!enabled || typeof Notification === "undefined") return;
    if (Notification.permission === "default") Notification.requestPermission();
  }, [enabled]);

  useEffect(() => {
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

    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [enabled, time, todayComplete]);
}