import assert from "node:assert/strict";
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

function installBackend() {
  const calls = [];
  const values = new Map([["cerc-live-audio-visitor-v1", VISITOR_ID]]);
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
        is_live: true,
        live_session_id: SESSION_ID,
        created_at: "2026-10-20T10:00:00.000Z"
      }];
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
  assert.match(listener, /data-live-audio-player/);
  assert.match(listener, /data-action="connect-live-audio"/);
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
