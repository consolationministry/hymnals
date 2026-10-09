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

test("bundled CAC collections are complete, distinct, and use unique app IDs", async () => {
  installStorage();
  globalThis.fetch = async function () { throw new Error("offline"); };
  const hymns = await getAllHymns();
  assert.equal(hymns.length, 1998);
  assert.equal(hymns.filter(function (hymn) { return hymn.verses_en.length > 0; }).length, 1001);
  assert.equal(hymns.filter(function (hymn) { return hymn.verses_yoruba.length > 0; }).length, 997);
  assert.equal(new Set(hymns.map(function (hymn) { return hymn.hymn_number; })).size, hymns.length);
  assert.equal(hymns[0].source_number_label, "1");
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
      { hymn_number: 9, title_en: "Later hymn", source_hymnal: "CAC GHB", status: "published", verses_en: ["Verse"] },
      { hymn_number: 3, title_en: "Earlier hymn", source_hymnal: "CAC GHB", status: "published", verses_en: ["First"] },
      { hymn_number: 4, title_en: "Draft hymn", source_hymnal: "CAC GHB", status: "draft", verses_en: ["Hidden"] }
    ]);
  };

  const hymns = await getAllHymns();
  assert.deepEqual(hymns.map(function (hymn) { return hymn.hymn_number; }), [3, 9]);
  assert.equal(hymns[0].title_en, "Earlier hymn");
  assert.ok(hymns[0].source_number_label);
  assert.equal(request.options.headers.apikey.startsWith("sb_publishable_"), true);
  assert.equal(request.options.headers.authorization, "Bearer " + request.options.headers.apikey);
  assert.match(request.url, /status=eq\.published/);
  assert.match(request.url, /hymn_number\.asc/);
});

test("a legacy remote Pentecostal catalog is ignored in favor of the bundled CAC books", async () => {
  installStorage();
  globalThis.fetch = async function () {
    return response([{ hymn_number: 1, title_en: "Old hymn", source_hymnal: "Pentecostal Hymns No. 1", status: "published", verses_en: ["Old verse"] }]);
  };
  const hymns = await getAllHymns();
  assert.equal(hymns.length, 1998);
  assert.equal(hymns[0].source_hymnal, "Christ Apostolic Church Gospel Hymn Book");
});

test("a successful empty published result does not resurrect bundled hymns", async () => {
  installStorage();
  globalThis.fetch = async function () { return response([]); };
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
