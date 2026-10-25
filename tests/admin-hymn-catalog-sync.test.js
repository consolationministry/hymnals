import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { findMissingHymnsByNumber } from "../admin/js/hymn-catalog-sync.js";

const adminData = readFileSync(new URL("../admin/js/admin-data.js", import.meta.url), "utf8");

test("catalog sync includes both uploaded collections and checks for missing records", () => {
  assert.ok(adminData.includes("repositoryHymns.concat(repositoryYorubaHymns)"));
  assert.ok(adminData.includes("select=hymn_number,source_hymnal"));
  assert.ok(adminData.includes("findMissingHymnsByNumber(importRows, storedManagedRows)"));
});

test("only uploaded hymns missing from Supabase are returned for repair", () => {
  const candidates = [
    { hymn_number: 10000, title_en: "Already stored" },
    { hymn_number: 10001, title_en: "Needs import" },
    { hymn_number: 10002, title_en: "Also stored" }
  ];
  const stored = [{ hymn_number: "10000" }, { hymn_number: 10002 }];

  assert.deepEqual(findMissingHymnsByNumber(candidates, stored), [candidates[1]]);
});

test("the missing-hymn check treats an empty database response as all candidates missing", () => {
  const candidates = [{ hymn_number: 10000 }, { hymn_number: 10001 }];
  assert.deepEqual(findMissingHymnsByNumber(candidates, []), candidates);
  assert.deepEqual(findMissingHymnsByNumber(candidates, candidates.map(({ hymn_number }) => ({ hymn_number }))), []);
});
