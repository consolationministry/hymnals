import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "../admin/config.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createLiveAudioId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === "function") globalThis.crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join("-");
}

export function getLiveAudioVisitorId() {
  const key = "cerc-live-audio-visitor-v1";
  try {
    const stored = window.localStorage.getItem(key);
    if (stored && UUID_PATTERN.test(stored)) return stored;
    const created = createLiveAudioId();
    window.localStorage.setItem(key, created);
    return created;
  } catch (error) {
    return createLiveAudioId();
  }
}

export function isLiveAudioBackendConfigured() {
  return typeof SUPABASE_URL === "string" &&
    /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(SUPABASE_URL) &&
    typeof SUPABASE_PUBLISHABLE_KEY === "string" &&
    /^sb_publishable_[A-Za-z0-9_-]+$/.test(SUPABASE_PUBLISHABLE_KEY);
}

export async function liveAudioRequest(path, options) {
  if (!isLiveAudioBackendConfigured() || typeof fetch !== "function") {
    throw new Error("Live Audio is not configured yet. Ask the administrator to finish the web audio setup.");
  }
  const opts = options || {};
  const headers = new Headers(opts.headers || {});
  headers.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  headers.set("authorization", "Bearer " + SUPABASE_PUBLISHABLE_KEY);
  headers.set("accept", "application/json");
  if (opts.body !== undefined) headers.set("content-type", "application/json");
  const response = await fetch(SUPABASE_URL.replace(/\/+$/, "") + "/rest/v1/" + String(path).replace(/^\/+/, ""), {
    method: opts.method || "GET",
    cache: "no-store",
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body)
  });
  const text = await response.text();
  let payload = null;
  if (text) {
    try { payload = JSON.parse(text); } catch (error) { payload = text; }
  }
  if (!response.ok) {
    const details = payload && (payload.message || payload.msg);
    if (response.status === 404 || (payload && /live_audio_/i.test(JSON.stringify(payload)) && /schema cache|does not exist/i.test(JSON.stringify(payload)))) {
      throw new Error("Live Audio setup is not finished. Apply the new live-audio SQL migration, then refresh.");
    }
    throw new Error(typeof details === "string" ? details : "Live Audio could not reach the church service. Check the connection and try again.");
  }
  return payload;
}

function signalEndpoint() {
  const base = new URL(SUPABASE_URL);
  base.protocol = base.protocol === "https:" ? "wss:" : "ws:";
  base.pathname = "/realtime/v1/websocket";
  base.search = new URLSearchParams({ apikey: SUPABASE_PUBLISHABLE_KEY, vsn: "1.0.0" }).toString();
  return base.toString();
}

export function connectLiveAudioChannel(programId, sessionId, options) {
  if (!UUID_PATTERN.test(String(programId || "")) || !UUID_PATTERN.test(String(sessionId || ""))) {
    return Promise.reject(new Error("This broadcast session is invalid. Refresh the Listen page."));
  }
  if (!isLiveAudioBackendConfigured()) {
    return Promise.reject(new Error("Live Audio is not configured yet. Ask the administrator to finish the web audio setup."));
  }
  const WebSocketClass = (options && options.WebSocket) || globalThis.WebSocket;
  if (!WebSocketClass) return Promise.reject(new Error("This browser does not support live audio connections."));

  return new Promise((resolve, reject) => {
    let socket;
    try { socket = new WebSocketClass(signalEndpoint()); }
    catch (error) { reject(new Error("Could not open the live audio signaling connection.")); return; }
    const topic = "realtime:live-audio:" + programId;
    let ref = 0;
    let joined = false;
    let closed = false;
    let heartbeat = null;
    const callbacks = options || {};
    const sendFrame = (event, payload, frameTopic) => {
      if (socket.readyState !== 1) return false;
      ref += 1;
      socket.send(JSON.stringify({
        topic: frameTopic || topic,
        event,
        payload: payload || {},
        ref: String(ref),
        join_ref: "1"
      }));
      return true;
    };
    const cleanup = () => {
      if (heartbeat) globalThis.clearInterval(heartbeat);
      heartbeat = null;
      if (!closed) {
        closed = true;
        try { socket.close(1000, "Live audio session closed"); } catch (error) {}
      }
    };
    socket.addEventListener("open", () => {
      ref += 1;
      socket.send(JSON.stringify({
        topic,
        event: "phx_join",
        payload: {
          config: { broadcast: { ack: false, self: false }, presence: { key: "" }, private: false },
          access_token: SUPABASE_PUBLISHABLE_KEY
        },
        ref: String(ref),
        join_ref: String(ref)
      }));
    });
    socket.addEventListener("message", event => {
      let message;
      try { message = JSON.parse(event.data); } catch (error) { return; }
      if (message.topic === topic && message.event === "phx_reply") {
        if (message.payload && message.payload.status === "ok") {
          joined = true;
          heartbeat = globalThis.setInterval(() => sendFrame("heartbeat", {}, "phoenix"), 25000);
          if (callbacks.onStatus) callbacks.onStatus("connected");
          resolve({
            send(signal) {
              if (!joined || closed) return false;
              return sendFrame("broadcast", { type: "broadcast", event: "rtc-signal", payload: signal });
            },
            close: cleanup,
            get closed() { return closed; }
          });
        } else if (!joined) {
          cleanup();
          reject(new Error("The live audio signaling room rejected this connection."));
        }
        return;
      }
      if (message.topic === topic && message.event === "broadcast" &&
          message.payload && message.payload.event === "rtc-signal" &&
          callbacks.onSignal) {
        callbacks.onSignal(message.payload.payload);
      }
      if (message.topic === topic && (message.event === "phx_error" || message.event === "phx_close")) {
        if (callbacks.onStatus) callbacks.onStatus("disconnected");
      }
    });
    socket.addEventListener("error", () => {
      if (callbacks.onStatus) callbacks.onStatus("disconnected");
      if (!joined) {
        cleanup();
        reject(new Error("Live audio signaling could not connect. Check your internet connection."));
      }
    });
    socket.addEventListener("close", () => {
      if (heartbeat) globalThis.clearInterval(heartbeat);
      heartbeat = null;
      if (callbacks.onStatus) callbacks.onStatus("disconnected");
      if (!joined && !closed) reject(new Error("The live audio signaling connection closed before joining."));
    });
  });
}

export function waitForIceGatheringComplete(peer, timeoutMs) {
  if (peer.iceGatheringState === "complete") return Promise.resolve();
  return new Promise(resolve => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      peer.removeEventListener("icegatheringstatechange", onState);
      resolve();
    };
    const onState = () => { if (peer.iceGatheringState === "complete") finish(); };
    const timeout = setTimeout(finish, timeoutMs || 8000);
    peer.addEventListener("icegatheringstatechange", onState);
  });
}

export function makeAudioPeerConnection() {
  return new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.cloudflare.com:3478" },
      { urls: "stun:stun.l.google.com:19302" }
    ]
  });
}
