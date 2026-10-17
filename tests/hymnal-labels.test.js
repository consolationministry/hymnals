import assert from "node:assert/strict";
import test from "node:test";
import { displayCollectionLabel, displayHymnalName } from "../js/hymnal-labels.js";

test("current CAC sources use the Consolation Hymn name and the original source stays distinct", () => {
  assert.equal(displayHymnalName({ source_hymnal: "Christ Apostolic Church Gospel Hymn Book", category: "Consolation Hymn" }), "Consolation Hymn");
  assert.equal(displayHymnalName({ source_hymnal: "Christ Apostolic Church Yoruba Hymn Book (Iwe Orin CAC)", category: "Consolation Hymn" }), "Consolation Hymn");
  assert.equal(displayHymnalName({ source_hymnal: "Uploaded Hymn Collection", category: "Consolation Hymn" }), "Original Consolation Hymn");
  assert.equal(displayHymnalName({ source_hymnal: "Original Consolation Hymn" }), "Original Consolation Hymn");
  for (const category of ["CAC GHB", "CAC YHB", "Uploaded Hymn Collection", "Consolation Hymn"]) {
    assert.equal(displayCollectionLabel(category), "Consolation Hymn");
  }
});

test("non-legacy source labels remain unchanged", () => {
  assert.equal(displayHymnalName({ source_hymnal: "Pentecostal Hymns No. 1" }), "Pentecostal Hymns No. 1");
  assert.equal(displayCollectionLabel("Adoration"), "Adoration");
});
