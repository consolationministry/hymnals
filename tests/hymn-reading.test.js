import assert from "node:assert/strict";
import test from "node:test";
import { getReadingParts } from "../js/hymn-reading.js";

test("places the chorus after the first verse", () => {
  assert.deepEqual(getReadingParts(["first verse", "second verse", "third verse"], "the chorus"), [
    { type: "verse", number: 1, text: "first verse" },
    { type: "chorus", text: "the chorus" },
    { type: "verse", number: 2, text: "second verse" },
    { type: "verse", number: 3, text: "third verse" },
    { type: "chorus", text: "the chorus" }
  ]);
});

test("repeats the chorus after verse 5 and at the end for hymns longer than 5 verses", () => {
  const verses = ["v1", "v2", "v3", "v4", "v5", "v6"];
  assert.deepEqual(getReadingParts(verses, "the chorus").map((p) => p.type === "chorus" ? "C" : p.number), [1, "C", 2, 3, 4, 5, "C", 6, "C"]);
});

test("does not repeat the chorus after verse 5 for a five-verse hymn", () => {
  const verses = ["v1", "v2", "v3", "v4", "v5"];
  assert.deepEqual(getReadingParts(verses, "the chorus").map((p) => p.type === "chorus" ? "C" : p.number), [1, "C", 2, 3, 4, 5, "C"]);
});

test("keeps the meter and scripture preface separate from numbered lyric verses", () => {
  const heading = "6.6.6.\nHear my cry o God, attend unto my prayer. Ps 61:";
  assert.deepEqual(getReadingParts([heading, "Holy Father, hear me", "Jesus, blessed Master"], "the chorus", { hasMeterPreface: true }), [
    { type: "heading", text: heading },
    { type: "verse", number: 1, text: "Holy Father, hear me" },
    { type: "chorus", text: "the chorus" },
    { type: "verse", number: 2, text: "Jesus, blessed Master" },
    { type: "chorus", text: "the chorus" }
  ]);
});

test("recognizes a meter heading with repeated periods", () => {
  assert.deepEqual(getReadingParts(["7..7.7\nScripture reference", "First lyric stanza"], "", { hasMeterPreface: true }), [
    { type: "heading", text: "7..7.7\nScripture reference" },
    { type: "verse", number: 1, text: "First lyric stanza" }
  ]);
});

test("does not reinterpret a meter-like block without the CAC heading option", () => {
  const heading = "6.6.6.\nSong text";
  assert.deepEqual(getReadingParts([heading], ""), [{ type: "verse", number: 1, text: heading }]);
});

test("keeps a chorus visible when a hymn has no verse entries", () => {
  assert.deepEqual(getReadingParts([], "the chorus"), [{ type: "chorus", text: "the chorus" }]);
});
