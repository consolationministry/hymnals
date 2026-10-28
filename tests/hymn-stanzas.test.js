import assert from "node:assert/strict";
import test from "node:test";
import { splitHymnText, normalizeHymnVerses } from "../js/hymn-stanzas.js";

test("splits numbered English verses and pulls out the inline CHORUS block", () => {
  const raw = "1. First line\nSecond line\nCHORUS:\nChorus line\n2. Second verse\nCHORUS:\nChorus line";
  const out = splitHymnText(raw);
  assert.deepEqual(out.verses, ["First line\nSecond line", "Second verse"]);
  assert.equal(out.chorus, "Chorus line");
});

test("returns every verse of a 6+ verse hymn, not just the first", () => {
  const raw = [1, 2, 3, 4, 5, 6].map((n) => n + ". verse " + n).join("\n");
  assert.equal(splitHymnText(raw).verses.length, 6);
});

test("recognizes the Yorùbá EGBE marker as a chorus", () => {
  const out = normalizeHymnVerses(["1. Ori kan\nEGBE:\nEgbe ni"], "");
  assert.equal(out.chorus, "Egbe ni");
  assert.equal(out.verses.length, 1);
});

test("a separate chorus column wins over an inline chorus", () => {
  const out = normalizeHymnVerses(["1. a\nCHORUS:\ninline"], "column chorus");
  assert.equal(out.chorus, "column chorus");
});
