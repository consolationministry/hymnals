import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, test } from "node:test";
import { excerptProgrammeDescription, PROGRAMME_DESCRIPTION_COLLAPSE_LIMIT, repairMojibake } from "../js/programme-feed-utils.js";
import { getMemberContent } from "../js/public-content.js";

const appSource = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../css/style.css", import.meta.url), "utf8");
const adminSource = readFileSync(new URL("../admin/js/admin-app.js", import.meta.url), "utf8");
const publicContentSource = readFileSync(new URL("../js/public-content.js", import.meta.url), "utf8");
const ministerMigrationSource = readFileSync(new URL("../supabase/migrations/202610270001_public_program_minister.sql", import.meta.url), "utf8");
const categoryMigrationSource = readFileSync(new URL("../supabase/migrations/202610270002_public_program_category.sql", import.meta.url), "utf8");
const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
});

function installStorage() {
  const values = new Map();
  globalThis.window = { localStorage: {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  } };
}

function response(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, async json() { return body; } };
}

test("programme display repairs common mojibake in stored strings", () => {
  const scrambledArrow = String.fromCharCode(0xe2, 0x86, 0x90);
  const scrambledApostrophe = String.fromCharCode(0xe2, 0x80, 0x99);
  const scrambledYoruba = "Yor" + String.fromCharCode(0xc3, 0xb9) + "b" + String.fromCharCode(0xc3, 0xa1);
  assert.equal(repairMojibake("Back [" + scrambledArrow + "]"), "Back [←]");
  assert.equal(repairMojibake("I" + scrambledApostrophe + "ll be there"), "I’ll be there");
  assert.equal(repairMojibake(scrambledYoruba), "Yorùbá");
});

test("programme descriptions expand only after the configured preview length", () => {
  const short = "A short programme description.";
  assert.equal(excerptProgrammeDescription(short), short);
  assert.equal(PROGRAMME_DESCRIPTION_COLLAPSE_LIMIT, 200);

  const long = Array.from({ length: 70 }, (_, index) => `word${index}`).join(" ");
  const excerpt = excerptProgrammeDescription(long);
  assert.ok(Array.from(excerpt).length <= PROGRAMME_DESCRIPTION_COLLAPSE_LIMIT + 1);
  assert.ok(excerpt.endsWith("…"));
  assert.ok(!excerpt.endsWith(" "));
  assert.ok(long.startsWith(excerpt.slice(0, -1)));
});

test("programme announcements are sorted by latest post date", async () => {
  installStorage();
  globalThis.fetch = async function (url) {
    if (String(url).includes("/programs?")) return response([
      { id: "older", title: "Older post", start_date: "2026-12-01", created_at: "2026-10-10T10:00:00Z" },
      { id: "newer", title: "Newer post", start_date: "2026-11-01", created_at: "2026-10-12T10:00:00Z" }
    ]);
    return response([]);
  };
  const content = await getMemberContent();
  assert.deepEqual(content.programs.map(program => program.id), ["newer", "older"]);
});

test("public programme cards order the header, details, description, flyer, and votes", () => {
  assert.match(appSource, /pageHeading\("Upcoming Programmes"\)/);
  assert.doesNotMatch(appSource, /Programme posts and flyers, newest announcement first/);
  assert.match(appSource, /function programmeCategory\(program\) \{/);
  assert.match(appSource, /class="public-program-post-category"/);
  assert.match(appSource, /data-action="open-programme"/);
  assert.match(appSource, /header \+ eventMetadata \+ descriptionSection \+ media \+ detailsBlock \+ renderProgrammeInteractions\(program\) \+ '<\/article>'/);
  assert.match(appSource, /const minister = repairMojibake\(String\(program && program\.minister \|\| ""\)\)\.trim\(\);/);
  assert.match(appSource, /public-program-detail-title/);
  assert.match(adminSource, /name="minister"/);
  assert.match(publicContentSource, /id,title,minister,description/);
  assert.match(publicContentSource, /id,title,minister,category,description/);
  assert.match(ministerMigrationSource, /add column if not exists minister text not null default ''/i);
  assert.match(ministerMigrationSource, /grant select \(minister\) on public\.programs to anon/i);
  assert.match(categoryMigrationSource, /add column if not exists category text not null default ''/i);
  assert.match(categoryMigrationSource, /grant select \(category\) on public\.programs to anon/i);
  assert.match(adminSource, /program-category/);
  assert.match(adminSource, /getProgrammeInteractions\(programs\)/);
  assert.match(adminSource, /voteYesCount/);
  assert.match(adminSource, /voteNoCount/);
  assert.doesNotMatch(adminSource, /(?:\u00c2[\u0080-\u00ff]|\u00c3[\u0080-\u00ff]|\u00e2[\u0080-\u00ff]{2})/);
  assert.match(appSource, /data-action="toggle-programme-description"/);
  assert.match(appSource, /excerptProgrammeDescription\(description\)/);
  assert.match(appSource, /"from " \+ startLabel \+ " to " \+ endLabel/);
  assert.match(appSource, /public-program-detail-title\">Venue<\/span>/);
  assert.doesNotMatch(appSource, /programme-comments|data-programme-comment-form|submitPublicProgrammeComment|postProgrammeComment/);
  assert.match(styleSource, /\.public-programs-page \{ width: 100%; max-width: none; \}/);
  assert.match(styleSource, /\.public-program-list \{ display: grid; width: min\(100%, 720px\); max-width: 100%;/);
  assert.match(styleSource, /\.public-program-post-header \{ display: flex; align-items: center; gap: 10px;/);
  assert.match(styleSource, /\.programme-vote-options \{ display: grid; grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.doesNotMatch(styleSource, /\.programme-vote-options \{ grid-template-columns: 1fr; \}/);
  assert.doesNotMatch(styleSource, /\.programme-comment/);
});
