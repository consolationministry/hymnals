import assert from "node:assert/strict";
import test from "node:test";
import { hymns as repositoryHymns } from "../data/cac-hymns.js";
import {
  createProgram,
  deleteProgram,
  getProgram,
  getPrograms,
  getHymns,
  getDraftHymns,
  getHymn,
  getHymnListRows,
  getRecentlyUpdatedHymns,
  moveAllPublishedHymnsToDrafts,
  getDailyQuoteSettings,
  initializeAdminData,
  updateDailyQuoteSettings,
  updateProgram
} from "../admin/js/admin-data.js?v=35";
import { clearSession } from "../admin/js/supabase-client.js?v=31";
import { loginAdmin, logoutAdmin } from "../admin/js/admin-auth.js?v=31";

function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() { return body === null ? "" : JSON.stringify(body); }
  };
}

function installBackend(options) {
  const opts = options || {};
  const programs = [];
  const hymnRows = Array.isArray(opts.hymnRows) ? opts.hymnRows.slice() : [];
  const categories = Array.isArray(opts.categories) ? opts.categories.slice() : [];
  const hymnListOffsets = [];
  const hymnListRequests = [];
  let daily = { id: "global", enabled: true, books: ["Psalms", "Proverbs"], refresh_mode: "on-open" };
  let importedRows = [];
  globalThis.window = { localStorage: {
    getItem(key) { return this.values && this.values.get(key) || null; },
    setItem(key, value) { if (!this.values) this.values = new Map(); this.values.set(key, String(value)); },
    removeItem(key) { if (this.values) this.values.delete(key); },
    values: new Map()
  } };
  clearSession();

  globalThis.fetch = async function (input, init) {
    const url = new URL(String(input));
    const method = init.method || "GET";
    if (url.pathname.endsWith("/auth/v1/token")) {
      return response({ access_token: "access-test", refresh_token: "refresh-test" });
    }
    if (url.pathname.endsWith("/auth/v1/user")) {
      return response({ id: "admin-uuid", email: "admin@example.org" });
    }
    if (url.pathname.endsWith("/rest/v1/admin_users")) {
      return response([{ user_id: "admin-uuid" }]);
    }
    if (url.pathname.endsWith("/auth/v1/logout")) return response(null, 204);
    if (url.pathname.endsWith("/rest/v1/categories")) {
      if (method === "GET") return response(categories.map(function (name) { return { name }; }));
      if (method === "POST") {
        const row = JSON.parse(init.body);
        if (!categories.includes(row.name)) categories.push(row.name);
        return response([{ name: row.name }], 201);
      }
    }
    if (url.pathname.endsWith("/rest/v1/hymns") && method === "GET") {
      const idFilter = url.searchParams.get("id");
      const id = idFilter && idFilter.startsWith("eq.") ? idFilter.slice(3) : "";
      const statusFilter = url.searchParams.get("status");
      const status = statusFilter && statusFilter.startsWith("eq.") ? statusFilter.slice(3) : "";
      const filtered = hymnRows.filter(function (hymn) {
        return (!id || hymn.id === id) && (!status || hymn.status === status);
      });
      if (id) return response(filtered);
      const offset = Number(url.searchParams.get("offset")) || 0;
      const limit = Number(url.searchParams.get("limit")) || filtered.length;
      hymnListOffsets.push(offset);
      hymnListRequests.push({ offset, status, select: url.searchParams.get("select") || "" });
      return response(filtered.slice(offset, offset + limit));
    }
    if (url.pathname.endsWith("/rest/v1/hymns") && method === "POST") {
      const batch = Array.isArray(JSON.parse(init.body)) ? JSON.parse(init.body) : [JSON.parse(init.body)];
      const inserted = [];
      batch.forEach(function (hymn) {
        if (hymnRows.some(function (current) { return current.hymn_number === hymn.hymn_number; })) return;
        const row = Object.assign({ id: "hymn-" + hymn.hymn_number }, hymn);
        hymnRows.push(row);
        importedRows.push(row);
        inserted.push(row);
      });
      return response(inserted, 201);
    }
    if (url.pathname.endsWith("/rest/v1/hymns") && method === "PATCH") {
      const idFilter = url.searchParams.get("id") || "";
      const matchedIds = idFilter.startsWith("in.(")
        ? idFilter.slice(4, -1).split(",").map(decodeURIComponent)
        : idFilter.startsWith("eq.") ? [idFilter.slice(3)] : [];
      const changes = JSON.parse(init.body);
      const updated = hymnRows.filter(function (hymn) { return matchedIds.includes(hymn.id); });
      updated.forEach(function (hymn) { Object.assign(hymn, changes); });
      return response(updated);
    }
    if (url.pathname.endsWith("/rest/v1/programs")) {
      const idFilter = url.searchParams.get("id");
      const id = idFilter && idFilter.startsWith("eq.") ? idFilter.slice(3) : "";
      if (method === "GET") return response(programs.filter(function (item) { return !id || item.id === id; }));
      if (method === "POST") {
        const row = Object.assign({ id: "program-1", created_at: "2026-10-01T00:00:00.000Z", updated_at: "2026-10-01T00:00:00.000Z" }, JSON.parse(init.body));
        programs.push(row); return response([row], 201);
      }
      if (method === "PATCH") {
        const record = programs.find(function (item) { return item.id === id; });
        if (!record) return response([]);
        Object.assign(record, JSON.parse(init.body), { updated_at: "2026-10-02T00:00:00.000Z" });
        return response([record]);
      }
      if (method === "DELETE") {
        const index = programs.findIndex(function (item) { return item.id === id; });
        if (index >= 0) programs.splice(index, 1);
        return response(null, 204);
      }
    }
    if (url.pathname.endsWith("/rest/v1/daily_quote_settings")) {
      if (method === "GET") return response([daily]);
      if (method === "PATCH") {
        daily = Object.assign(daily, JSON.parse(init.body));
        return response([daily]);
      }
    }
    throw new Error("Unexpected request: " + method + " " + url);
  };
  return {
    programs,
    hymnRows,
    hymnListOffsets,
    hymnListRequests,
    get importedRows() { return importedRows; },
  };
}

async function signIn() {
  await loginAdmin("admin@example.org", "test-password");
}

function program(overrides) {
  return Object.assign({
    title: "Annual Thanksgiving",
    venue: "Church auditorium",
    startDate: "2026-12-01",
    endDate: "",
    flyerDataUrl: "",
    responseQuestion: "Will you be available for this program?",
    yesLabel: "Yes, I’ll be there",
    noLabel: "Not this time"
  }, overrides || {});
}

test("admin programs create, edit, list, and delete through the shared backend", async () => {
  const backend = installBackend();
  await signIn();
  const created = await createProgram(program());
  assert.equal(created.title, "Annual Thanksgiving");
  assert.equal(created._storage_mode, "remote");
  assert.equal((await getPrograms()).length, 1);

  const updated = await updateProgram(created.id, program({ endDate: "2026-12-03", yesLabel: "Count me in" }));
  assert.equal(updated.endDate, "2026-12-03");
  assert.equal((await getProgram(created.id)).yesLabel, "Count me in");
  assert.equal(await deleteProgram(created.id), true);
  assert.equal(await getProgram(created.id), null);
  assert.equal(backend.programs.length, 0);
  await logoutAdmin();
});

test("program dates and flyer payloads are validated before saving", async () => {
  installBackend();
  await signIn();
  assert.equal((await createProgram(program())).endDate, "");
  await assert.rejects(createProgram(program({ title: "", startDate: "2026-02-30" })), /event name/);
  await assert.rejects(createProgram(program({ startDate: "2026-02-30" })), /valid start date/);
  await assert.rejects(createProgram(program({ endDate: "2026-11-30" })), /cannot be before/);
  await assert.rejects(createProgram(program({ flyerDataUrl: "https://example.com/flyer.png" })), /PNG, JPEG, or WebP/);
  await logoutAdmin();
});

test("daily quote preferences persist to the shared backend and require a source", async () => {
  const backend = installBackend();
  await signIn();
  assert.deepEqual(await getDailyQuoteSettings(), { enabled: true, books: ["Psalms", "Proverbs"], refreshMode: "on-open" });
  assert.equal(await updateDailyQuoteSettings({ enabled: false, books: ["Psalms"], refreshMode: "daily" }), "remote");
  assert.deepEqual(await getDailyQuoteSettings(), { enabled: false, books: ["Psalms"], refreshMode: "daily" });
  await assert.rejects(updateDailyQuoteSettings({ enabled: true, books: [], refreshMode: "on-open" }), /Choose Psalms/);
  assert.equal(backend.programs.length, 0);
  await logoutAdmin();
});

test("admin setup fills a partial catalog without overwriting existing records and imports new hymns as drafts", async () => {
  const existing = { id: "existing-hymn-1", hymn_number: repositoryHymns[0].hymn_number, title_en: "Existing reviewed title", status: "published", category: repositoryHymns[0].category };
  const backend = installBackend({ hymnRows: [existing] });
  await signIn();
  const result = await initializeAdminData();
  assert.equal(result.imported, repositoryHymns.length - 1);
  assert.equal(backend.hymnRows.length, repositoryHymns.length);
  assert.equal(backend.hymnRows[0].title_en, "Existing reviewed title");
  assert.equal(backend.hymnRows[0].status, "published");
  assert.equal(backend.importedRows.length, repositoryHymns.length - 1);
  assert.equal(backend.importedRows[0].status, "draft");
  assert.equal(backend.importedRows[0].published_at, null);
  assert.equal(backend.importedRows[0].author_en, repositoryHymns[1].author_en || "");
  assert.match(backend.importedRows[0].body_html_en, /^<p>/);
  assert.equal((await initializeAdminData()).imported, 0);
  await logoutAdmin();
});

test("admin views hide legacy rows outside the current photographed catalog without deleting database rows", async () => {
  const english = repositoryHymns.find(function (hymn) { return hymn.source_hymnal === "Christ Apostolic Church Gospel Hymn Book"; });
  const yoruba = repositoryHymns.find(function (hymn) { return hymn.source_hymnal.includes("Yoruba Hymn Book"); });
  const backend = installBackend({ hymnRows: [
    { id: "current-english", hymn_number: english.hymn_number, source_hymnal: english.source_hymnal, title_en: english.title_en, status: "published", updated_at: "2026-10-12T00:00:00Z" },
    { id: "current-yoruba", hymn_number: yoruba.hymn_number, source_hymnal: yoruba.source_hymnal, title_yoruba: yoruba.title_yoruba, status: "draft", updated_at: "2026-10-11T00:00:00Z" },
    { id: "legacy-english", hymn_number: 99001, source_hymnal: english.source_hymnal, title_en: "Outside the pictured index", status: "published", updated_at: "2026-10-10T00:00:00Z" },
    { id: "legacy-yoruba", hymn_number: 99002, source_hymnal: yoruba.source_hymnal, title_yoruba: "Outside the current Yoruba catalog", status: "draft", updated_at: "2026-10-09T00:00:00Z" },
    { id: "custom-collection", hymn_number: 99003, source_hymnal: "Community Hymnal", title_en: "Custom collection hymn", status: "published", updated_at: "2026-10-08T00:00:00Z" }
  ] });
  await signIn();

  const hymns = await getHymnListRows();
  assert.deepEqual(hymns.map(function (hymn) { return hymn.id; }), ["current-english", "current-yoruba", "custom-collection"]);
  const drafts = await getDraftHymns();
  assert.deepEqual(drafts.map(function (hymn) { return hymn.id; }), ["current-yoruba"]);
  const recent = await getRecentlyUpdatedHymns(5);
  assert.ok(recent.every(function (hymn) { return !hymn.id.startsWith("legacy-"); }));
  assert.equal(backend.hymnRows.length, 5, "hidden database rows remain intact");
  await logoutAdmin();
});

test("draft list filters and paginates every draft using compact hymn rows", async () => {
  const rows = Array.from({ length: 210 }, function (_, index) {
    return { id: "draft-page-" + index, hymn_number: index + 1, title_en: "Hymn " + (index + 1), first_line_en: "First line " + (index + 1), category: "Praise", status: index < 205 ? "draft" : "published" };
  });
  const backend = installBackend({ hymnRows: rows });
  await signIn();
  const drafts = await getDraftHymns();
  assert.equal(drafts.length, 205);
  assert.ok(drafts.every(function (hymn) { return hymn.status === "draft"; }));
  assert.deepEqual(backend.hymnListOffsets, [0, 100, 200]);
  assert.ok(backend.hymnListRequests.every(function (request) { return request.status === "draft"; }));
  assert.ok(backend.hymnListRequests.every(function (request) { return request.select.includes("title_en") && !request.select.includes("body_html_en"); }));
  await logoutAdmin();
});

test("admin hymn lists paginate beyond the backend's first 100 rows", async () => {
  const rows = Array.from({ length: 205 }, function (_, index) {
    return { id: "page-" + index, hymn_number: index + 1, title_en: "Hymn " + (index + 1), first_line_en: "First line " + (index + 1), category: "Praise", status: index % 2 ? "draft" : "published" };
  });
  const backend = installBackend({ hymnRows: rows });
  await signIn();
  const hymns = await getHymns();
  assert.equal(hymns.length, 205);
  assert.deepEqual(backend.hymnListOffsets, [0, 100, 200]);
  await logoutAdmin();
});

test("moving published hymns to Drafts updates every published row", async () => {
  const backend = installBackend({ hymnRows: [
    { id: "published-1", hymn_number: 1, status: "published" },
    { id: "published-2", hymn_number: 2, status: "published" },
    { id: "already-draft", hymn_number: 3, status: "draft" }
  ] });
  await signIn();
  assert.equal(await moveAllPublishedHymnsToDrafts(), 2);
  assert.deepEqual(backend.hymnRows.map(function (hymn) { return hymn.status; }), ["draft", "draft", "draft"]);
  assert.equal(backend.hymnRows[0].published_at, null);
  await logoutAdmin();
});

test("admin hymn list and editor keep the current English catalog and normalize meter titles", async () => {
  installBackend({ hymnRows: [
    { id: "hymn-18", hymn_number: 18, source_hymn_number: 10, source_hymnal: "Christ Apostolic Church Gospel Hymn Book", title_en: "6.6.6.", first_line_en: "6.6.6.", source_first_line_en: "6.6.6.", verses_en: ["6.6.6.\nScripture reference", "Holy Father, hear me,\nThou art my defender,"], keywords: [] },
    { id: "retired-1", hymn_number: 1, source_hymn_number: 1, source_hymnal: "Christ Apostolic Church Gospel Hymn Book", title_en: "Retired hymn", verses_en: ["Old verse"], keywords: [] }
  ] });
  await signIn();
  const hymns = await getHymns();
  assert.equal(hymns.length, 1);
  assert.equal(hymns[0].hymn_number, 18);
  assert.equal(hymns[0].title_en, "Holy Father, hear me,");
  assert.equal((await getHymn("hymn-18")).title_en, "Holy Father, hear me,");
  assert.equal(await getHymn("retired-1"), null);
  await logoutAdmin();
});
