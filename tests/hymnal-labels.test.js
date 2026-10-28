import assert from "node:assert/strict";
import test from "node:test";
import { displayHymnalName } from "../js/hymnal-labels.js";

test("uploaded hymns use the Original Consolation Hymn name", () => {
  assert.equal(displayHymnalName({ source_hymnal: "Uploaded Hymn Collection" }), "Original Consolation Hymn");
  assert.equal(displayHymnalName({ source_hymnal: "Original Consolation Hymn" }), "Original Consolation Hymn");
});

test("non-legacy source labels remain unchanged", () => {
  assert.equal(displayHymnalName({ source_hymnal: "Pentecostal Hymns No. 1" }), "Pentecostal Hymns No. 1");
});
