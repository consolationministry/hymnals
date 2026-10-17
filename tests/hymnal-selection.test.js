import assert from "node:assert/strict";
import test from "node:test";
import { ACTIVE_HYMNALS, filterHymnsForActiveHymnal, normalizeActiveHymnal } from "../js/hymnal-selection.js";

test("the active selection includes only the requested hymnal source", () => {
  const rows = [
    { source_hymnal: "Christ Apostolic Church Gospel Hymn Book" },
    { source_hymnal: "Christ Apostolic Church Yoruba Hymn Book (Iwe Orin CAC)" },
    { source_hymnal: "CAC GHB" },
    { source_hymnal: "Uploaded Hymn Collection" },
    { source_hymnal: "Other Hymnal" }
  ];
  assert.equal(filterHymnsForActiveHymnal(rows, "cac").length, 3);
  assert.deepEqual(filterHymnsForActiveHymnal(rows, "uploaded"), [rows[3]]);
});

test("invalid active collection values fall back to the existing CAC catalog", () => {
  assert.equal(normalizeActiveHymnal("unknown"), "cac");
  assert.equal(normalizeActiveHymnal("uploaded"), "uploaded");
});

test("the uploaded source is presented as Original Consolation Hymn in admin settings", () => {
  assert.equal(ACTIVE_HYMNALS.find(function (hymnal) { return hymnal.id === "uploaded"; }).label, "Original Consolation Hymn");
});
