import assert from "node:assert/strict";
import test from "node:test";
import photographedGhbNumbers from "../data/cac-ghb-index.js";
import { hymns } from "../data/cac-hymns.js";

const englishHymns = hymns.filter(function (hymn) {
  return hymn.source_hymnal === "Christ Apostolic Church Gospel Hymn Book";
});

test("English CAC hymns use the printed numbers from the photographed index", () => {
  assert.equal(photographedGhbNumbers.size, 152);
  assert.equal(englishHymns.length, photographedGhbNumbers.size);
  for (const hymn of englishHymns) {
    const printedNumber = photographedGhbNumbers.get(hymn.hymn_number);
    assert.ok(printedNumber, `Missing photographed number for record ${hymn.hymn_number}`);
    assert.equal(hymn.source_hymn_number, printedNumber);
    assert.equal(hymn.source_number_label, String(printedNumber));
  }
});
