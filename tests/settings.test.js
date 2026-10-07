import assert from "node:assert/strict";
import test from "node:test";
import { ACCENT_THEMES, getSettings } from "../js/settings.js";

test("offers only the six requested accents and migrates legacy ruby settings", () => {
  const records = new Map([
    ["cerc-hymnal-settings-v1", JSON.stringify({ accent: "ruby" })]
  ]);
  globalThis.window = {
    localStorage: {
      getItem(key) { return records.has(key) ? records.get(key) : null; },
      setItem(key, value) { records.set(key, value); }
    }
  };

  assert.deepEqual(ACCENT_THEMES, ["red", "purple", "black", "green", "sky", "blue"]);
  assert.equal(getSettings().accent, "red");
});
