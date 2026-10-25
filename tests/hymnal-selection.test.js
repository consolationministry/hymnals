import assert from "node:assert/strict";
import test from "node:test";
import { ACTIVE_HYMNALS, DEFAULT_ACTIVE_HYMNAL, filterHymnsForActiveHymnal, isActiveHymnalId, normalizeActiveHymnal } from "../js/hymnal-selection.js";

test("both uploaded collections are available and active by default", () => {
  assert.equal(DEFAULT_ACTIVE_HYMNAL, "both");
  assert.deepEqual(ACTIVE_HYMNALS.map(function (hymnal) { return hymnal.id; }), ["both", "uploaded", "yoruba"]);
  assert.equal(isActiveHymnalId("uploaded"), true);
  assert.equal(isActiveHymnalId("yoruba"), true);
  assert.equal(isActiveHymnalId("both"), true);
  assert.equal(isActiveHymnalId("cac"), false);
});

test("the both setting includes only the two uploaded collections", () => {
  const rows = [
    { source_hymnal: "Christ Apostolic Church Gospel Hymn Book" },
    { source_hymnal: "CAC YHB" },
    { source_hymnal: "Uploaded Hymn Collection" },
    { source_hymnal: "Uploaded Yorùbá Hymn Collection" },
    { source_hymnal: "Community Hymnal" }
  ];
  assert.deepEqual(filterHymnsForActiveHymnal(rows, "both"), [rows[2], rows[3]]);
  assert.deepEqual(filterHymnsForActiveHymnal(rows, "uploaded"), [rows[2]]);
  assert.deepEqual(filterHymnsForActiveHymnal(rows, "yoruba"), [rows[3]]);
});

test("unknown and legacy CAC selection values fall back to both uploaded collections", () => {
  assert.equal(normalizeActiveHymnal("unknown"), "both");
  assert.equal(normalizeActiveHymnal("cac"), "both");
  assert.equal(normalizeActiveHymnal("both"), "both");
});

test("the English collection keeps its existing display label", () => {
  assert.equal(ACTIVE_HYMNALS.find(function (hymnal) { return hymnal.id === "uploaded"; }).label, "Original Consolation Hymn");
});
