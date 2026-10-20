import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { handleLiveAudioAdminAction, renderLiveAudioAdmin } from "../admin/js/live-audio-admin.js";

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;

afterEach(() => {
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
  if (originalDocument === undefined) delete globalThis.document;
  else globalThis.document = originalDocument;
});

function installAdminEnvironment() {
  const values = new Map();
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
}

async function selectTab(tab) {
  await handleLiveAudioAdminAction({ dataset: { action: "audio-admin-tab", tab } });
}

test("Live Audio overview hides the microphone controls and links back to the admin dashboard", async () => {
  installAdminEnvironment();
  await selectTab("programs");
  const html = renderLiveAudioAdmin();
  assert.match(html, /Live Audio/);
  assert.doesNotMatch(html, /Microphone check|Test microphone|audio-mic-panel/);
  assert.match(html, /data-action="navigate" data-view="dashboard"/);
  assert.match(html, /Back to admin dashboard/);
});

test("Broadcast settings contains the microphone check and a back-to-broadcasts control", async () => {
  installAdminEnvironment();
  await selectTab("settings");
  const html = renderLiveAudioAdmin();
  assert.match(html, /Broadcast settings/);
  assert.match(html, /Microphone check before going live/);
  assert.match(html, /data-action="audio-admin-mic-test"/);
  assert.match(html, /data-action="audio-admin-back"/);
  assert.match(html, /Back to broadcasts/);
});

test("programme editor has a back button that returns to the broadcast list", async () => {
  installAdminEnvironment();
  await selectTab("programs");
  await handleLiveAudioAdminAction({ dataset: { action: "audio-admin-new" } });
  assert.match(renderLiveAudioAdmin(), /Back to broadcasts/);
  await handleLiveAudioAdminAction({ dataset: { action: "audio-admin-back" } });
  assert.match(renderLiveAudioAdmin(), /Back to admin dashboard/);
});
