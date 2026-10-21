import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { afterEach, test } from "node:test";
import { liveAudioReactionSelected } from "../js/live-audio-data.js";
import {
  loadPublicLiveAudioData,
  recordPublicLiveAudioListen,
  submitPublicLiveAudioComment,
  togglePublicLiveAudioReaction
} from "../js/live-audio-public-data.js";
import { renderLiveAudioListener, renderLiveAudioPage } from "../js/live-audio-views.js";

const PROGRAM_ID = "123e4567-e89b-42d3-a456-426614174000";
const SESSION_ID = "123e4567-e89b-42d3-a456-426614174001";
const VISITOR_ID = "123e4567-e89b-42d3-a456-426614174002";
const originalWindow = globalThis.window;
const originalFetch = globalThis.fetch;

afterEach(() => {
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
  if (originalFetch === undefined) delete globalThis.fetch;
  else globalThis.fetch = originalFetch;
});

function installBackend(options) {
  const opts = options || {};
  const calls = [];
  const values = new Map([["cerc-live-audio-visitor-v1", VISITOR_ID]]);
  let recordingSchemaRejected = false;
  globalThis.window = {
    localStorage: {
      getItem(key) { return values.has(key) ? values.get(key) : null; },
      setItem(key, value) { values.set(key, String(value)); }
    }
  };
  globalThis.fetch = async (input, options) => {
    const url = new URL(input);
    const body = options && options.body ? JSON.parse(options.body) : null;
    calls.push({ path: url.pathname, method: options && options.method || "GET", body });
    if (opts.missingRecordingColumns && !recordingSchemaRejected &&
        url.pathname.endsWith("/live_audio_programs") &&
        url.searchParams.get("select").includes("recording_path")) {
      recordingSchemaRejected = true;
      return {
        ok: false,
        status: 400,
        async text() { return JSON.stringify({ message: "column live_audio_programs.recording_path does not exist" }); }
      };
    }
    let payload = null;
    if (url.pathname.endsWith("/live_audio_programs")) {
      payload = [{
        id: PROGRAM_ID,
        title: "Sunday Service",
        description: "Worship together",
        speaker: "Pastor A",
        category: "Sunday Service",
        image_url: "https://example.org/cover.jpg",
        venue: "Main church",
        program_date: "2026-10-20",
        status: "published",
        is_live: opts.isLive === undefined ? true : opts.isLive,
        live_session_id: opts.isLive === false ? null : SESSION_ID,
        recording_path: opts.recordingPath || null,
        recording_duration_seconds: opts.recordingPath ? 42 : 0,
        created_at: "2026-10-20T10:00:00.000Z"
      }];
    } else if (url.pathname.includes("/storage/v1/object/sign/live-audio-recordings/")) {
      payload = { signedURL: "/object/sign/live-audio-recordings/" + opts.recordingPath + "?token=test-token" };
    } else if (url.pathname.endsWith("/rpc/get_live_audio_interactions")) {
      payload = [{
        program_id: PROGRAM_ID,
        love_count: 4,
        clap_count: 2,
        fire_count: 1,
        my_reactions: ["love"],
        comment_count: 1,
        listener_count: 3,
        comments: [{ id: "comment-1", body: "Amen!", created_at: "2026-10-20T10:05:00.000Z" }]
      }];
    } else if (url.pathname.endsWith("/rpc/submit_live_audio_comment")) {
      payload = [{ id: "comment-2", body: body.p_body, created_at: "2026-10-20T10:06:00.000Z" }];
    } else if (url.pathname.endsWith("/rpc/toggle_live_audio_reaction")) {
      payload = true;
    } else if (url.pathname.endsWith("/rpc/record_live_audio_listen")) {
      payload = null;
    }
    return {
      ok: true,
      status: 200,
      async text() { return payload == null ? "" : JSON.stringify(payload); }
    };
  };
  return calls;
}

test("public audio loads published Supabase programmes and shared listener interactions", async () => {
  const calls = installBackend();
  const data = await loadPublicLiveAudioData();
  const program = data.programs[0];

  assert.equal(program.title, "Sunday Service");
  assert.equal(program.onAir, true);
  assert.equal(program.liveSessionId, SESSION_ID);
  assert.equal(program.streamUrl, "");
  assert.equal(program.listenCount, 3);
  assert.deepEqual(data.reactions[PROGRAM_ID], { love: 4, clap: 2, fire: 1 });
  assert.equal(liveAudioReactionSelected(data, PROGRAM_ID, "love"), true);
  assert.deepEqual(data.comments.map(comment => comment.body), ["Amen!"]);
  assert.deepEqual(calls[1].body, { p_program_ids: [PROGRAM_ID], p_visitor_id: VISITOR_ID });

  assert.match(renderLiveAudioPage(data, "", ""), /Listen now/);
  const listener = renderLiveAudioListener(data, PROGRAM_ID);
  assert.match(listener, /<audio[^>]*autoplay playsinline[^>]*data-live-audio-player/);
  assert.doesNotMatch(listener, /<audio[^>]*\scontrols(?:\s|>|=)/);
  assert.match(listener, /data-audio-waveform="live"/);
  assert.match(listener, /data-action="toggle-audio-playback" data-player-type="live"/);
  assert.match(listener, /data-action="toggle-audio-mute" data-player-type="live"/);
  assert.doesNotMatch(listener, /data-action="connect-live-audio"|data-action="disconnect-live-audio"|Stop listening/);
  assert.match(listener, /Amen!/);
  assert.match(listener, /shared with other listeners/);
  assert.match(listener, /audio-listener-header/);
  assert.match(listener, /Live Comments/);
  assert.match(listener, /data-action="share-live-audio"/);
  assert.match(listener, /3 watching/);
});

test("public audio interactions call the anonymous RPCs with validated payloads", async () => {
  const calls = installBackend();
  await togglePublicLiveAudioReaction(PROGRAM_ID, "clap");
  await submitPublicLiveAudioComment(PROGRAM_ID, "  Welcome!  ");
  await recordPublicLiveAudioListen(PROGRAM_ID, SESSION_ID);

  assert.equal(calls[0].path.endsWith("/rpc/toggle_live_audio_reaction"), true);
  assert.deepEqual(calls[0].body, { p_program_id: PROGRAM_ID, p_visitor_id: VISITOR_ID, p_reaction: "clap" });
  assert.deepEqual(calls[1].body, { p_program_id: PROGRAM_ID, p_visitor_id: VISITOR_ID, p_body: "Welcome!" });
  assert.deepEqual(calls[2].body, { p_program_id: PROGRAM_ID, p_visitor_id: VISITOR_ID, p_session_id: SESSION_ID });

  const callCount = calls.length;
  await assert.rejects(submitPublicLiveAudioComment(PROGRAM_ID, " "), /Write a comment/);
  await assert.rejects(togglePublicLiveAudioReaction(PROGRAM_ID, "unknown"), /supported reaction/);
  await assert.rejects(recordPublicLiveAudioListen("not-a-uuid", SESSION_ID), /identified/);
  assert.equal(calls.length, callCount);
});

test("published recordings get temporary public playback URLs and an archive player", async () => {
  const recordingPath = PROGRAM_ID + "/" + SESSION_ID + ".webm";
  const calls = installBackend({ recordingPath, isLive: false });
  const data = await loadPublicLiveAudioData();
  const program = data.programs[0];

  assert.equal(program.recordingPath, recordingPath);
  assert.match(program.recordingUrl, /^https:\/\/.+\/storage\/v1\/object\/sign\/live-audio-recordings\//);
  assert.match(program.recordingUrl, /token=test-token/);
  assert.deepEqual(calls[1].body, { expiresIn: 3600 });
  assert.match(renderLiveAudioPage(data, "", ""), /Play recording/);
  const listener = renderLiveAudioListener(data, PROGRAM_ID);
  assert.match(listener, /data-recorded-audio-player/);
  assert.match(listener, /src="https:\/\/.+token=test-token/);
  assert.match(listener, /data-audio-seek="recorded"/);
  assert.match(listener, /data-audio-current-time="recorded"/);
  assert.match(listener, /data-audio-duration="recorded"/);
  assert.match(listener, /data-audio-waveform="recorded"/);
  assert.doesNotMatch(listener, /<audio[^>]*\scontrols(?:\s|>|=)/);
  assert.doesNotMatch(listener, /data-action="connect-live-audio"/);
});

test("live audio remains available before the recording migration is applied", async () => {
  const calls = installBackend({ missingRecordingColumns: true });
  const data = await loadPublicLiveAudioData();

  assert.equal(data.programs[0].title, "Sunday Service");
  assert.equal(data.programs[0].recordingUrl, "");
  assert.equal(calls[0].path.endsWith("/live_audio_programs"), true);
  assert.equal(calls[1].path.endsWith("/live_audio_programs"), true);
});

test("published live audio and listener interactions are granted to anonymous visitors", async () => {
  const migration = await readFile(new URL("../supabase/migrations/202610200001_live_audio.sql", import.meta.url), "utf8");
  const recordingsMigration = await readFile(new URL("../supabase/migrations/202610210001_live_audio_recordings.sql", import.meta.url), "utf8");
  const publicClient = await readFile(new URL("../js/live-audio-public-data.js", import.meta.url), "utf8");

  assert.match(migration, /create policy live_audio_programs_public_read on public\.live_audio_programs\s+for select to anon, authenticated using \(status = 'published'\)/);
  assert.match(migration, /grant execute on function public\.get_live_audio_interactions\(uuid\[\], uuid\) to anon, authenticated/);
  assert.match(migration, /grant execute on function public\.record_live_audio_listen\(uuid, uuid, uuid\) to anon, authenticated/);
  assert.match(recordingsMigration, /values \(\s*'live-audio-recordings',\s*'live-audio-recordings',\s*false,/);
  assert.match(recordingsMigration, /create policy live_audio_recordings_published_read on storage\.objects\s+for select to anon, authenticated/);
  assert.match(recordingsMigration, /p\.recording_path = name\s+and p\.status = 'published'/);
  assert.doesNotMatch(publicClient, /initializeAdminAuth|loginAdmin|requireAdmin/i);
});
