import assert from "node:assert/strict";
import test from "node:test";
import uploadedHymns from "../data/uploaded-hymns.js";
import { getAllHymns, getHymnByNumber } from "../js/hymn-service.js";
import { filterHymnsForActiveHymnal } from "../js/hymnal-selection.js";
import { writeLocal } from "../js/local-store.js";

const PUBLISHED_CACHE_KEY = "cerc-published-hymns-uploaded-v6";

function installStorage() {
  const values = new Map();
  globalThis.window = {
    localStorage: {
      getItem(key) { return values.has(key) ? values.get(key) : null; },
      setItem(key, value) { values.set(key, String(value)); },
      removeItem(key) { values.delete(key); }
    }
  };
  writeLocal("cerc-active-hymnal-v2", null);
  writeLocal(PUBLISHED_CACHE_KEY, null);
  return values;
}

function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return body; }
  };
}

test("the bundled catalog contains only the 128 uploaded hymns", () => {
  assert.equal(uploadedHymns.length, 128);
  assert.ok(uploadedHymns.every(function (hymn) {
    return hymn.source_hymnal === "Uploaded Hymn Collection" &&
      hymn.category === "Consolation Hymn" &&
      Number.isInteger(hymn.source_hymn_number) &&
      hymn.verses_en.length > 0;
  }));
  assert.equal(new Set(uploadedHymns.map(function (hymn) { return hymn.hymn_number; })).size, 128);
});

test("the active filter returns uploaded hymns only, even for an old CAC selection", () => {
  const uploaded = { source_hymnal: "Uploaded Hymn Collection" };
  const rows = [
    { source_hymnal: "Christ Apostolic Church Gospel Hymn Book" },
    { source_hymnal: "Christ Apostolic Church Yoruba Hymn Book (Iwe Orin CAC)" },
    { source_hymnal: "CAC GHB" },
    uploaded,
    { source_hymnal: "Community Hymnal" }
  ];
  assert.deepEqual(filterHymnsForActiveHymnal(rows, "cac"), [uploaded]);
  assert.deepEqual(filterHymnsForActiveHymnal(rows, "uploaded"), [uploaded]);
});

test("the public catalog does not fall back to bundled hymns when offline", async () => {
  installStorage();
  globalThis.fetch = async function () { throw new Error("offline"); };
  assert.deepEqual(await getAllHymns(), []);
});

test("legacy CAC cache keys are ignored after switching to uploaded-only", async () => {
  const values = installStorage();
  values.set("cerc-active-hymnal-v1", JSON.stringify("cac"));
  values.set("cerc-published-hymns-active-v5", JSON.stringify([
    { hymn_number: 1, title_en: "Old CAC hymn", source_hymnal: "CAC GHB", status: "published", verses_en: ["Old verse"] }
  ]));
  globalThis.fetch = async function () { throw new Error("offline"); };
  assert.deepEqual(await getAllHymns(), []);
});

test("published results include uploaded hymns only and keep drafts hidden", async () => {
  const values = installStorage();
  let hymnRequest;
  globalThis.fetch = async function (url, options) {
    if (String(url).includes("/rpc/get_active_hymnal")) return response("cac");
    hymnRequest = { url: String(url), options };
    return response([
      { id: "uploaded-2", hymn_number: 10038, source_hymn_number: 63, title_en: "Uploaded variant", source_hymnal: "Uploaded Hymn Collection", category: "Consolation Hymn", status: "published", verses_en: ["Uploaded verse"] },
      { id: "cac-english", hymn_number: 18, title_en: "CAC English hymn", source_hymnal: "CAC GHB", status: "published", verses_en: ["CAC verse"] },
      { id: "other", hymn_number: 20000, title_en: "Other collection hymn", source_hymnal: "Community Hymnal", status: "published", verses_en: ["Other verse"] },
      { id: "uploaded-draft", hymn_number: 10002, title_en: "Draft", source_hymnal: "Uploaded Hymn Collection", status: "draft", verses_en: ["Draft verse"] },
      { id: "uploaded-1", hymn_number: 10000, source_hymn_number: 2, title_en: "Uploaded hymn", source_hymnal: "Uploaded Hymn Collection", status: "published", verses_en: ["Uploaded verse"] }
    ]);
  };

  const hymns = await getAllHymns();
  assert.deepEqual(hymns.map(function (hymn) { return hymn.hymn_number; }), [10000, 10038]);
  assert.deepEqual(hymns.map(function (hymn) { return hymn.source_hymnal; }), ["Uploaded Hymn Collection", "Uploaded Hymn Collection"]);
  assert.equal(hymns[1].source_number_label, "63V");
  assert.deepEqual(JSON.parse(values.get(PUBLISHED_CACHE_KEY)).map(function (hymn) { return hymn.hymn_number; }), [10000, 10038]);
  assert.match(hymnRequest.url, /status=eq\.published/);
  assert.match(hymnRequest.url, /hymn_number\.asc/);
  assert.equal(hymnRequest.options.headers.authorization, "Bearer " + hymnRequest.options.headers.apikey);
});

test("uploaded meter-only titles are normalized to the first lyric line", async () => {
  installStorage();
  globalThis.fetch = async function () {
    return response([{
      id: "uploaded-meter",
      hymn_number: 10001,
      source_hymnal: "Uploaded Hymn Collection",
      title_en: "6.6.6.",
      first_line_en: "6.6.6.",
      source_first_line_en: "6.6.6.",
      status: "published",
      verses_en: ["6.6.6.\nScripture reference", "An uploaded hymn begins here"]
    }]);
  };
  const hymns = await getAllHymns();
  assert.equal(hymns.length, 1);
  assert.equal(hymns[0].title_en, "An uploaded hymn begins here");
  assert.equal(hymns[0].first_line_en, hymns[0].title_en);
  assert.equal(hymns[0].source_first_line_en, hymns[0].title_en);
});

test("cached data is filtered to uploaded hymns while the backend is unavailable", async () => {
  installStorage().set(PUBLISHED_CACHE_KEY, JSON.stringify([
    { hymn_number: 10000, title_en: "Uploaded hymn", source_hymnal: "Uploaded Hymn Collection", status: "published", verses_en: ["Uploaded verse"] },
    { hymn_number: 18, title_en: "CAC hymn", source_hymnal: "CAC GHB", status: "published", verses_en: ["CAC verse"] }
  ]));
  globalThis.fetch = async function () { throw new Error("backend unavailable"); };
  const hymns = await getAllHymns();
  assert.deepEqual(hymns.map(function (hymn) { return hymn.title_en; }), ["Uploaded hymn"]);
});

test("a successful empty result clears the cache and stays empty offline", async () => {
  const values = installStorage();
  values.set(PUBLISHED_CACHE_KEY, JSON.stringify([
    { hymn_number: 10000, title_en: "Uploaded hymn", source_hymnal: "Uploaded Hymn Collection", status: "published", verses_en: ["Uploaded verse"] }
  ]));
  globalThis.fetch = async function () { return response([]); };
  assert.deepEqual(await getAllHymns(), []);
  assert.deepEqual(JSON.parse(values.get(PUBLISHED_CACHE_KEY)), []);

  globalThis.fetch = async function () { throw new Error("offline"); };
  assert.deepEqual(await getAllHymns(), []);
});

test("hymn lookup uses the same uploaded-only catalog as the app", async () => {
  installStorage();
  globalThis.fetch = async function () {
    return response([
      { id: "uploaded", hymn_number: 10000, title_en: "Uploaded hymn", source_hymnal: "Uploaded Hymn Collection", status: "published", verses_en: ["Uploaded verse"] },
      { id: "cac", hymn_number: 18, title_en: "CAC hymn", source_hymnal: "CAC GHB", status: "published", verses_en: ["CAC verse"] }
    ]);
  };
  assert.equal((await getHymnByNumber(10000)).title_en, "Uploaded hymn");
  assert.equal(await getHymnByNumber(18), null);
});
