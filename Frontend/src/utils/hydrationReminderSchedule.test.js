import test from "node:test";
import assert from "node:assert/strict";

import { resolveHydrationRepeatMin } from "./hydrationReminderSchedule.js";
import { buildNextReminderAt } from "../hooks/useHydrationReminders.js";

test("explicit repeatEveryMin wins when provided", () => {
  assert.equal(resolveHydrationRepeatMin({ repeatEveryMin: 15, minIntervalMin: 30 }), 15);
});

test("fallback repeat uses min interval when repeatEveryMin is empty", () => {
  assert.equal(resolveHydrationRepeatMin({ repeatEveryMin: "", minIntervalMin: 45 }), 45);
  assert.equal(resolveHydrationRepeatMin({ repeatEveryMin: undefined, minIntervalMin: 30 }), 30);
});

test("final fallback remains safe for missing settings", () => {
  assert.equal(resolveHydrationRepeatMin({}), 30);
});

test("next reminder is rebuilt in the future after a missed dismissal", () => {
  const now = new Date(2026, 0, 7, 9, 30, 0);
  const next = buildNextReminderAt({ startTime: "08:00", endTime: "20:00" }, 1500, 250, now);

  assert.ok(next instanceof Date);
  assert.ok(next.getTime() > now.getTime());
  assert.ok(next.getHours() >= 9 && next.getHours() <= 20);
});
