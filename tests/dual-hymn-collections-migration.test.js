import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = await readFile(
  new URL("../supabase/migrations/202610190001_dual_uploaded_hymn_collections.sql", import.meta.url),
  "utf8"
);

test("dual-collection migration enables both collections by default", () => {
  assert.match(migration, /SET active_hymnal = 'both'/);
  assert.match(migration, /CHECK \(active_hymnal IN \('uploaded', 'yoruba', 'both'\)\)/);
  assert.match(migration, /get_active_hymnal\(\)/);
});

test("migration adds scripture notes without deleting hymn content", () => {
  assert.match(migration, /ADD COLUMN IF NOT EXISTS hymnal_note text NOT NULL DEFAULT ''/);
  assert.match(migration, /GRANT SELECT \(hymnal_note\) ON public\.hymns TO anon/);
  assert.doesNotMatch(migration, /DELETE\s+FROM\s+public\.hymns/i);
});
