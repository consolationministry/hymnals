import assert from "node:assert/strict";
import test from "node:test";
import { hymns as repositoryHymns } from "../data/cac-hymns.js";
import { adminHymnNumberLabel, adminHymnTitle, hasAdminHymnTitle } from "../admin/js/admin-hymn-display.js";

test("admin display uses the printed Yorùbá book number and title", () => {
  const hymn = repositoryHymns.find(function (item) {
    return item.source_hymnal.includes("Yoruba Hymn Book") && item.source_hymn_number === 156;
  });
  assert.ok(hymn);
  assert.equal(hymn.hymn_number, 1167);
  assert.equal(adminHymnNumberLabel(hymn), "Book #156 · record ID 1167");
  assert.equal(adminHymnTitle(hymn), hymn.title_yoruba);
});

test("admin title validation accepts a Yorùbá-only catalog entry", () => {
  assert.equal(hasAdminHymnTitle({ title_en: "", title_yoruba: "B'awon ara igbani" }), true);
  assert.equal(hasAdminHymnTitle({ title_en: "", title_yoruba: "   " }), false);
});

test("admin label falls back to the hymn number for custom records", () => {
  assert.equal(adminHymnNumberLabel({ hymn_number: 240 }), "Hymn #240");
});
