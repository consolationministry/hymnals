import assert from "node:assert/strict";
import test from "node:test";
import { getReadingParts } from "../js/hymn-reading.js";

test("places the chorus after the first verse", () => {
  assert.deepEqual(getReadingParts(["first verse", "second verse", "third verse"], "the chorus"), [
    { type: "verse", number: 1, text: "first verse" },
    { type: "chorus", text: "the chorus" },
    { type: "verse", number: 2, text: "second verse" },
    { type: "verse", number: 3, text: "third verse" }
  ]);
});

test("keeps the meter and scripture preface separate from numbered lyric verses", () => {
  const heading = "6.6.6.\nHear my cry o God, attend unto my prayer. Ps 61:";
  assert.deepEqual(getReadingParts([heading, "Holy Father, hear me", "Jesus, blessed Master"], "the chorus", { hasMeterPreface: true }), [
    { type: "heading", text: heading },
    { type: "verse", number: 1, text: "Holy Father, hear me" },
    { type: "chorus", text: "the chorus" },
    { type: "verse", number: 2, text: "Jesus, blessed Master" }
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
