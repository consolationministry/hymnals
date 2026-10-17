import assert from "node:assert/strict";
import test from "node:test";
import { hymns as bundledHymns } from "../data/cac-hymns.js";
import uploadedHymns, { uploadedTitleOverrides } from "../data/uploaded-hymns.js";
import { getAllHymns, getHymnByNumber } from "../js/hymn-service.js";
import { filterHymnsForActiveHymnal } from "../js/hymnal-selection.js";
import { writeLocal } from "../js/local-store.js";

function installStorage() {
  const values = new Map();
  globalThis.window = {
    localStorage: {
      getItem(key) { return values.has(key) ? values.get(key) : null; },
      setItem(key, value) { values.set(key, String(value)); },
      removeItem(key) { values.delete(key); }
    }
  };
  writeLocal("cerc-active-hymnal-v1", null);
  writeLocal("cerc-published-hymns-active-v5", null);
  return values;
}

function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return body; }
  };
}

test("bundled catalogs have separate sources and unique app IDs", () => {
  const hymns = bundledHymns;
  const english = hymns.filter(function (hymn) { return hymn.source_hymnal === "Christ Apostolic Church Gospel Hymn Book"; });
  const yoruba = hymns.filter(function (hymn) { return hymn.source_hymnal.includes("Yoruba Hymn Book"); });
  assert.equal(hymns.length, 432);
  assert.equal(english.length, 152);
  assert.equal(yoruba.length, 152);
  assert.equal(new Set(hymns.map(function (hymn) { return hymn.hymn_number; })).size, hymns.length);
  assert.equal(hymns[0].source_number_label, "34");
  assert.deepEqual([...new Set(hymns.map(function (hymn) { return hymn.category; }))], ["Consolation Hymn"]);
});

test("the complete DOCX collection remains a separate catalog", () => {
  const imported = bundledHymns.filter(function (hymn) { return hymn.source_hymnal === "Uploaded Hymn Collection"; });
  const english = bundledHymns.filter(function (hymn) { return hymn.source_hymnal === "Christ Apostolic Church Gospel Hymn Book"; });
  assert.equal(uploadedHymns.length, 128);
  assert.equal(imported.length, 128);
  assert.equal(new Set(imported.map(function (hymn) { return hymn.hymn_number; })).size, 128);
  assert.ok(imported.every(function (hymn) { return hymn.category === "Consolation Hymn" && Number.isInteger(hymn.source_hymn_number) && hymn.verses_en.length > 0; }));
  assert.equal(imported.filter(function (hymn) { return hymn.source_hymn_number === 11; }).length, 1);
  assert.ok(imported.some(function (hymn) { return hymn.source_hymn_number === 2 && hymn.title_en === "Alleluia, Song of Sweetness"; }));
  for (const number of [38, 55, 78, 82, 120, 233]) {
    const current = english.find(function (hymn) { return hymn.source_hymn_number === number; });
    assert.equal(current.title_en, uploadedTitleOverrides[number]);
  }
});

test("the active selection separates CAC and uploaded hymns", () => {
  const cac = filterHymnsForActiveHymnal(bundledHymns, "cac");
  const uploaded = filterHymnsForActiveHymnal(bundledHymns, "uploaded");
  assert.equal(cac.length, 304);
  assert.equal(uploaded.length, 128);
  assert.ok(cac.every(function (hymn) { return hymn.source_hymnal !== "Uploaded Hymn Collection"; }));
  assert.ok(uploaded.every(function (hymn) { return hymn.source_hymnal === "Uploaded Hymn Collection"; }));
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
  const holyFather = english.find(function (hymn) { return hymn.source_hymn_number === 34 && hymn.source_number_label === "34"; });
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

test("published CAC hymns load in order while retired CAC English rows are excluded", async () => {
  installStorage();
  let hymnRequest;
  globalThis.fetch = async function (url, options) {
    if (String(url).includes("/rpc/get_active_hymnal")) return response("cac");
    hymnRequest = { url: String(url), options };
    return response([
      { id: "hymn-18", hymn_number: 18, source_hymn_number: 34, title_en: "Current hymn", source_hymnal: "CAC GHB", status: "published", verses_en: ["Current verse"] },
      { id: "legacy-1", hymn_number: 1, title_en: "Retired English hymn", source_hymnal: "Christ Apostolic Church Gospel Hymn Book", status: "published", verses_en: ["Old verse"] },
      { id: "legacy-5", hymn_number: 5, title_en: "Legacy hymn", source_hymnal: "Pentecostal Hymns No. 1", status: "published", verses_en: ["Old verse"] }
    ]);
  };

  const hymns = await getAllHymns();
  assert.deepEqual(hymns.map(function (hymn) { return hymn.hymn_number; }), [18]);
  assert.equal(hymns[0].title_en, "Current hymn");
  assert.equal(hymns[0].source_number_label, "34");
  assert.equal(hymnRequest.options.headers.apikey.startsWith("sb_publishable_"), true);
  assert.equal(hymnRequest.options.headers.authorization, "Bearer " + hymnRequest.options.headers.apikey);
  assert.match(hymnRequest.url, /status=eq\.published/);
  assert.match(hymnRequest.url, /hymn_number\.asc/);
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

test("published rows follow the selected collection and drafts stay hidden", async () => {
  const values = installStorage();
  values.set("cerc-published-hymns-active-v5", "null");
  globalThis.fetch = async function (url) {
    if (String(url).includes("/rpc/get_active_hymnal")) return response("uploaded");
    return response([
      { hymn_number: 10001, source_hymn_number: 3, title_en: "Uploaded hymn", source_hymnal: "Uploaded Hymn Collection", status: "published", verses_en: ["Uploaded verse"] },
      { hymn_number: 1, title_en: "CAC hymn", source_hymnal: "CAC GHB", status: "published", verses_en: ["CAC verse"] },
      { hymn_number: 10002, title_en: "Draft hymn", source_hymnal: "Uploaded Hymn Collection", status: "draft", verses_en: ["Draft verse"] }
    ]);
  };
  const hymns = await getAllHymns();
  assert.deepEqual(hymns.map(function (hymn) { return hymn.hymn_number; }), [10001]);
  assert.deepEqual(JSON.parse(values.get("cerc-published-hymns-active-v5")).map(function (hymn) { return hymn.hymn_number; }), [10001]);
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
  values.set("cerc-published-hymns-active-v5", JSON.stringify([
    { hymn_number: 18, source_hymn_number: 34, title_en: "Previously published", source_hymnal: "CAC GHB", status: "published", verses_en: ["Cached"] }
  ]));
  globalThis.fetch = async function () { return response([]); };
  assert.deepEqual(await getAllHymns(), []);
  assert.deepEqual(JSON.parse(values.get("cerc-published-hymns-active-v5")), []);

  globalThis.fetch = async function () { throw new Error("offline"); };
  assert.deepEqual(await getAllHymns(), []);
});

test("an empty cached published catalog stays empty when the backend is unavailable", async () => {
  const values = installStorage();
  values.set("cerc-published-hymns-active-v5", JSON.stringify([]));
  globalThis.fetch = async function () { return response({ message: "not authorized" }, 401); };
  assert.deepEqual(await getAllHymns(), []);
});

test("cached published hymns are used when the public backend is unavailable", async () => {
  const values = installStorage();
  values.set("cerc-published-hymns-active-v5", JSON.stringify([
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

test("published DOCX hymns use the complete uploaded catalog", async () => {
  installStorage();
  globalThis.fetch = async function (url) {
    if (String(url).includes("/rpc/get_active_hymnal")) return response("uploaded");
    return response([
      { id: "variant-63", hymn_number: 10038, source_hymn_number: 63, title_en: "Grace! 'tis a Charming Sound", source_hymnal: "Uploaded Hymn Collection", category: "Consolation Hymn", status: "published", verses_en: ["Variant verse"] },
      { id: "docx-hymn-2", hymn_number: 10000, source_hymn_number: 2, title_en: "Alleluia, Song of Sweetness", source_hymnal: "Uploaded Hymn Collection", category: "Consolation Hymn", status: "published", verses_en: ["Uploaded verse"] },
      { id: "cac-hymn", hymn_number: 18, source_hymn_number: 34, title_en: "CAC only", source_hymnal: "CAC GHB", status: "published", verses_en: ["CAC verse"] }
    ]);
  };
  const hymns = await getAllHymns();
  assert.deepEqual(hymns.map(function (hymn) { return hymn.hymn_number; }), [10000, 10038]);
  assert.equal(hymns[1].source_number_label, "63V");
  assert.equal(hymns[1].category, "Consolation Hymn");
});
