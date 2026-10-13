import assert from "node:assert/strict";
import test from "node:test";
import ghb from "../data/cac-ghb.js";
import sourceYhb from "../data/cac-yhb.js";
import currentYhb from "../data/cac-yhb-current.js";
import { hymns as repositoryHymns } from "../data/cac-hymns.js";

test("current Yoruba catalog follows the English printed-number selection and preserves database IDs", () => {
  const currentEnglishNumbers = new Set(ghb.map(function (record) {
    return Number(record.metadata && record.metadata.number);
  }));
  const expected = sourceYhb
    .map(function (record, index) {
      return {
        record: record,
        index: index,
        sourceNumber: Number(record.metadata && record.metadata.number),
        isVarious: Boolean(record.metadata && record.metadata.isVarious)
      };
    })
    .filter(function (item) { return Number.isInteger(item.sourceNumber) && item.sourceNumber > 0; })
    .sort(function (a, b) {
      return a.sourceNumber - b.sourceNumber || Number(a.isVarious) - Number(b.isVarious) || a.index - b.index;
    })
    .map(function (item, sortedIndex) {
      return { ...item, sortedIndex: sortedIndex };
    })
    .filter(function (item) { return currentEnglishNumbers.has(item.sourceNumber); });

  assert.equal(currentYhb.length, 152);
  assert.equal(currentYhb.length, expected.length);
  assert.deepEqual(
    currentYhb.map(function (record) {
      return [record.metadata.number, record.metadata.hymnal_internal_id, record.title];
    }),
    expected.map(function (item) {
      return [item.sourceNumber, 1002 + item.sortedIndex, item.record.title];
    })
  );

  const activeYoruba = repositoryHymns.filter(function (hymn) {
    return hymn.source_hymnal === "Christ Apostolic Church Yoruba Hymn Book (Iwe Orin CAC)";
  });
  assert.equal(activeYoruba.length, 152);
  assert.equal(activeYoruba.filter(function (hymn) { return hymn.source_hymn_number === 10; }).length, 2);
  assert.equal(new Set(activeYoruba.map(function (hymn) { return hymn.hymn_number; })).size, 152);
});
