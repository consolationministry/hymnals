import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  updateAdminSettings,
  updateDailyQuoteSettings
} from "../admin/js/admin-data.js?v=44";
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
  const settings = { id: "global", default_hymn_category: "Praise", default_theme: "system" };
  const quoteSettings = { id: "global", enabled: true, books: ["Psalms", "Proverbs"], refresh_mode: "on-open" };
  const requests = [];
  const storage = new Map();
  globalThis.window = {
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); },
      removeItem(key) { storage.delete(key); }
    }
  };
  clearSession();

  globalThis.fetch = async function (input, init) {
    const url = new URL(String(input));
    const method = init && init.method || "GET";
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
      return response([{ name: "Praise" }, { name: "Worship" }]);
    }
    if (url.pathname.endsWith("/rest/v1/admin_settings")) {
      if (method === "GET") return response([settings]);
      if (method === "PATCH") {
        requests.push({ table: "admin_settings", method, body: JSON.parse(init.body) });
        if (opts.emptyWorkspaceUpdate) return response([]);
        Object.assign(settings, JSON.parse(init.body));
        return response([settings]);
      }
    }
    if (url.pathname.endsWith("/rest/v1/daily_quote_settings")) {
      if (method === "GET") return response([quoteSettings]);
      if (method === "PATCH") {
        requests.push({ table: "daily_quote_settings", method, body: JSON.parse(init.body) });
        if (opts.emptyQuoteUpdate) return response([]);
        Object.assign(quoteSettings, JSON.parse(init.body));
        return response([quoteSettings]);
      }
    }
    throw new Error("Unexpected request: " + method + " " + url);
  };
  return { settings, quoteSettings, requests };
}

async function withAdmin(callback, options) {
  const backend = installBackend(options);
  await loginAdmin("admin@example.org", "test-password");
  try {
    await callback(backend);
  } finally {
    await logoutAdmin();
  }
}

test("workspace preference save confirms the updated Supabase row", async () => {
  await withAdmin(async backend => {
    const mode = await updateAdminSettings({ defaultHymnCategory: "Worship" });
    assert.equal(mode, "remote");
    assert.equal(backend.settings.default_hymn_category, "Worship");
    assert.deepEqual(backend.requests[0], {
      table: "admin_settings",
      method: "PATCH",
      body: { default_hymn_category: "Worship", default_theme: "system" }
    });
  });
});

test("workspace preference save fails when Supabase updates no rows", async () => {
  await withAdmin(async () => {
    await assert.rejects(
      updateAdminSettings({ defaultHymnCategory: "Worship" }),
      /Workspace settings were not saved because Supabase did not update the global settings row/
    );
  }, { emptyWorkspaceUpdate: true });
});

test("Daily Quote save fails when Supabase updates no rows", async () => {
  await withAdmin(async () => {
    await assert.rejects(
      updateDailyQuoteSettings({ enabled: false, books: ["Psalms"], refreshMode: "daily" }),
      /Quote settings were not saved because Supabase did not update the global settings row/
    );
  }, { emptyQuoteUpdate: true });
});

test("Settings success messages distinguish Supabase saves from unconfirmed saves", async () => {
  const source = await readFile(new URL("../admin/js/admin-app.js", import.meta.url), "utf8");
  assert.match(source, /mode === "remote" \? "Workspace preference saved to Supabase\."/);
  assert.match(source, /mode === "remote" \? "Quote settings saved to Supabase\."/);
  assert.doesNotMatch(source, /Preference saved for this open session only/);
  assert.doesNotMatch(source, /Quote settings saved for this open session only/);
});
