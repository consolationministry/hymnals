import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  createSavedLiveAudioPlaybackUrl,
  getSavedLiveAudioPrograms,
  isLiveAudioRecordingSaved,
  removeSavedLiveAudioProgram,
  saveLiveAudioRecordingOffline
} from "../js/live-audio-offline.js";
import { renderLiveAudioListener, renderLiveAudioPage } from "../js/live-audio-views.js";

const PROGRAM = {
  id: "service-1",
  title: "Sunday Service",
  description: "Worship together",
  speaker: "Pastor A",
  category: "Sunday Service",
  venue: "Main church",
  date: "2026-10-20",
  status: "published",
  recordingPath: "recording-1.webm",
  recordingDurationSeconds: 42,
  recordingUrl: "https://audio.example.org/recording-1.webm?token=temporary-secret"
};

function createStorage() {
  const values = new Map();
  return {
    values,
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); }
  };
}

function createCacheStorage() {
  const entries = new Map();
  const keyFor = request => typeof request === "string" ? request : request.url;
  const cache = {
    async put(request, response) { entries.set(keyFor(request), response.clone()); },
    async match(request) {
      const response = entries.get(keyFor(request));
      return response ? response.clone() : undefined;
    },
    async delete(request) { return entries.delete(keyFor(request)); }
  };
  return {
    entries,
    async open() { return cache; }
  };
}

test("saving a recording caches its bytes and stores only offline-safe programme details", async () => {
  const storage = createStorage();
  const cacheStorage = createCacheStorage();
  const saved = await saveLiveAudioRecordingOffline(PROGRAM, {
    storage,
    cacheStorage,
    baseUrl: "https://hymnal.example/app/",
    fetcher: async url => {
      assert.equal(url, PROGRAM.recordingUrl);
      return new Response(new Blob(["recorded audio"], { type: "audio/webm" }), { status: 200 });
    }
  });

  assert.equal(saved.id, PROGRAM.id);
  assert.equal(saved.recordingUrl, "");
  assert.equal(isLiveAudioRecordingSaved(PROGRAM.id, { storage }), true);
  assert.equal(getSavedLiveAudioPrograms({ storage })[0].title, PROGRAM.title);
  assert.doesNotMatch(storage.values.get("cerc-hymnal-offline-recordings-v1"), /temporary-secret/);
  assert.equal(cacheStorage.entries.size, 1);

  let playbackBlob;
  const playbackUrl = await createSavedLiveAudioPlaybackUrl(PROGRAM.id, {
    cacheStorage,
    baseUrl: "https://hymnal.example/app/",
    createObjectUrl(blob) {
      playbackBlob = blob;
      return "blob:offline-recording";
    }
  });
  assert.equal(playbackUrl, "blob:offline-recording");
  assert.equal(await playbackBlob.text(), "recorded audio");
});

test("saving rejects insecure or empty recordings without adding a saved entry", async () => {
  const storage = createStorage();
  const cacheStorage = createCacheStorage();
  await assert.rejects(saveLiveAudioRecordingOffline(Object.assign({}, PROGRAM, { recordingUrl: "http://audio.example.org/file" }), {
    storage,
    cacheStorage,
    fetcher: async () => new Response("audio")
  }), /secure recording links/);
  await assert.rejects(saveLiveAudioRecordingOffline(PROGRAM, {
    storage,
    cacheStorage,
    fetcher: async () => new Response(new Blob([]), { status: 200 })
  }), /file is empty/);
  assert.deepEqual(getSavedLiveAudioPrograms({ storage }), []);
  assert.equal(cacheStorage.entries.size, 0);
});

test("removing a saved recording clears both its cached audio and offline listing", async () => {
  const storage = createStorage();
  const cacheStorage = createCacheStorage();
  await saveLiveAudioRecordingOffline(PROGRAM, {
    storage,
    cacheStorage,
    fetcher: async () => new Response(new Blob(["audio"], { type: "audio/webm" }), { status: 200 })
  });
  assert.equal(cacheStorage.entries.size, 1);

  const programs = await removeSavedLiveAudioProgram(PROGRAM.id, { storage, cacheStorage });
  assert.deepEqual(programs, []);
  assert.equal(cacheStorage.entries.size, 0);
});

test("the Saved filter is available offline and opens a cached recording", () => {
  const savedProgram = Object.assign({}, PROGRAM, { recordingUrl: "", savedOffline: true });
  const onlinePage = renderLiveAudioPage({
    programs: [PROGRAM],
    savedPrograms: [],
    comments: [],
    reactions: {},
    myReactions: {},
    loading: false
  }, "", "");
  assert.match(onlinePage, /data-action="save-live-audio"/);
  assert.match(onlinePage, /data-category="__saved__"/);

  const page = renderLiveAudioPage({
    programs: [],
    savedPrograms: [savedProgram],
    comments: [],
    reactions: {},
    myReactions: {},
    loading: false
  }, "", "__saved__");

  assert.match(page, /data-category="__saved__"[^>]*aria-pressed="true"/);
  assert.match(page, /Saved Programmes/);
  assert.match(page, /Saved offline/);
  assert.match(page, /data-action="remove-saved-live-audio"/);

  const listener = renderLiveAudioListener({
    programs: [Object.assign({}, savedProgram, { recordingUrl: "blob:offline-recording" })],
    savedPrograms: [savedProgram],
    comments: [],
    reactions: {},
    myReactions: {}
  }, PROGRAM.id, { offlinePlayback: true });
  assert.match(listener, /src="blob:offline-recording"/);
  assert.match(listener, /available offline/);
  assert.match(listener, /Comments and reactions need an internet connection/);
  assert.doesNotMatch(listener, /data-audio-comment-form/);
});

test("the offline-save module is included in the app's install-time cache", async () => {
  const worker = await readFile(new URL("../service-worker.js", import.meta.url), "utf8");
  assert.match(worker, /"\.\/js\/live-audio-offline\.js"/);
});
