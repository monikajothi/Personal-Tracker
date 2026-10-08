import test from "node:test";
import assert from "node:assert/strict";

import { resolveHydrationRepeatMin } from "./hydrationReminderSchedule.js";

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
