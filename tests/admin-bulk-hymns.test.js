import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const app = readFileSync(new URL("../admin/js/admin-app.js", import.meta.url), "utf8");
const data = readFileSync(new URL("../admin/js/admin-data.js", import.meta.url), "utf8");

test("hymn list renders select-all, per-hymn checkboxes, and the three bulk actions", () => {
  assert.ok(app.includes("data-select-all-hymns"));
  assert.ok(app.includes("data-select-hymn data-id="));
  assert.ok(app.includes(`value="delete">Delete`));
  assert.ok(app.includes(`value="published">Publish`));
  assert.ok(app.includes(`value="draft">Save as draft`));
});

test("bulk deletion requires confirmation and uses batched admin requests", () => {
  assert.ok(app.includes("This cannot be undone."));
  assert.ok(app.includes("await deleteHymns(ids)"));
  assert.ok(data.includes("export async function deleteHymns(ids)"));
  assert.ok(data.includes("export async function setHymnsStatus(ids, status)"));
  assert.equal((data.match(/const batchSize = 100/g) || []).length, 3);
});

