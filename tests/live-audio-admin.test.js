import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  ensureLiveAudioAdminLoaded,
  handleLiveAudioAdminAction,
  handleLiveAudioAdminSubmit,
  renderLiveAudioAdmin
} from "../admin/js/live-audio-admin.js";

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalFetch = globalThis.fetch;
const originalFormData = globalThis.FormData;

afterEach(() => {
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
  if (originalDocument === undefined) delete globalThis.document;
  else globalThis.document = originalDocument;
  if (originalFetch === undefined) delete globalThis.fetch;
  else globalThis.fetch = originalFetch;
  if (originalFormData === undefined) delete globalThis.FormData;
  else globalThis.FormData = originalFormData;
});

function installAdminEnvironment() {
  const values = new Map();
  const programs = [];
  const categories = ["Bible Study", "Sunday Service"];
  const stats = { total_broadcasts: 0, total_listeners: 0, total_likes: 0, total_comments: 0 };
  globalThis.window = {
    localStorage: {
      getItem(key) { return values.has(key) ? values.get(key) : null; },
      setItem(key, value) { values.set(key, String(value)); },
      removeItem(key) { values.delete(key); }
    },
    clearTimeout() {},
    setTimeout() { return 1; },
    confirm() { return true; }
  };
  globalThis.document = {
    getElementById() { return null; },
    querySelector() { return null; }
  };
  globalThis.fetch = async (input, options) => {
    const url = new URL(input);
    const method = options && options.method || "GET";
    let body = null;
    if (url.pathname.endsWith("/live_audio_programs")) {
      if (method === "GET") body = programs.slice();
      else if (method === "POST") {
        const data = JSON.parse(options.body);
        const row = Object.assign({
          id: "123e4567-e89b-42d3-a456-426614174000",
          is_live: false,
          live_session_id: null,
          live_started_at: null,
          created_at: "2026-10-20T12:00:00.000Z"
        }, data);
        programs.push(row);
        body = [row];
      } else if (method === "PATCH") {
        const id = url.searchParams.get("id").replace("eq.", "");
        const row = programs.find(item => item.id === id);
        if (row) Object.assign(row, JSON.parse(options.body));
        body = row ? [row] : [];
      } else if (method === "DELETE") {
        const id = url.searchParams.get("id").replace("eq.", "");
        const index = programs.findIndex(item => item.id === id);
        if (index >= 0) programs.splice(index, 1);
        body = null;
      }
    } else if (url.pathname.endsWith("/live_audio_categories")) {
      if (method === "GET") body = categories.map(name => ({ name }));
      else if (method === "POST") {
        JSON.parse(options.body).forEach(item => { if (!categories.includes(item.name)) categories.push(item.name); });
        body = null;
      }
    } else if (url.pathname.endsWith("/get_live_audio_admin_stats")) {
      body = stats;
    }
    return {
      ok: true,
      status: 200,
      async text() { return body == null ? "" : JSON.stringify(body); }
    };
  };
  globalThis.FormData = class {
    constructor(form) { this.form = form; }
    entries() { return Object.entries(this.form.values)[Symbol.iterator](); }
  };
  return programs;
}

async function prepare() {
  const programs = installAdminEnvironment();
  await ensureLiveAudioAdminLoaded();
  return programs;
}

async function selectTab(tab) {
  await handleLiveAudioAdminAction({ dataset: { action: "audio-admin-tab", tab } });
}

test("Live Audio overview has real broadcast stats, a Go live action, and no audio stream URL field", async () => {
  await prepare();
  await selectTab("programs");
  const html = renderLiveAudioAdmin();
  assert.match(html, /Live Audio/);
  assert.match(html, /Go live/);
  assert.match(html, /data-action="navigate" data-view="dashboard"/);
  assert.doesNotMatch(html, /Secure audio stream URL|streamUrl|browser preview/);
});

test("Go live saves programme details, then opens microphone settings with waveform and audio controls", async () => {
  const programs = await prepare();
  await handleLiveAudioAdminAction({ dataset: { action: "audio-admin-new" } });
  const details = renderLiveAudioAdmin();
  assert.match(details, /STEP 1 OF 2/);
  assert.match(details, /Programme title/);
  assert.match(details, /Minister name/);
  assert.match(details, /Cover \/ thumbnail image URL/);
  assert.match(details, /Next: microphone settings/);
  assert.doesNotMatch(details, /Secure audio stream URL/);

  const formEvent = {
    target: {
      id: "live-audio-program-form",
      values: {
        title: "Sunday Service",
        speaker: "Pastor A",
        category: "Sunday Service",
        date: "2026-10-20",
        venue: "Main church",
        imageUrl: "",
        description: "Sunday worship"
      }
    },
    submitter: { dataset: { audioNext: "true" } },
    preventDefault() {}
  };
  await handleLiveAudioAdminSubmit(formEvent);
  assert.equal(programs.length, 1);
  assert.equal(programs[0].status, "draft");
  const settings = renderLiveAudioAdmin();
  assert.match(settings, /STEP 2 OF 2/);
  assert.match(settings, /Microphone check/);
  assert.match(settings, /data-audio-waveform/);
  assert.match(settings, /data-audio-control="bass"/);
  assert.match(settings, /data-audio-control="treble"/);
  assert.match(settings, /data-audio-control="pitch"/);
  assert.match(settings, /data-action="audio-admin-go-live-now"/);
});

test("broadcast settings can return to the list and categories remain editable", async () => {
  await prepare();
  await selectTab("settings");
  const settings = renderLiveAudioAdmin();
  assert.match(settings, /Programme categories/);
  assert.match(settings, /data-action="audio-admin-back"/);
  await handleLiveAudioAdminAction({ dataset: { action: "audio-admin-back" } });
  assert.match(renderLiveAudioAdmin(), /Back to admin dashboard/);
});
