import assert from "node:assert/strict";
import test from "node:test";
import uploadedHymns from "../data/uploaded-hymns.js";
import { getAllHymns, getHymnByNumber } from "../js/hymn-service.js";
import { writeLocal } from "../js/local-store.js";

const PUBLISHED_CACHE_KEY = "cerc-published-hymns-unified-v11";

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
      Number.isInteger(hymn.source_hymn_number) &&
      hymn.verses_en.length > 0;
  }));
  assert.equal(new Set(uploadedHymns.map(function (hymn) { return hymn.hymn_number; })).size, 128);
});

test("the active filter keeps the uploaded English and Yorùbá collections separate", () => {
  const english = { source_hymnal: "Uploaded Hymn Collection" };
  const yoruba = { source_hymnal: "Uploaded Yorùbá Hymn Collection" };
  const rows = [
    { source_hymnal: "Christ Apostolic Church Gospel Hymn Book" },
    { source_hymnal: "CAC YHB" },
    english,
    yoruba,
    { source_hymnal: "Community Hymnal" }
  ];
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

test("published results include both uploaded collections and keep drafts hidden", async () => {
  const values = installStorage();
  let hymnRequest;
  globalThis.fetch = async function (url, options) {
    hymnRequest = { url: String(url), options };
    return response([
      { id: "uploaded-2", hymn_number: 10038, source_hymn_number: 63, title_en: "Uploaded variant", source_hymnal: "Uploaded Hymn Collection", category: "Consolation Hymn", status: "published", verses_en: ["Uploaded verse"] },
      { id: "yoruba-2", hymn_number: 20001, source_hymn_number: 2, title_yoruba: "Aleluya! Orin t’o dun", first_line_yoruba: "Aleluya! Orin t’o dun,", source_hymnal: "Uploaded Yorùbá Hymn Collection", category: "Yorùbá Hymn Book", status: "published", verses_yoruba: ["Aleluya! Orin t’o dun,\nOhun ayo ti ki ku;"], hymnal_note: "Ifi 19:1" },
      { id: "cac-english", hymn_number: 18, title_en: "CAC English hymn", source_hymnal: "CAC GHB", status: "published", verses_en: ["CAC verse"] },
      { id: "other", hymn_number: 30000, title_en: "Other collection hymn", source_hymnal: "Community Hymnal", status: "published", verses_en: ["Other verse"] },
      { id: "uploaded-draft", hymn_number: 10002, title_en: "Draft", source_hymnal: "Uploaded Hymn Collection", status: "draft", verses_en: ["Draft verse"] },
      { id: "uploaded-1", hymn_number: 10000, source_hymn_number: 2, title_en: "Uploaded hymn", source_hymnal: "Uploaded Hymn Collection", status: "published", verses_en: ["Uploaded verse"] }
    ]);
  };

  const hymns = await getAllHymns();
  assert.deepEqual(hymns.map(function (hymn) { return hymn.hymn_number; }), [10000, 20001, 10038]);
  assert.deepEqual(hymns.map(function (hymn) { return hymn.source_hymnal; }), ["Uploaded Hymn Collection", "Uploaded Yorùbá Hymn Collection", "Uploaded Hymn Collection"]);
  assert.equal(hymns[2].source_number_label, "63V");
  assert.equal(hymns[1].source_number_label, "002");
  assert.equal(hymns[1].hymnal_note, "Ifi 19:1");
  assert.deepEqual(JSON.parse(values.get(PUBLISHED_CACHE_KEY)).map(function (hymn) { return hymn.hymn_number; }), [10000, 20001, 10038]);
  assert.match(hymnRequest.url, /hymnal_note/);
  assert.match(hymnRequest.url, /status=eq\.published/);
  assert.match(hymnRequest.url, /hymn_number\.asc/);
  assert.equal(hymnRequest.options.headers.authorization, "Bearer " + hymnRequest.options.headers.apikey);
});

test("meter-like titles and text remain exactly as stored", async () => {
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
  assert.equal(hymns[0].title_en, "6.6.6.");
  assert.equal(hymns[0].first_line_en, "6.6.6.");
  assert.equal(hymns[0].source_first_line_en, "6.6.6.");
  assert.deepEqual(hymns[0].verses_en, ["6.6.6.\nScripture reference", "An uploaded hymn begins here"]);
});

test("cached data keeps both uploaded collections and filters legacy CAC rows", async () => {
  installStorage().set(PUBLISHED_CACHE_KEY, JSON.stringify([
    { hymn_number: 10000, title_en: "Uploaded hymn", source_hymnal: "Uploaded Hymn Collection", status: "published", verses_en: ["Uploaded verse"] },
    { hymn_number: 20001, title_yoruba: "Yorùbá hymn", source_hymnal: "Uploaded Yorùbá Hymn Collection", status: "published", verses_yoruba: ["Yorùbá verse"] },
    { hymn_number: 18, title_en: "CAC hymn", source_hymnal: "CAC GHB", status: "published", verses_en: ["CAC verse"] }
  ]));
  globalThis.fetch = async function () { throw new Error("backend unavailable"); };
  const hymns = await getAllHymns();
  assert.deepEqual(hymns.map(function (hymn) { return hymn.hymn_number; }), [10000, 20001]);
});

test("a successful empty result never overwrites a non-empty cache", async () => {
  const values = installStorage();
  values.set(PUBLISHED_CACHE_KEY, JSON.stringify([
    { hymn_number: 10000, title_en: "Uploaded hymn", source_hymnal: "Uploaded Hymn Collection", status: "published", verses_en: ["Uploaded verse"] }
  ]));
  globalThis.fetch = async function () { return response([]); };
  assert.deepEqual(await getAllHymns(), []);
  assert.equal(JSON.parse(values.get(PUBLISHED_CACHE_KEY)).length, 1);
});

test("hymn lookup uses the same two-collection catalog as the app", async () => {
  installStorage();
  globalThis.fetch = async function () {
    return response([
      { id: "uploaded", hymn_number: 10000, title_en: "Uploaded hymn", source_hymnal: "Uploaded Hymn Collection", status: "published", verses_en: ["Uploaded verse"] },
      { id: "yoruba", hymn_number: 20001, title_yoruba: "Yorùbá hymn", source_hymnal: "Uploaded Yorùbá Hymn Collection", status: "published", verses_yoruba: ["Yorùbá verse"] },
      { id: "cac", hymn_number: 18, title_en: "CAC hymn", source_hymnal: "CAC GHB", status: "published", verses_en: ["CAC verse"] }
    ]);
  };
  assert.equal((await getHymnByNumber(10000)).title_en, "Uploaded hymn");
  assert.equal((await getHymnByNumber(20001)).title_yoruba, "Yorùbá hymn");
  assert.equal(await getHymnByNumber(18), null);
});
