import assert from "node:assert/strict";
import test from "node:test";
import { displayCollectionLabel, displayHymnalName } from "../js/hymnal-labels.js";

test("legacy English source labels show the church's Gospel Hymn Book name", () => {
  assert.equal(
    displayHymnalName({ source_hymnal: "Christ Apostolic Church Gospel Hymn Book", category: "CAC GHB" }),
    "Consolation Evangelical and Revival Church Gospel Hymn Book"
  );
  assert.equal(displayCollectionLabel("CAC GHB"), "Gospel Hymn Book");
});

test("legacy Yoruba source labels show a neutral collection tag and church name", () => {
  assert.equal(
    displayHymnalName({ source_hymnal: "Christ Apostolic Church Yoruba Hymn Book (Iwe Orin CAC)", category: "CAC YHB" }),
    "Consolation Evangelical and Revival Church Yorùbá Hymn Book"
  );
  assert.equal(displayCollectionLabel("CAC YHB"), "Yorùbá Hymn Book");
});

test("non-legacy source labels remain unchanged", () => {
  assert.equal(displayHymnalName({ source_hymnal: "Pentecostal Hymns No. 1" }), "Pentecostal Hymns No. 1");
  assert.equal(displayCollectionLabel("Adoration"), "Adoration");
});
