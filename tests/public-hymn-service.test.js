import assert from "node:assert/strict";
import test from "node:test";
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

test("bundled hymns remain the fallback before any remote or cached catalog is available", async () => {
  installStorage();
  globalThis.fetch = async function () { throw new Error("offline"); };
  const hymns = await getAllHymns();
  assert.equal(hymns.length, 197);
  assert.equal(hymns[0].hymn_number, 1);
});

test("published hymns load from the shared backend in hymn-number order", async () => {
  installStorage();
  let request;
  globalThis.fetch = async function (url, options) {
    request = { url: String(url), options };
    return response([
      { hymn_number: 9, title_en: "Later hymn", status: "published", verses_en: ["Verse"] },
      { hymn_number: 3, title_en: "Earlier hymn", status: "published", verses_en: ["First"] },
      { hymn_number: 4, title_en: "Draft hymn", status: "draft", verses_en: ["Hidden"] }
    ]);
  };

  const hymns = await getAllHymns();
  assert.deepEqual(hymns.map(function (hymn) { return hymn.hymn_number; }), [3, 9]);
  assert.equal(hymns[0].title_en, "Earlier hymn");
  assert.equal(request.options.headers.apikey.startsWith("sb_publishable_"), true);
  assert.equal(request.options.headers.authorization, "Bearer " + request.options.headers.apikey);
  assert.match(request.url, /status=eq\.published/);
  assert.match(request.url, /hymn_number\.asc/);
});

test("a successful empty published result does not resurrect bundled hymns", async () => {
  installStorage();
  globalThis.fetch = async function () { return response([]); };
  assert.deepEqual(await getAllHymns(), []);
});

test("cached published hymns are used when the public backend is unavailable", async () => {
  const values = installStorage();
  values.set("cerc-published-hymns-v1", JSON.stringify([
    { hymn_number: 21, title_en: "Previously published", status: "published", verses_en: ["Cached"] }
  ]));
  globalThis.fetch = async function () { return response({ message: "public read is not enabled" }, 403); };

  assert.deepEqual(await getAllHymns(), [
    {
      hymn_number: 21,
      title_en: "Previously published",
      title_yoruba: "",
      first_line_en: "",
      first_line_yoruba: "",
      category: "",
      verses_en: ["Cached"],
      verses_yoruba: [],
      chorus_en: "",
      chorus_yoruba: "",
      keywords: [],
      author_en: "",
      source_hymnal: "",
      source_publication_year: null,
      source_hymn_number: null,
      source_first_line_en: "",
      source_hymnary_url: "",
      lyrics_source_url: "",
      status: "published"
    }
  ]);
});

test("hymn lookup uses the same published-or-offline catalog as the app", async () => {
  installStorage();
  globalThis.fetch = async function () {
    return response([{ hymn_number: 42, title_en: "Shared hymn", status: "published" }]);
  };
  assert.equal((await getHymnByNumber(42)).title_en, "Shared hymn");
  assert.equal(await getHymnByNumber(7), null);
});
