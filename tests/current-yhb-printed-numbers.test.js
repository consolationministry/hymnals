import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import currentYhb from "../data/cac-yhb-current.js";

const migration = readFileSync(
  new URL("../supabase/migrations/202610140003_current_cac_yhb_printed_numbers.sql", import.meta.url),
  "utf8"
);

function migrationPairs() {
  const values = migration.match(/FROM \(VALUES([\s\S]*?)\) AS printed/);
  assert.ok(values, "migration contains the Yoruba hymn number mapping");
  return [...values[1].matchAll(/\(\s*(\d+)\s*,\s*(\d+)\s*\)/g)]
    .map(function (match) { return [Number(match[1]), Number(match[2])]; });
}

test("active CAC YHB backend rows use their own printed hymn numbers", () => {
  const expected = currentYhb
    .map(function (hymn) {
      return [Number(hymn.metadata.hymnal_internal_id), Number(hymn.metadata.number)];
    })
    .sort(function (a, b) { return a[0] - b[0]; });
  const actual = migrationPairs();

  assert.equal(currentYhb.length, 152);
  assert.equal(new Set(expected.map(function (pair) { return pair[0]; })).size, expected.length);
  assert.deepEqual(actual, expected);
  assert.equal(actual.filter(function (pair) { return pair[1] === 10; }).length, 2);
  assert.match(migration, /source_hymn_number = printed\.printed_number/);
  assert.match(migration, /source_hymn_number IS DISTINCT FROM printed\.printed_number/);
  assert.match(migration, /source_hymnal ILIKE '%Yoruba Hymn Book%'/);
});
