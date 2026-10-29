import test from "node:test";
import assert from "node:assert/strict";
import { getReadingParts } from "../js/hymn-reading.js";

test("keeps single Enter inside the same stored lyrics block", () => {
  const lyrics = "line one\nline two";
  assert.deepEqual(getReadingParts([lyrics], ""), [
    { type: "lyrics", text: lyrics }
  ]);
});

test("preserves blank-line verse boundaries without labels for admin-added hymns", () => {
  const lyrics = "first verse\nline two\n\nsecond verse\nline two";
  assert.deepEqual(getReadingParts([lyrics], ""), [
    { type: "lyrics", text: lyrics }
  ]);
});

test("labels imported English verses and places chorus after the first and final verse", () => {
  assert.deepEqual(getReadingParts("first\nline\n\nsecond\nline\n\nthird", "refrain", { imported: true, language: "english" }), [
    { type: "lyrics", text: "first\nline", number: 1, label: "Verse 1" },
    { type: "chorus", text: "refrain" },
    { type: "lyrics", text: "second\nline", number: 2, label: "Verse 2" },
    { type: "lyrics", text: "third", number: 3, label: "Verse 3" },
    { type: "chorus", text: "refrain" }
  ]);
});

test("labels imported Yoruba verses Orin N and shows a one-verse chorus only once", () => {
  assert.deepEqual(getReadingParts("one verse", "egbe", { imported: true, language: "yoruba" }), [
    { type: "lyrics", text: "one verse", number: 1, label: "Orin 1" },
    { type: "chorus", text: "egbe" }
  ]);
});

test("joins stored paragraphs with one blank line and preserves their text", () => {
  assert.deepEqual(getReadingParts(["first\ncontinued", "second verse"], ""), [
    { type: "lyrics", text: "first\ncontinued\n\nsecond verse" }
  ]);
});

test("keeps meter-like text and digits as lyric text without detection", () => {
  const lyrics = "6.6.6.\n1. lyric line\n\n2. another verse";
  assert.deepEqual(getReadingParts([lyrics], ""), [
    { type: "lyrics", text: lyrics }
  ]);
});

test("keeps the separately stored chorus once and only when present", () => {
  assert.deepEqual(getReadingParts(["verse text"], "chorus text"), [
    { type: "lyrics", text: "verse text" },
    { type: "chorus", text: "chorus text" }
  ]);
  assert.deepEqual(getReadingParts(["verse text"], ""), [
    { type: "lyrics", text: "verse text" }
  ]);
});

test("keeps a separately stored chorus visible when the lyric field is empty", () => {
  assert.deepEqual(getReadingParts([], "chorus text"), [
    { type: "chorus", text: "chorus text" }
  ]);
});
