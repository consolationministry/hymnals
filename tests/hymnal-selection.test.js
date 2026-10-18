import assert from "node:assert/strict";
import test from "node:test";
import { ACTIVE_HYMNALS, DEFAULT_ACTIVE_HYMNAL, filterHymnsForActiveHymnal, isActiveHymnalId, normalizeActiveHymnal } from "../js/hymnal-selection.js";

test("the uploaded collection is the only available and default hymnal", () => {
  assert.equal(DEFAULT_ACTIVE_HYMNAL, "uploaded");
  assert.deepEqual(ACTIVE_HYMNALS.map(function (hymnal) { return hymnal.id; }), ["uploaded"]);
  assert.equal(isActiveHymnalId("uploaded"), true);
  assert.equal(isActiveHymnalId("cac"), false);
});

test("the active collection filters out CAC and all other hymn sources", () => {
  const rows = [
    { source_hymnal: "Christ Apostolic Church Gospel Hymn Book" },
    { source_hymnal: "Christ Apostolic Church Yoruba Hymn Book (Iwe Orin CAC)" },
    { source_hymnal: "CAC GHB" },
    { source_hymnal: "Uploaded Hymn Collection" },
    { source_hymnal: "Other Hymnal" }
  ];
  assert.deepEqual(filterHymnsForActiveHymnal(rows, "cac"), [rows[3]]);
  assert.deepEqual(filterHymnsForActiveHymnal(rows, "uploaded"), [rows[3]]);
});

test("invalid or old CAC collection values fall back to uploaded hymns", () => {
  assert.equal(normalizeActiveHymnal("unknown"), "uploaded");
  assert.equal(normalizeActiveHymnal("cac"), "uploaded");
  assert.equal(normalizeActiveHymnal("uploaded"), "uploaded");
});

test("the uploaded source is presented as Original Consolation Hymn", () => {
  assert.equal(ACTIVE_HYMNALS[0].label, "Original Consolation Hymn");
});
