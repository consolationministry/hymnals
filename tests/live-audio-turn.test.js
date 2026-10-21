import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getLiveAudioIceServers,
  normalizeLiveAudioTurnServers
} from "../js/live-audio-realtime.js";

const PROGRAM_ID = "11111111-1111-4111-8111-111111111111";
const SESSION_ID = "22222222-2222-4222-8222-222222222222";
const SUPABASE_URL = "https://example-project.supabase.co";
const PUBLISHABLE_KEY = "sb_publishable_test";

test("normalizes only authenticated TURN URLs from a credential response", () => {
  assert.deepEqual(normalizeLiveAudioTurnServers([
    { urls: ["stun:stun.cloudflare.com:3478", "turn:turn.example:3478?transport=udp"], username: "user", credential: "pass" },
    { urls: "turns:turn.example:443?transport=tcp", username: "user2", credential: "pass2" },
    { urls: "turn:turn.example:3478", username: "missing-credential" },
    { urls: "stun:stun.example:3478", username: "user", credential: "pass" }
  ]), [
    { urls: ["turn:turn.example:3478?transport=udp"], username: "user", credential: "pass" },
    { urls: ["turns:turn.example:443?transport=tcp"], username: "user2", credential: "pass2" }
  ]);
});

test("loads temporary TURN servers for the active broadcast while retaining STUN fallback", async () => {
  let requestUrl = "";
  let requestOptions;
  const iceServers = await getLiveAudioIceServers({
    supabaseUrl: SUPABASE_URL,
    publishableKey: PUBLISHABLE_KEY,
    programId: PROGRAM_ID,
    sessionId: SESSION_ID,
    fetcher: async (url, options) => {
      requestUrl = url;
      requestOptions = options;
      return {
        ok: true,
        async json() {
          return {
            iceServers: [
              { urls: "stun:stun.cloudflare.com:3478" },
              {
                urls: ["turn:turn.example:3478?transport=udp", "turns:turn.example:443?transport=tcp"],
                username: "temporary-user",
                credential: "temporary-password"
              }
            ]
          };
        }
      };
    }
  });

  assert.equal(requestUrl, SUPABASE_URL + "/functions/v1/turn-credentials");
  assert.equal(requestOptions.method, "POST");
  assert.equal(requestOptions.cache, "no-store");
  assert.equal(requestOptions.headers.apikey, PUBLISHABLE_KEY);
  assert.deepEqual(JSON.parse(requestOptions.body), { programId: PROGRAM_ID, sessionId: SESSION_ID });
  assert.deepEqual(iceServers, [
    { urls: "stun:stun.cloudflare.com:3478" },
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: ["turn:turn.example:3478?transport=udp", "turns:turn.example:443?transport=tcp"],
      username: "temporary-user",
      credential: "temporary-password"
    }
  ]);
});

test("falls back to STUN if TURN credentials are unavailable", async () => {
  const iceServers = await getLiveAudioIceServers({
    supabaseUrl: SUPABASE_URL,
    publishableKey: PUBLISHABLE_KEY,
    programId: PROGRAM_ID,
    sessionId: SESSION_ID,
    fetcher: async () => ({ ok: false, status: 503 })
  });

  assert.deepEqual(iceServers, [
    { urls: "stun:stun.cloudflare.com:3478" },
    { urls: "stun:stun.l.google.com:19302" }
  ]);
});

test("falls back to STUN if the TURN credential request fails", async () => {
  const iceServers = await getLiveAudioIceServers({
    supabaseUrl: SUPABASE_URL,
    publishableKey: PUBLISHABLE_KEY,
    programId: PROGRAM_ID,
    sessionId: SESSION_ID,
    fetcher: async () => { throw new Error("network unavailable"); }
  });

  assert.deepEqual(iceServers, [
    { urls: "stun:stun.cloudflare.com:3478" },
    { urls: "stun:stun.l.google.com:19302" }
  ]);
});
