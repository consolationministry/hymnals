import assert from "node:assert/strict";
import test from "node:test";
import repositoryHymns from "../data/uploaded-hymns.js";
import repositoryYorubaHymns from "../data/uploaded-yoruba-hymns.js";
import { adminHymnNumberLabel, adminHymnTitle, hasAdminHymnTitle } from "../admin/js/admin-hymn-display.js";

test("admin display uses the uploaded hymn's printed number and title", () => {
  const hymn = repositoryHymns[0];
  assert.equal(hymn.source_hymnal, "Uploaded Hymn Collection");
  assert.equal(
    adminHymnNumberLabel(hymn),
    "Book #" + hymn.source_hymn_number + " · record ID " + hymn.hymn_number
  );
  assert.equal(adminHymnTitle(hymn), hymn.title_en || hymn.title_yoruba);
});

test("admin title validation accepts a titled uploaded hymn", () => {
  assert.equal(hasAdminHymnTitle({ title_en: "A hymn" }), true);
  assert.equal(hasAdminHymnTitle({ title_en: "   " }), false);
});

test("admin label falls back to the hymn number for custom records", () => {
  assert.equal(adminHymnNumberLabel({ hymn_number: 240 }), "Hymn #240");
});


test("Yorùbá admin labels preserve the printed three-digit number", () => {
  const hymn = repositoryYorubaHymns.find(function (item) { return item.source_hymn_number === 2; });
  assert.ok(hymn);
  assert.equal(adminHymnNumberLabel(hymn), "Book #002 · record ID " + hymn.hymn_number);
});
