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

test("keeps a chorus visible when a hymn has no verse entries", () => {
  assert.deepEqual(getReadingParts([], "the chorus"), [{ type: "chorus", text: "the chorus" }]);
});
