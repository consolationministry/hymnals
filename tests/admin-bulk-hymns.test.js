import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseHymnText, splitHymnText } from "../admin/js/hymn-upload-parser.js";

const app = readFileSync(new URL("../admin/js/admin-app.js", import.meta.url), "utf8");
const data = readFileSync(new URL("../admin/js/admin-data.js", import.meta.url), "utf8");

test("upload parser keeps single enters in the same verse and blank paragraphs separate verses", () => {
  const text = "12. Hymn title\n  first line  \nsecond line\n\n  next verse  \nlast line  ";
  assert.deepEqual(splitHymnText("  first line  \nsecond line\n\n  next verse  \nlast line  "), ["  first line  \nsecond line", "  next verse  \nlast line  "]);
  assert.deepEqual(parseHymnText(text), [{
    hymn_number: 12,
    title: "Hymn title",
    verses: ["  first line  \nsecond line", "  next verse  \nlast line  "],
    chorus: "",
    chorusLabel: "",
    number: 12
  }]);
});

test("upload parser does not rearrange spaces inside verse lines", () => {
  assert.deepEqual(splitHymnText(" a  \nb   \n\n  c "), [" a  \nb   ", "  c "]);
});

test("admin editor and upload review use blank paragraphs, not single enters, as verse boundaries", () => {
  assert.match(app, /bodyEnText\.split\(\/\\n\[ \\t\]\*\\n\+\/\)\.filter\(function \(verse\) \{ return verse !== ""; \}\)/);
  assert.match(app, /data-lyrics-input="' \+ key \+ '"/);
  assert.match(app, /class="lyrics-textarea"/);
  assert.doesNotMatch(app, /data-action="add-verse"|Add verse/i);
  assert.match(app, /input\.value\.split\(\/\\n\[ \\t\]\*\\n\+\/\)\.filter\(verse => verse !== ""\)/);
  assert.match(app, /splitHymnText\(String\(row\.verses \|\| ""\)\)/);
});

const dataModuleImport = app.match(/import\s*\{([^}]*)\}\s*from\s*["\']\.\/admin-data\.js\?v=\d+["\']/s);

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

test("admin app imports the data helpers needed by login and bulk actions", () => {
  assert.ok(dataModuleImport, "admin-app.js should import admin-data.js");
  const importedNames = (dataModuleImport ? dataModuleImport[1] : "").split(",").map((name) => name.trim()).filter(Boolean);
  for (const name of ["initializeAdminData", "deleteHymns", "setHymnsStatus"]) {
    assert.ok(importedNames.includes(name), `${name} should be imported by admin-app.js`);
    assert.ok(data.includes(`export async function ${name}(`), `${name} should be exported by admin-data.js`);
  }
});

