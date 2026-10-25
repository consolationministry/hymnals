import test from "node:test";
import assert from "node:assert/strict";
import { MIN_SPLASH_VISIBLE_MS, remainingSplashMs } from "../js/splash-timing.js";

test("splash remains visible for at least five seconds", () => {
  const startedAt = 1000;
  assert.equal(MIN_SPLASH_VISIBLE_MS, 5000);
  assert.equal(remainingSplashMs(startedAt, startedAt), 5000);
  assert.equal(remainingSplashMs(startedAt, startedAt + 2300), 2700);
  assert.equal(remainingSplashMs(startedAt, startedAt + 6500), 0);
});
