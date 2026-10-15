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

test("bundled CAC collections match the photographed English index and use unique app IDs", () => {
  const hymns = bundledHymns;
  const english = hymns.filter(function (hymn) { return hymn.source_hymnal === "Christ Apostolic Church Gospel Hymn Book"; });
  const yoruba = hymns.filter(function (hymn) { return hymn.source_hymnal.includes("Yoruba Hymn Book"); });
  assert.equal(hymns.length, 304);
  assert.equal(english.length, 152);
  assert.equal(yoruba.length, 152);
  assert.equal(new Set(hymns.map(function (hymn) { return hymn.hymn_number; })).size, hymns.length);
  assert.equal(hymns[0].source_number_label, "34");
});

test("the public catalog does not fall back to the bundled collection while offline", async () => {
  installStorage();
  globalThis.fetch = async function () { throw new Error("offline"); };
  assert.deepEqual(await getAllHymns(), []);
});

test("the old published-hymn cache is not reused after the catalog update", async () => {
  const values = installStorage();
  values.set("cerc-published-hymns-cac-v2", JSON.stringify([
    { hymn_number: 1, title_en: "Retired English hymn", source_hymnal: "CAC GHB", status: "published", verses_en: ["Old verse"] }
  ]));
  globalThis.fetch = async function () { throw new Error("offline"); };
  assert.deepEqual(await getAllHymns(), []);
});

test("photographed English hymns retain their source IDs and normalize meter-only titles", () => {
  const english = bundledHymns.filter(function (hymn) { return hymn.source_hymnal === "Christ Apostolic Church Gospel Hymn Book"; });
  const holyFather = english.find(function (hymn) { return hymn.source_hymn_number === 34 && hymn.source_number_label === "10"; });
  assert.equal(holyFather.hymn_number, 18);
  assert.equal(holyFather.title_en, "Holy Father, hear me");
  assert.equal(holyFather.first_line_en, holyFather.title_en);
  assert.ok(english.every(function (hymn) { return !/^(?:\d+\.)+\d*(?:\s*[d&.]+\s*(?:ref\.?|chorus)?)?$/i.test(hymn.title_en); }));
});

test("English and Yoruba collections remain separate source books", () => {
  const english = bundledHymns.filter(function (hymn) { return hymn.source_hymnal === "Christ Apostolic Church Gospel Hymn Book"; });
  const yoruba = bundledHymns.filter(function (hymn) { return hymn.source_hymnal.includes("Yoruba Hymn Book"); });
  assert.ok(english.length > 0);
  assert.ok(english.every(function (hymn) { return hymn.verses_en.length > 0 && hymn.verses_yoruba.length === 0; }));
  assert.ok(yoruba.length > 0);
  assert.ok(yoruba.every(function (hymn) { return hymn.verses_en.length === 0 && hymn.verses_yoruba.length > 0; }));
});

test("published hymns load in order while retired CAC English rows are excluded", async () => {
  installStorage();
  let request;
  globalThis.fetch = async function (url, options) {
    request = { url: String(url), options };
    return response([
      { id: "hymn-18", hymn_number: 18, source_hymn_number: 34, title_en: "Current hymn", source_hymnal: "CAC GHB", status: "published", verses_en: ["Current verse"] },
      { id: "legacy-1", hymn_number: 1, title_en: "Retired English hymn", source_hymnal: "Christ Apostolic Church Gospel Hymn Book", status: "published", verses_en: ["Old verse"] },
      { id: "legacy-5", hymn_number: 5, title_en: "Legacy hymn", source_hymnal: "Pentecostal Hymns No. 1", status: "published", verses_en: ["Legacy"] },
      { hymn_number: 4, title_en: "Draft hymn", source_hymnal: "CAC GHB", status: "draft", verses_en: ["Hidden"] }
    ]);
  };

  const hymns = await getAllHymns();
  assert.deepEqual(hymns.map(function (hymn) { return hymn.hymn_number; }), [5, 18]);
  assert.equal(hymns[0].title_en, "Legacy hymn");
  assert.equal(hymns[0].id, "legacy-5");
  assert.equal(hymns[0].source_number_label, "5");
  assert.equal(hymns[1].title_en, "Current hymn");
  assert.equal(hymns[1].source_number_label, "34");
  assert.equal(request.options.headers.apikey.startsWith("sb_publishable_"), true);
  assert.equal(request.options.headers.authorization, "Bearer " + request.options.headers.apikey);
  assert.match(request.url, /status=eq\.published/);
  assert.match(request.url, /hymn_number\.asc/);
});

test("current English meter titles are normalized and retired CAC hymns are excluded", async () => {
  installStorage();
  globalThis.fetch = async function () {
    return response([
      { hymn_number: 18, source_hymn_number: 34, title_en: "6.6.6.", first_line_en: "6.6.6.", source_first_line_en: "6.6.6.", source_hymnal: "CAC GHB", status: "published", verses_en: ["6.6.6.\nScripture reference", "Holy Father, hear me,\nThou art my defender,"] },
      { hymn_number: 1, source_hymn_number: 1, title_en: "Retired hymn", source_hymnal: "CAC GHB", status: "published", verses_en: ["Retired verse"] }
    ]);
  };
  const hymns = await getAllHymns();
  assert.equal(hymns.length, 1);
  assert.equal(hymns[0].hymn_number, 18);
  assert.equal(hymns[0].title_en, "Holy Father, hear me,");
  assert.equal(hymns[0].first_line_en, hymns[0].title_en);
  assert.equal(hymns[0].source_first_line_en, hymns[0].title_en);
});

test("published non-CAC hymns are included while drafts remain hidden", async () => {
  const values = installStorage();
  values.set("cerc-published-hymns-cac-v4", "null");
  globalThis.fetch = async function () {
    return response([
      { hymn_number: 1, title_en: "Old hymn", source_hymnal: "Pentecostal Hymns No. 1", status: "published", verses_en: ["Old verse"] },
      { hymn_number: 2, title_en: "Draft hymn", source_hymnal: "Pentecostal Hymns No. 1", status: "draft", verses_en: ["Draft verse"] }
    ]);
  };
  const hymns = await getAllHymns();
  assert.deepEqual(hymns.map(function (hymn) { return hymn.hymn_number; }), [1]);
  assert.deepEqual(JSON.parse(values.get("cerc-published-hymns-cac-v4")).map(function (hymn) { return hymn.hymn_number; }), [1]);
});

test("published retired Yorùbá hymns are excluded while current entries remain", async () => {
  installStorage();
  const current = bundledHymns.find(function (hymn) {
    return hymn.source_hymnal.includes("Yoruba Hymn Book");
  });
  globalThis.fetch = async function () {
    return response([
      {
        hymn_number: current.hymn_number,
        source_hymn_number: current.source_hymn_number,
        title_yoruba: current.title_yoruba,
        source_hymnal: current.source_hymnal,
        status: "published",
        verses_yoruba: ["Current verse"]
      },
      {
        hymn_number: 1002,
        source_hymn_number: 1,
        title_yoruba: "Retired hymn",
        source_hymnal: "Christ Apostolic Church Yoruba Hymn Book (Iwe Orin CAC)",
        status: "published",
        verses_yoruba: ["Old verse"]
      }
    ]);
  };
  const hymns = await getAllHymns();
  assert.deepEqual(hymns.map(function (hymn) { return hymn.hymn_number; }), [current.hymn_number]);
  assert.equal(hymns[0].title_yoruba, current.title_yoruba);
});

test("a successful empty published result clears old hymns and remains empty offline", async () => {
  const values = installStorage();
  values.set("cerc-published-hymns-cac-v4", JSON.stringify([
    { hymn_number: 18, source_hymn_number: 34, title_en: "Previously published", source_hymnal: "CAC GHB", status: "published", verses_en: ["Cached"] }
  ]));
  globalThis.fetch = async function () { return response([]); };
  assert.deepEqual(await getAllHymns(), []);
  assert.deepEqual(JSON.parse(values.get("cerc-published-hymns-cac-v4")), []);

  globalThis.fetch = async function () { throw new Error("offline"); };
  assert.deepEqual(await getAllHymns(), []);
});

test("an empty cached published catalog stays empty when the backend is unavailable", async () => {
  const values = installStorage();
  values.set("cerc-published-hymns-cac-v4", JSON.stringify([]));
  globalThis.fetch = async function () { return response({ message: "not authorized" }, 401); };
  assert.deepEqual(await getAllHymns(), []);
});

test("cached published hymns are used when the public backend is unavailable", async () => {
  const values = installStorage();
  values.set("cerc-published-hymns-cac-v4", JSON.stringify([
    { hymn_number: 18, source_hymn_number: 34, title_en: "Previously published", source_hymnal: "CAC GHB", status: "published", verses_en: ["Cached"] }
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
    return response([{ hymn_number: 18, source_hymn_number: 34, title_en: "Shared hymn", source_hymnal: "CAC GHB", status: "published" }]);
  };
  assert.equal((await getHymnByNumber(18)).title_en, "Shared hymn");
  assert.equal(await getHymnByNumber(7), null);
});
