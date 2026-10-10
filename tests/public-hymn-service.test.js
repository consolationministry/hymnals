import assert from "node:assert/strict";
import test from "node:test";
import { hymns as bundledHymns } from "../data/cac-hymns.js";
import { getAllHymns, getHymnByNumber } from "../js/hymn-service.js";

function installStorage() {
  const values = new Map();
  globalThis.window = {
    localStorage: {
      getItem(key) { return values.has(key) ? values.get(key) : null; },
      setItem(key, value) { values.set(key, String(value)); },
      removeItem(key) { values.delete(key); }
    }
  };
  return values;
}

function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return body; }
  };
}

test("bundled CAC source collections are complete, distinct, and use unique app IDs", () => {
  const hymns = bundledHymns;
  assert.equal(hymns.length, 1997);
  assert.equal(hymns.filter(function (hymn) { return hymn.verses_en.length > 0; }).length, 1000);
  assert.equal(hymns.filter(function (hymn) { return hymn.verses_yoruba.length > 0; }).length, 997);
  assert.equal(new Set(hymns.map(function (hymn) { return hymn.hymn_number; })).size, hymns.length);
  assert.equal(hymns[0].source_number_label, "1");
});

test("the public catalog does not fall back to the bundled collection while offline", async () => {
  installStorage();
  globalThis.fetch = async function () { throw new Error("offline"); };
  assert.deepEqual(await getAllHymns(), []);
});

test("meter-only English titles use the first lyric line and duplicate 110 is merged into 86", () => {
  const english = bundledHymns.filter(function (hymn) { return hymn.verses_en.length > 0; });
  const hymn10 = english.find(function (hymn) { return hymn.source_hymn_number === 10 && hymn.source_number_label === "10"; });
  const hymn86 = english.find(function (hymn) { return hymn.source_number_label === "86"; });
  assert.equal(hymn10.title_en, "Holy Father, hear me");
  assert.equal(hymn10.first_line_en, hymn10.title_en);
  assert.ok(english.every(function (hymn) { return !/^(?:\d+\.)+\d*(?:\s*[d&.]+\s*(?:ref\.?|chorus)?)?$/i.test(hymn.title_en); }));
  assert.ok(hymn86.keywords.includes("110"));
  assert.equal(english.some(function (hymn) { return hymn.source_number_label === "110"; }), false);
  assert.equal(english.find(function (hymn) { return hymn.source_number_label === "111"; }).hymn_number, 124);
});

test("repeated source numbers are disambiguated without treating the books as translations", () => {
  const english = bundledHymns.filter(function (hymn) { return hymn.source_hymnal === "Christ Apostolic Church Gospel Hymn Book" && hymn.source_hymn_number === 2; });
  const yoruba = bundledHymns.filter(function (hymn) { return hymn.source_hymnal.includes("Yoruba Hymn Book") && hymn.source_hymn_number === 3; });
  assert.deepEqual(english.map(function (hymn) { return hymn.source_number_label; }), ["2", "2V"]);
  assert.equal(yoruba.length, 2);
  assert.ok(yoruba.every(function (hymn) { return hymn.verses_en.length === 0 && hymn.verses_yoruba.length > 0; }));
});

test("published CAC hymns load from the shared backend in hymn-number order", async () => {
  installStorage();
  let request;
  globalThis.fetch = async function (url, options) {
    request = { url: String(url), options };
    return response([
      { id: "hymn-9", hymn_number: 9, title_en: "Later hymn", source_hymnal: "CAC GHB", status: "published", verses_en: ["Verse"] },
      { id: "hymn-3", hymn_number: 3, title_en: "Earlier hymn", source_hymnal: "CAC GHB", status: "published", verses_en: ["First"] },
      { id: "legacy-5", hymn_number: 5, title_en: "Legacy hymn", source_hymnal: "Pentecostal Hymns No. 1", status: "published", verses_en: ["Legacy"] },
      { hymn_number: 4, title_en: "Draft hymn", source_hymnal: "CAC GHB", status: "draft", verses_en: ["Hidden"] }
    ]);
  };

  const hymns = await getAllHymns();
  assert.deepEqual(hymns.map(function (hymn) { return hymn.hymn_number; }), [3, 9]);
  assert.equal(hymns[0].title_en, "Earlier hymn");
  assert.equal(hymns[0].id, "hymn-3");
  assert.ok(hymns[0].source_number_label);
  assert.equal(request.options.headers.apikey.startsWith("sb_publishable_"), true);
  assert.equal(request.options.headers.authorization, "Bearer " + request.options.headers.apikey);
  assert.match(request.url, /status=eq\.published/);
  assert.match(request.url, /hymn_number\.asc/);
});

test("published English meter titles and the duplicate hymn are normalized", async () => {
  installStorage();
  globalThis.fetch = async function () {
    return response([
      { hymn_number: 99, source_hymn_number: 86, title_en: "7.7.5.", first_line_en: "7.7.5.", source_first_line_en: "7.7.5.", source_hymnal: "CAC GHB", status: "published", verses_en: ["7.7.5.\nScripture reference", "Three in One, and One in Three,\nRuler of the earth and sea,"] },
      { hymn_number: 123, source_hymn_number: 110, title_en: "7.7.5", first_line_en: "7.7.5", source_first_line_en: "7.7.5", source_hymnal: "CAC GHB", status: "published", verses_en: ["7.7.5\nScripture reference", "Three in one, and One in Three,\nRuler of the earth and sea,"] }
    ]);
  };

  const hymns = await getAllHymns();
  assert.equal(hymns.length, 1);
  assert.equal(hymns[0].title_en, "Three in One, and One in Three,");
  assert.equal(hymns[0].first_line_en, hymns[0].title_en);
  assert.ok(hymns[0].keywords.includes("110"));
});

test("legacy non-CAC rows are excluded instead of falling back to bundled hymns", async () => {
  const values = installStorage();
  values.set("cerc-published-hymns-cac-v2", "null");
  globalThis.fetch = async function () {
    return response([{ hymn_number: 1, title_en: "Old hymn", source_hymnal: "Pentecostal Hymns No. 1", status: "published", verses_en: ["Old verse"] }]);
  };
  assert.deepEqual(await getAllHymns(), []);
  assert.deepEqual(JSON.parse(values.get("cerc-published-hymns-cac-v2")), []);
});

test("a successful empty published result clears old hymns and remains empty offline", async () => {
  const values = installStorage();
  values.set("cerc-published-hymns-cac-v2", JSON.stringify([
    { hymn_number: 21, title_en: "Previously published", source_hymnal: "CAC GHB", status: "published", verses_en: ["Cached"] }
  ]));
  globalThis.fetch = async function () { return response([]); };
  assert.deepEqual(await getAllHymns(), []);
  assert.deepEqual(JSON.parse(values.get("cerc-published-hymns-cac-v2")), []);

  globalThis.fetch = async function () { throw new Error("offline"); };
  assert.deepEqual(await getAllHymns(), []);
});

test("an empty cached published catalog stays empty when the backend is unavailable", async () => {
  const values = installStorage();
  values.set("cerc-published-hymns-cac-v2", JSON.stringify([]));
  globalThis.fetch = async function () { return response({ message: "not authorized" }, 401); };
  assert.deepEqual(await getAllHymns(), []);
});

test("cached CAC hymns are used when the public backend is unavailable", async () => {
  const values = installStorage();
  values.set("cerc-published-hymns-cac-v2", JSON.stringify([
    { hymn_number: 21, title_en: "Previously published", source_hymnal: "CAC GHB", status: "published", verses_en: ["Cached"] }
  ]));
  globalThis.fetch = async function () { return response({ message: "public read is not enabled" }, 403); };
  const hymns = await getAllHymns();
  assert.equal(hymns.length, 1);
  assert.equal(hymns[0].title_en, "Previously published");
  assert.ok(hymns[0].source_number_label);
});

test("hymn lookup uses the same published-or-offline catalog as the app", async () => {
  installStorage();
  globalThis.fetch = async function () {
    return response([{ hymn_number: 42, title_en: "Shared hymn", source_hymnal: "CAC GHB", status: "published" }]);
  };
  assert.equal((await getHymnByNumber(42)).title_en, "Shared hymn");
  assert.equal(await getHymnByNumber(7), null);
});
