import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ghb from "../data/cac-ghb.js";
import photographedGhbNumbers from "../data/cac-ghb-index.js";
import currentYhb from "../data/cac-yhb-current.js";

const migration = readFileSync(
  new URL("../supabase/migrations/202610140004_cac_yhb_corrected_english_numbers.sql", import.meta.url),
  "utf8"
);

function migrationPairs() {
  const values = migration.match(/FROM \(VALUES([\s\S]*?)\) AS printed/);
  assert.ok(values, "migration contains the Yoruba-to-English number mapping");
  return [...values[1].matchAll(/\(\s*(\d+)\s*,\s*(\d+)\s*\)/g)]
    .map(function (match) { return [Number(match[1]), Number(match[2])]; });
}

test("active CAC YHB rows use the corrected English printed index numbers", () => {
  const englishBySourceNumber = new Map();
  for (const hymn of ghb) {
    const sourceNumber = Number(hymn.metadata && hymn.metadata.number);
    if (!englishBySourceNumber.has(sourceNumber)) englishBySourceNumber.set(sourceNumber, []);
    englishBySourceNumber.get(sourceNumber).push(hymn);
  }

  const expected = currentYhb.map(function (hymn) {
    const sourceNumber = Number(hymn.metadata && hymn.metadata.number);
    const matches = englishBySourceNumber.get(sourceNumber) || [];
    assert.equal(matches.length, 1, "Expected one English match for Yoruba source number " + sourceNumber);
    const englishInternalId = Number(matches[0].metadata && matches[0].metadata.hymnal_internal_id);
    const printedNumber = photographedGhbNumbers.get(englishInternalId);
    assert.ok(Number.isInteger(printedNumber), "Missing corrected English number for record " + englishInternalId);
    return [Number(hymn.metadata.hymnal_internal_id), printedNumber];
  }).sort(function (a, b) { return a[0] - b[0]; });

  const actual = migrationPairs();
  assert.equal(currentYhb.length, 152);
  assert.equal(actual.length, 152);
  assert.deepEqual(actual, expected);
  assert.match(migration, /source_hymn_number = printed\.printed_number/);
  assert.match(migration, /source_hymn_number IS DISTINCT FROM printed\.printed_number/);
  assert.match(migration, /source_hymnal ILIKE '%Yoruba Hymn Book%'/);
});
