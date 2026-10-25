import assert from "node:assert/strict";
import test from "node:test";
import { addRecent, getRecentNumbers } from "../js/recent.js";

test("stores a unique, newest-first history of up to 50 hymns", () => {
  const records = new Map();
  globalThis.window = {
    localStorage: {
      getItem(key) { return records.has(key) ? records.get(key) : null; },
      setItem(key, value) { records.set(key, value); }
    }
  };

  for (let number = 1; number <= 55; number += 1) addRecent(number);
  addRecent(53);
  assert.deepEqual(getRecentNumbers().slice(0, 3), [53, 55, 54]);
  assert.equal(getRecentNumbers().length, 50);
  assert.equal(addRecent(0), false);
});
