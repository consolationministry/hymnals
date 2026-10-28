import assert from "node:assert/strict";
import test from "node:test";
import hymns from "../data/uploaded-yoruba-hymns.js";

 test("the uploaded Yorùbá catalog preserves 122 hymns and stable internal IDs", () => {
  assert.equal(hymns.length, 122);
  assert.equal(new Set(hymns.map(function (hymn) { return hymn.hymn_number; })).size, 122);
  assert.deepEqual(hymns.map(function (hymn) { return hymn.hymn_number; }), Array.from({ length: 122 }, function (_, index) { return 20001 + index; }));
  assert.ok(hymns.every(function (hymn) {
    return hymn.source_hymnal === "Uploaded Yorùbá Hymn Collection" &&
      Number.isInteger(hymn.source_hymn_number) &&
      hymn.title_yoruba && hymn.verses_yoruba.length > 0 &&
      hymn.title_en === "" && hymn.verses_en.length === 0 &&
      hymn.copyright_status === "User-supplied; rights not verified";
  }));
});

test("distinct hymns sharing printed number 64 are preserved; exact duplicate 192 is stored once", () => {
  const number64 = hymns.filter(function (hymn) { return hymn.source_hymn_number === 64; });
  assert.equal(number64.length, 2);
  assert.notEqual(number64[0].title_yoruba, number64[1].title_yoruba);
  assert.equal(hymns.filter(function (hymn) { return hymn.source_hymn_number === 192; }).length, 1);
});

test("printed numbering, first lines, and scripture references are retained", () => {
  const first = hymns[0];
  assert.equal(first.source_number_label, "002");
  assert.equal(first.first_line_yoruba, "Aleluya! Orin t’o dun,");
  assert.equal(first.hymnal_note, "Mo gbohun nla kan ti opolopo eniyan Lorun, wipe Aleluya. Ifi 19:1");
  assert.equal(hymns.some(function (hymn) { return hymn.chorus_yoruba.length > 0; }), true);
  assert.equal(hymns.some(function (hymn) { return hymn.hymnal_note === ""; }), true);
});
