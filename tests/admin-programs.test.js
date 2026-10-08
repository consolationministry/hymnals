import assert from "node:assert/strict";
import test from "node:test";
import {
  createProgram,
  deleteProgram,
  getProgram,
  getPrograms,
  getDailyQuoteSettings,
  updateDailyQuoteSettings,
  updateProgram
} from "../admin/js/admin-data.js";

function installStorage() {
  const records = new Map([
    ["consolation-hymnal-admin-programs-v1", "[]"],
    ["consolation-hymnal-admin-daily-quote-v1", JSON.stringify({ enabled: true, books: ["Psalms", "Proverbs"], refreshMode: "on-open" })]
  ]);
  globalThis.window = {
    localStorage: {
      getItem(key) { return records.has(key) ? records.get(key) : null; },
      setItem(key, value) { records.set(key, value); }
    }
  };
}

function program(overrides) {
  return Object.assign({
    title: "Annual Thanksgiving",
    venue: "Church auditorium",
    startDate: "2026-12-01",
    endDate: "",
    flyerDataUrl: "",
    responseQuestion: "Will you be available for this program?",
    yesLabel: "Yes, I’ll be there",
    noLabel: "Not this time"
  }, overrides || {});
}

test("creates, edits, lists and deletes browser-preview programs", async () => {
  installStorage();
  const created = await createProgram(program());
  assert.equal(created.title, "Annual Thanksgiving");
  assert.equal(created._storage_mode, "browser");
  assert.equal((await getPrograms()).length, 1);

  const updated = await updateProgram(created.id, program({ endDate: "2026-12-03", yesLabel: "Count me in" }));
  assert.equal(updated.endDate, "2026-12-03");
  assert.equal((await getProgram(created.id)).yesLabel, "Count me in");
  assert.equal(await deleteProgram(created.id), "browser");
  assert.equal(await getProgram(created.id), null);
});

test("accepts one-day dates and rejects malformed or reversed dates", async () => {
  installStorage();
  assert.equal((await createProgram(program())).endDate, "");
  await assert.rejects(createProgram(program({ startDate: "2026-02-30" })), /valid start date/);
  await assert.rejects(createProgram(program({ endDate: "2026-11-30" })), /cannot be before/);
});

test("accepts only bounded image data URLs for flyer previews", async () => {
  installStorage();
  const flyer = "data:image/png;base64,aGVsbG8=";
  assert.equal((await createProgram(program({ flyerDataUrl: flyer }))).flyerDataUrl, flyer);
  await assert.rejects(createProgram(program({ flyerDataUrl: "https://example.com/flyer.png" })), /PNG, JPEG, or WebP/);
});

test("stores quote preferences and requires at least one scripture source", async () => {
  installStorage();
  assert.deepEqual(await getDailyQuoteSettings(), { enabled: true, books: ["Psalms", "Proverbs"], refreshMode: "on-open" });
  assert.equal(await updateDailyQuoteSettings({ enabled: false, books: ["Psalms"], refreshMode: "daily" }), "browser");
  assert.deepEqual(await getDailyQuoteSettings(), { enabled: false, books: ["Psalms"], refreshMode: "daily" });
  await assert.rejects(updateDailyQuoteSettings({ enabled: true, books: [], refreshMode: "on-open" }), /Choose Psalms/);
});
