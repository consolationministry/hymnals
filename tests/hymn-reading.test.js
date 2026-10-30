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

test("keeps separately stored imported verses as individual labeled verses", () => {
  assert.deepEqual(getReadingParts(["Blessed assurance, Jesus is mine!", "Perfect submission, perfect delight,", "Perfect submission, all is at rest,"], "refrain", { imported: true, language: "english" }), [
    { type: "lyrics", text: "Blessed assurance, Jesus is mine!", number: 1, label: "Verse 1" },
    { type: "chorus", text: "refrain" },
    { type: "lyrics", text: "Perfect submission, perfect delight,", number: 2, label: "Verse 2" },
    { type: "lyrics", text: "Perfect submission, all is at rest,", number: 3, label: "Verse 3" },
    { type: "chorus", text: "refrain" }
  ]);
});

test("does not label or rearrange admin-added lyrics even with blank lines", () => {
  const lyrics = "pasted line one\ncontinued line\n\npasted next paragraph";
  assert.deepEqual(getReadingParts([lyrics], "refrain", { imported: false, language: "english" }), [
    { type: "lyrics", text: lyrics },
    { type: "chorus", text: "refrain" }
  ]);
});

test("uses Yoruba Orin labels and puts chorus after verse one and at the end", () => {
  assert.deepEqual(getReadingParts(["one", "two", "three", "four", "five"], "egbe", { imported: true, language: "yoruba" }).map(function (part) { return part.type === "lyrics" ? part.label : part.type; }), ["Orin 1", "chorus", "Orin 2", "Orin 3", "Orin 4", "Orin 5", "chorus"]);
});

test("shows a one-verse imported chorus only once", () => {
  assert.deepEqual(getReadingParts(["one"], "refrain", { imported: true, language: "english" }), [
    { type: "lyrics", text: "one", number: 1, label: "Verse 1" },
    { type: "chorus", text: "refrain" }
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

test("extracts Egbe from mixed verse text and preserves its stanza exactly", () => {
  const firstVerse = "first verse line\nsecond line";
  const egbe = "Eyin angeli\nLu duru wura";
  const nextVerse = "next verse line";
  const mixed = firstVerse + "\nEGBE:\n" + egbe + "\n" + nextVerse + "\nEGBE:\n" + egbe;
  assert.deepEqual(getReadingParts([mixed], "", { imported: true, language: "yoruba", extractEmbeddedEgbe: true }), [
    { type: "lyrics", text: firstVerse, number: 1, label: "Orin 1" },
    { type: "chorus", text: egbe },
    { type: "lyrics", text: nextVerse, number: 2, label: "Orin 2" },
    { type: "chorus", text: egbe }
  ]);
});

test("uses explicit chorus text in preference to embedded Egbe", () => {
  assert.deepEqual(getReadingParts(["first verse\nEGBE:\nembedded text", "next verse"], "explicit chorus", { imported: true, language: "yoruba", extractEmbeddedEgbe: true }).filter(part => part.type === "chorus").map(part => part.text), ["explicit chorus", "explicit chorus"]);
});
