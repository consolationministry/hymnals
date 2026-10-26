import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  parseCloudinaryLiveAudioReference
} from "../js/cloudinary-live-audio.js";
import {
  renderCloudinarySettingsPanel,
  saveCloudinarySettings
} from "../admin/js/cloudinary-settings.js";

const PROGRAM_ID = "123e4567-e89b-42d3-a456-426614174000";
const SESSION_ID = "123e4567-e89b-42d3-a456-426614174001";

function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() { return body === null ? "" : JSON.stringify(body); }
  };
}

test("Cloudinary audio references validate recording and segment identifiers", () => {
  const recording = parseCloudinaryLiveAudioReference(
    "cloudinary:video:authenticated:live-audio/" + PROGRAM_ID + "/" + SESSION_ID + "/recording:webm"
  );
  assert.deepEqual(recording, {
    publicId: "live-audio/" + PROGRAM_ID + "/" + SESSION_ID + "/recording",
    programId: PROGRAM_ID,
    sessionId: SESSION_ID,
    kind: "recording",
    segmentIndex: null,
    format: "webm"
  });

  const segment = parseCloudinaryLiveAudioReference(
    "cloudinary:video:authenticated:live-audio/" + PROGRAM_ID + "/" + SESSION_ID + "/segments/000012:ogg"
  );
  assert.equal(segment.kind, "segment");
  assert.equal(segment.segmentIndex, 12);
  assert.equal(segment.format, "ogg");
  assert.equal(parseCloudinaryLiveAudioReference("https://evil.example/audio.webm"), null);
  assert.equal(parseCloudinaryLiveAudioReference(
    "cloudinary:video:authenticated:live-audio/not-a-uuid/" + SESSION_ID + "/recording:webm"
  ), null);
});

test("Cloudinary admin settings never prefill or render saved API secrets", () => {
  const html = renderCloudinarySettingsPanel({
    available: true,
    configured: true,
    cloudName: "test-cloud"
  });
  assert.match(html, /Cloudinary audio storage/);
  assert.match(html, /Connected to Cloudinary · test-cloud/);
  assert.match(html, /id="cloudinary-api-key"[^>]*type="password"/);
  assert.match(html, /id="cloudinary-api-secret"[^>]*type="password"/);
  assert.match(html, /Leave the API key and secret blank to keep the current credentials/);
  assert.doesNotMatch(html, /id="cloudinary-api-secret"[^>]*value=/);
});

test("Cloudinary settings reject partial replacement credentials before making a request", async () => {
  await assert.rejects(
    saveCloudinarySettings({ cloudName: "test-cloud", apiKey: "123456", apiSecret: "" }),
    /Enter both the Cloudinary API key and API secret/
  );
});

test("Cloudinary settings save only succeeds after Supabase confirms the saved account", async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  const requests = [];
  globalThis.window = {
    localStorage: {
      getItem() { return null; },
      setItem() {},
      removeItem() {}
    }
  };
  globalThis.fetch = async function (url, init) {
    requests.push({ url: String(url), method: init.method, body: JSON.parse(init.body) });
    return response({ configured: true, cloudName: "test-cloud" });
  };

  try {
    const result = await saveCloudinarySettings({
      cloudName: "test-cloud",
      apiKey: "test-api-key",
      apiSecret: "test-api-secret"
    });
    assert.deepEqual(result, { configured: true, cloudName: "test-cloud" });
    assert.match(requests[0].url, /\/functions\/v1\/cloudinary-live-audio$/);
    assert.equal(requests[0].method, "POST");
    assert.deepEqual(requests[0].body, {
      action: "save-config",
      cloudName: "test-cloud",
      apiKey: "test-api-key",
      apiSecret: "test-api-secret"
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
});

test("Cloudinary settings reject a response that does not confirm persistence", async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  globalThis.window = {
    localStorage: {
      getItem() { return null; },
      setItem() {},
      removeItem() {}
    }
  };
  globalThis.fetch = async function () {
    return response({ configured: false, cloudName: "" });
  };

  try {
    await assert.rejects(
      saveCloudinarySettings({ cloudName: "test-cloud", apiKey: "test-api-key", apiSecret: "test-api-secret" }),
      /Supabase did not confirm that the Cloudinary settings were stored/
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
});

test("Cloudinary secrets are service-role-only and playback signing stays server-side", async () => {
  const migration = await readFile(new URL("../supabase/migrations/202610250003_cloudinary_live_audio.sql", import.meta.url), "utf8");
  const functionSource = await readFile(new URL("../supabase/functions/cloudinary-live-audio/index.ts", import.meta.url), "utf8");
  const config = await readFile(new URL("../supabase/config.toml", import.meta.url), "utf8");
  const publicClient = await readFile(new URL("../js/cloudinary-live-audio.js", import.meta.url), "utf8");

  assert.match(migration, /alter table public\.cloudinary_credentials enable row level security/);
  assert.match(migration, /revoke all on public\.cloudinary_credentials from public, anon, authenticated/);
  assert.match(migration, /grant all on public\.cloudinary_credentials to service_role/);
  assert.match(functionSource, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(functionSource, /api_secret/);
  assert.match(functionSource, /resolution=merge-duplicates,return=representation/);
  assert.match(functionSource, /Supabase did not confirm that the Cloudinary credentials were stored/);
  assert.match(functionSource, /error instanceof SafeCloudinaryError/);
  assert.doesNotMatch(functionSource, /jsonResponse\(\{ error: error\.message/);
  assert.match(functionSource, /action === "resolve-playback-url"/);
  assert.match(functionSource, /status: "eq\.published"/);
  assert.doesNotMatch(publicClient, /api_secret|apiSecret/);
  assert.match(config, /\[functions\.cloudinary-live-audio\]\s+verify_jwt = false/);
});
