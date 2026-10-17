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


test("Original adds missing CAC English songs and keeps distinct same-number hymns", () => {
  const rows = [
    { source_hymnal: "Uploaded Hymn Collection", source_hymn_number: 55, source_number_label: "55", title_en: "There Is a Fountain Fill'd with Blood" },
    { source_hymnal: "CAC GHB", source_hymn_number: 55, source_number_label: "55", title_en: "There Is a Fountain Filled with Blood" },
    { source_hymnal: "CAC GHB", source_hymn_number: 63, source_number_label: "63", title_en: "O Happy day that fixed my choice" },
    { source_hymnal: "Uploaded Hymn Collection", source_hymn_number: 63, source_number_label: "63V", title_en: "Grace! 'tis a Charming Sound" },
    { source_hymnal: "CAC YHB", source_hymn_number: 55, title_en: "Yoruba hymn" }
  ];

  const original = filterHymnsForActiveHymnal(rows, "uploaded");
  assert.deepEqual(original.map(function (hymn) {
    return [hymn.source_hymnal, hymn.source_hymn_number, hymn.title_en];
  }), [
    ["Uploaded Hymn Collection", 55, "There Is a Fountain Fill'd with Blood"],
    ["CAC GHB", 63, "O Happy day that fixed my choice"],
    ["Uploaded Hymn Collection", 63, "Grace! 'tis a Charming Sound"]
  ]);
});

test("invalid active collection values fall back to the existing CAC catalog", () => {
  assert.equal(normalizeActiveHymnal("unknown"), "cac");
  assert.equal(normalizeActiveHymnal("uploaded"), "uploaded");
});

test("the uploaded source is presented as Original Consolation Hymn in admin settings", () => {
  assert.equal(ACTIVE_HYMNALS.find(function (hymnal) { return hymnal.id === "uploaded"; }).label, "Original Consolation Hymn");
});
