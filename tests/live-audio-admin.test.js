import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { afterEach, test } from "node:test";
import {
  ensureLiveAudioAdminLoaded,
  handleLiveAudioAdminAction,
  handleLiveAudioAdminSubmit,
  renderLiveAudioAdmin,
  renderLiveAudioStudio
} from "../admin/js/live-audio-admin.js";
import {
  endAdminLiveAudioProgram,
  loadAdminLiveAudioInteractions,
  uploadAdminLiveAudioSegment,
  uploadAdminLiveAudioRecording
} from "../admin/js/live-audio-admin-data.js";
import { buildWaveformBars, buildWaveformPeaks, getWaveformDisplayGain, scaleWaveformBars } from "../admin/js/live-audio-waveform.js";

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
  const calls = [];
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
    calls.push({ url, method, body: options && options.body, headers: options && options.headers });
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
    } else if (url.pathname.endsWith("/get_live_audio_interactions")) {
      body = [{
        program_id: "123e4567-e89b-42d3-a456-426614174000",
        love_count: 4,
        clap_count: 2,
        fire_count: 1,
        comment_count: 1,
        listener_count: 19,
        comments: [{ id: "comment-1", body: "God is good!", created_at: "2026-10-20T12:30:00.000Z" }]
      }];
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
  programs.calls = calls;
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

test("admin music waveform retains per-bar peaks and mirrors around its center", () => {
  assert.deepEqual(
    buildWaveformPeaks(Uint8Array.from([0, 128, 255, 128]), 2),
    [
      { min: -1, max: 0 },
      { min: 0, max: 127 / 128 }
    ]
  );
  assert.deepEqual(
    buildWaveformPeaks(Uint8Array.from([128, 128, 128, 128]), 2),
    [{ min: 0, max: 0 }, { min: 0, max: 0 }]
  );
  assert.deepEqual(buildWaveformPeaks(Uint8Array.from([0, 255]), 8), [
    { min: -1, max: -1 },
    { min: 127 / 128, max: 127 / 128 }
  ]);
  assert.deepEqual(
    buildWaveformBars(Uint8Array.from([128, 255, 128, 0]), 4),
    [0, 127 / 128, 0, 1]
  );
  assert.deepEqual(buildWaveformBars(Uint8Array.from([128, 128, 128, 128]), 2), [0, 0]);
});

test("admin waveform boosts quiet mic input, gates silence, and caps loud peaks", () => {
  const quietBars = buildWaveformBars(Uint8Array.from([128, 132, 128, 130]), 4);
  const gain = getWaveformDisplayGain(quietBars);
  assert.equal(gain, 8);
  assert.deepEqual(scaleWaveformBars(quietBars, gain), [0, 0.25, 0, 0]);
  assert.equal(getWaveformDisplayGain([0, 0.007]), 1);
  assert.deepEqual(scaleWaveformBars([0, 1], 8), [0, 1]);
});

test("Live Audio overview has real broadcast stats, a Go live action, and no audio stream URL field", async () => {
  await prepare();
  await selectTab("programs");
  const html = renderLiveAudioAdmin();
  assert.match(html, /Live Audio/);
  assert.match(html, /Go live/);
  assert.match(html, /data-action="navigate" data-view="dashboard"/);
  assert.doesNotMatch(html, /Secure audio stream URL|streamUrl|browser preview/);
});

test("broadcast setup continues into the dark microphone test and send flow", async () => {
  const programs = await prepare();
  await handleLiveAudioAdminAction({ dataset: { action: "audio-admin-new" } });
  const details = renderLiveAudioAdmin();
  assert.match(details, /Create New Broadcast/);
  assert.match(details, /audio-broadcast-layout/);
  assert.match(details, /Broadcast title/);
  assert.match(details, /Minister \/ Preacher/);
  assert.match(details, /Broadcast Preview/);
  assert.match(details, /data-preview-title/);
  assert.match(details, /Next: Configure Stream/);
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
  assert.match(settings, /Mic &amp; Audio Test/);
  assert.match(settings, /audio-mic-test-layout/);
  assert.match(settings, /Microphone Test/);
  assert.match(settings, /Select microphone/);
  assert.match(settings, /Live Preview/);
  assert.match(settings, /Stream Details/);
  assert.match(settings, /Network &amp; Audio Status/);
  assert.match(settings, /data-audio-waveform/);
  assert.match(settings, /Live music-style audio waveform/);
  assert.match(settings, /data-audio-control="bass"/);
  assert.match(settings, /data-audio-control="treble"/);
  assert.match(settings, /data-audio-control="pitch"/);
  assert.match(settings, /data-action="audio-admin-go-live-now"/);
  assert.match(settings, /audio-go-live-note/);

  await handleLiveAudioAdminAction({ dataset: { action: "audio-admin-back-to-details" } });
  assert.match(renderLiveAudioAdmin(), /Edit Broadcast/);
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

test("live studio renders an audio-first control room and escapes programme content", () => {
  const html = renderLiveAudioStudio({
    id: "123e4567-e89b-42d3-a456-426614174000",
    title: "Sunday <Worship>",
    speaker: "Pastor A",
    category: "Sunday Service",
    imageUrl: "javascript:alert(1)",
    date: "2026-10-20",
    liveStartedAt: "2026-10-20T12:00:00.000Z"
  });
  assert.match(html, /Live Audio Studio/);
  assert.match(html, /data-network-meter/);
  assert.match(html, /data-network-label/);
  assert.match(html, /data-network-toast/);
  assert.match(html, /audio-network-meter-bars/);
  assert.match(html, /Audio-only broadcast/);
  assert.match(html, /data-audio-waveform/);
  assert.match(html, /Live music-style audio waveform/);
  assert.match(html, /data-action="audio-admin-toggle-mic"/);
  assert.match(html, /data-audio-control="bass"/);
  assert.match(html, /Sunday &lt;Worship&gt;/);
  assert.doesNotMatch(html, /src="javascript:/);
});

test("live studio loads real listen, reaction, and recent-comment counts", async () => {
  installAdminEnvironment();
  const interactions = await loadAdminLiveAudioInteractions("123e4567-e89b-42d3-a456-426614174000");
  assert.equal(interactions.listenCount, 19);
  assert.equal(interactions.commentCount, 1);
  assert.deepEqual([interactions.loveCount, interactions.clapCount, interactions.fireCount], [4, 2, 1]);
  assert.equal(interactions.comments[0].body, "God is good!");
});

test("ending a remote live broadcast without its local recording keeps it unpublished", async () => {
  const programs = installAdminEnvironment();
  programs.push({
    id: "123e4567-e89b-42d3-a456-426614174000",
    title: "Sunday Service",
    status: "published",
    is_live: true,
    live_session_id: "123e4567-e89b-42d3-a456-426614174001"
  });
  await ensureLiveAudioAdminLoaded();
  const prompts = [];
  globalThis.window.confirm = message => {
    prompts.push(message);
    return true;
  };

  await handleLiveAudioAdminAction({
    dataset: { action: "audio-admin-stop-live", id: "123e4567-e89b-42d3-a456-426614174000" }
  });

  assert.equal(programs[0].status, "draft");
  assert.equal(programs[0].is_live, false);
  assert.deepEqual(prompts, []);
});

test("completed recordings upload audio bytes and save their private storage path", async () => {
  const programs = installAdminEnvironment();
  const programId = "123e4567-e89b-42d3-a456-426614174000";
  const sessionId = "123e4567-e89b-42d3-a456-426614174001";
  programs.push({ id: programId, title: "Sunday Service", status: "published", is_live: true });

  const saved = await uploadAdminLiveAudioRecording(programId, sessionId, {
    blob: new Blob(["captured audio"], { type: "audio/webm" }),
    contentType: "audio/webm",
    durationSeconds: 42
  });

  assert.equal(saved.recordingPath, programId + "/" + sessionId + ".webm");
  assert.equal(saved.recordingDurationSeconds, 42);
  const upload = programs.calls.find(call => call.url.pathname.includes("/storage/v1/object/live-audio-recordings/"));
  assert.ok(upload);
  assert.equal(upload.method, "POST");
  assert.ok(upload.body instanceof Blob);

  const ended = await endAdminLiveAudioProgram(programId, "draft");
  assert.equal(ended.status, "draft");
});

test("live recording starts before signaling and publication waits for the completed archive", async () => {
  const source = await readFile(new URL("../admin/js/live-audio-admin.js", import.meta.url), "utf8");
  const beginStart = source.indexOf("async function beginBroadcast(");
  const endStart = source.indexOf("async function endBroadcast(", beginStart);
  const actionStart = source.indexOf('if (action === "audio-admin-go-live-now")');
  const actionEnd = source.indexOf('if (action === "audio-admin-stop-live")', actionStart);
  assert.ok(beginStart >= 0 && endStart > beginStart);
  assert.ok(actionStart >= 0 && actionEnd > actionStart);

  const begin = source.slice(beginStart, endStart);
  const end = source.slice(endStart, source.indexOf("export async function handleLiveAudioAdminAction", endStart));
  const goLiveAction = source.slice(actionStart, actionEnd);
  assert.ok(begin.indexOf("startLiveAudioRecording") < begin.indexOf("startLiveAudioPublisher"));
  assert.match(begin, /onNetworkStatus/);
  assert.match(goLiveAction, /Record this live programme/);
  const finalization = end.indexOf("endAdminLiveAudioProgram(programId, finalStatus)");
  assert.ok(end.indexOf("uploadAdminLiveAudioRecording") < finalization);
  assert.doesNotMatch(end, /window\.confirm/);
});

test("live rewind segments upload audio bytes and register their session timeline", async () => {
  const programs = installAdminEnvironment();
  const programId = "123e4567-e89b-42d3-a456-426614174000";
  const sessionId = "123e4567-e89b-42d3-a456-426614174001";
  const storagePath = await uploadAdminLiveAudioSegment(programId, sessionId, {
    index: 3,
    startedAt: "2026-10-25T10:00:00.000Z",
    durationSeconds: 15,
    blob: new Blob(["captured segment"], { type: "audio/webm" }),
    contentType: "audio/webm"
  });

  assert.equal(storagePath, programId + "/" + sessionId + "/segments/000003.webm");
  const upload = programs.calls.find(call => call.url.pathname.includes("/storage/v1/object/live-audio-recordings/"));
  assert.ok(upload);
  assert.equal(upload.method, "POST");
  assert.ok(upload.body instanceof Blob);
  const savedSegment = programs.calls.find(call => call.url.pathname.endsWith("/live_audio_segments"));
  assert.ok(savedSegment);
  assert.equal(savedSegment.method, "POST");
  assert.deepEqual(JSON.parse(savedSegment.body), {
    program_id: programId,
    session_id: sessionId,
    segment_index: 3,
    started_at: "2026-10-25T10:00:00.000Z",
    duration_seconds: 15,
    storage_path: storagePath
  });
});
