import assert from "node:assert/strict";
import test from "node:test";
import {
  createProgram,
  deleteProgram,
  getProgram,
  getPrograms,
  getDailyQuoteSettings,
  initializeAdminData,
  updateDailyQuoteSettings,
  updateProgram
} from "../admin/js/admin-data.js?v=31";
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
  let daily = { id: "global", enabled: true, books: ["Psalms", "Proverbs"], refresh_mode: "on-open" };
  let importedRows = [];
  let importMarker = Object.prototype.hasOwnProperty.call(opts, "importMarker") ? opts.importMarker : "2026-10-01T00:00:00.000Z";
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
    if (url.pathname.endsWith("/rest/v1/backend_state")) {
      return response([{ initial_hymns_imported_at: importMarker }]);
    }
    if (url.pathname.endsWith("/rest/v1/hymns") && method === "GET") return response([]);
    if (url.pathname.endsWith("/rest/v1/rpc/seed_hymns_if_empty")) {
      importedRows = JSON.parse(init.body).p_hymns;
      return response(importedRows.length);
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
    get importedRows() { return importedRows; },
    set importMarker(value) { importMarker = value; }
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

test("first authorized admin setup imports all repository hymns once", async () => {
  const backend = installBackend({ importMarker: null });
  await signIn();
  const result = await initializeAdminData();
  assert.equal(result.imported, 197);
  assert.equal(backend.importedRows.length, 197);
  assert.equal(backend.importedRows[0].title_en, "More About Jesus");
  assert.equal(backend.importedRows[0].status, undefined);
  assert.equal(backend.importedRows[0].author_en, "E. E. Hewitt");
  assert.match(backend.importedRows[0].body_html_en, /^<p>/);
  await logoutAdmin();
});
