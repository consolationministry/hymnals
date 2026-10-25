import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = await readFile(
  new URL("../supabase/migrations/202610180001_uploaded_hymns_only.sql", import.meta.url),
  "utf8"
);

test("uploaded-only migration sets the sole active hymnal to uploaded", () => {
  assert.match(migration, /SET active_hymnal = 'uploaded'/);
  assert.match(migration, /CHECK \(active_hymnal = 'uploaded'\)/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.get_active_hymnal\(\)/);
});

test("uploaded-only migration deletes CAC rows while preserving uploaded records", () => {
  assert.match(migration, /btrim\(hymn\.source_hymnal\) <> 'Uploaded Hymn Collection'/);
  assert.match(migration, /ILIKE '%Gospel Hymn Book%'/);
  assert.match(migration, /ILIKE '%Yoruba Hymn Book%'/);
  assert.match(migration, /ILIKE '%Iwe Orin CAC%'/);
  assert.match(migration, /DELETE FROM public\.hymns/);
});

test("uploaded-only migration removes deleted hymn IDs from service plans", () => {
  assert.match(migration, /UPDATE public\.service_plans/);
  assert.match(migration, /unnest\(plan\.hymn_ids\) WITH ORDINALITY/);
  assert.match(migration, /cac_hymns_to_delete/);
});
