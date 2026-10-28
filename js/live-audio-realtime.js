import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "../admin/config.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FALLBACK_AUDIO_ICE_SERVERS = Object.freeze([
  Object.freeze({ urls: "stun:stun.cloudflare.com:3478" }),
  Object.freeze({ urls: "stun:stun.l.google.com:19302" })
]);

function copyFallbackAudioIceServers() {
  return FALLBACK_AUDIO_ICE_SERVERS.map(server => ({ ...server }));
}

function isSupabaseBackendConfigured(url, key) {
  return typeof url === "string" &&
    /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url) &&
    typeof key === "string" &&
    /^sb_publishable_[A-Za-z0-9_-]+$/.test(key);
}

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
  return isSupabaseBackendConfigured(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}

export function normalizeLiveAudioTurnServers(iceServers) {
  if (!Array.isArray(iceServers)) return [];
  return iceServers.flatMap(server => {
    if (!server || typeof server !== "object" ||
        typeof server.username !== "string" || !server.username ||
        typeof server.credential !== "string" || !server.credential) return [];
    const urls = (Array.isArray(server.urls) ? server.urls : [server.urls])
      .filter(url => typeof url === "string" && /^turns?:/i.test(url));
    return urls.length
      ? [{ urls, username: server.username, credential: server.credential }]
      : [];
  });
}

export async function getLiveAudioIceServers(options) {
  const opts = options || {};
  const supabaseUrl = opts.supabaseUrl === undefined ? SUPABASE_URL : opts.supabaseUrl;
  const publishableKey = opts.publishableKey === undefined ? SUPABASE_PUBLISHABLE_KEY : opts.publishableKey;
  const fetcher = opts.fetcher || globalThis.fetch;
  const fallback = copyFallbackAudioIceServers();
  if (!isSupabaseBackendConfigured(supabaseUrl, publishableKey) ||
      typeof fetcher !== "function" ||
      !UUID_PATTERN.test(String(opts.programId || "")) ||
      !UUID_PATTERN.test(String(opts.sessionId || ""))) {
    return fallback;
  }

  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timeout = controller
    ? globalThis.setTimeout(() => controller.abort(), 4500)
    : null;
  try {
    const response = await fetcher(
      new URL("/functions/v1/turn-credentials", supabaseUrl).toString(),
      {
        method: "POST",
        cache: "no-store",
        headers: {
          apikey: publishableKey,
          authorization: "Bearer " + publishableKey,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          programId: opts.programId,
          sessionId: opts.sessionId
        }),
        signal: controller ? controller.signal : undefined
      }
    );
    if (!response.ok) return fallback;
    const payload = await response.json();
    const turnServers = normalizeLiveAudioTurnServers(payload && payload.iceServers);
    return turnServers.length ? fallback.concat(turnServers) : fallback;
  } catch (error) {
    return fallback;
  } finally {
    if (timeout !== null) globalThis.clearTimeout(timeout);
  }
}

export async function liveAudioRequest(path, options) {
  if (!isLiveAudioBackendConfigured() || typeof fetch !== "function") {
    throw new Error("Live Audio is not configured yet. Ask the administrator to finish the web audio setup.");
  }
  const opts = options || {};
  const normalizedPath = String(path).replace(/^\/+/, "");
  const endpoint = normalizedPath.startsWith("storage/v1/")
    ? normalizedPath
    : "rest/v1/" + normalizedPath;
  const headers = new Headers(opts.headers || {});
  headers.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  headers.set("authorization", "Bearer " + SUPABASE_PUBLISHABLE_KEY);
  headers.set("accept", "application/json");
  if (opts.body !== undefined) headers.set("content-type", "application/json");
  // Every REST call gets a hard timeout so a stalled request always settles
  // (into the network error card) instead of leaving the page loading forever.
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timeoutMs = Math.max(1000, Number(opts.timeoutMs) || 15000);
  let timer = null;
  const timedOut = new Promise((_, reject) => {
    timer = globalThis.setTimeout(() => {
      if (controller) controller.abort();
      reject(new Error("Live Audio could not reach the church service. Check the connection and try again."));
    }, timeoutMs);
  });
  try {
    const response = await Promise.race([
      fetch(SUPABASE_URL.replace(/\/+$/, "") + "/" + endpoint, {
        method: opts.method || "GET",
        cache: "no-store",
        headers,
        signal: controller ? controller.signal : undefined,
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body)
      }),
      timedOut
    ]);
    const text = await Promise.race([response.text(), timedOut]);
    return finishLiveAudioResponse(response, text);
  } finally {
    if (timer !== null) globalThis.clearTimeout(timer);
  }
}

function finishLiveAudioResponse(response, text) {
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

export async function createLiveAudioRecordingSignedUrl(recordingPath) {
  const parts = String(recordingPath || "").split("/");
  const isRecording = parts.length === 2 &&
    UUID_PATTERN.test(parts[0]) &&
    new RegExp("^" + UUID_PATTERN.source.slice(1, -1) + "\\.(webm|ogg|m4a)$", "i").test(parts[1]);
  const isSegment = parts.length === 4 &&
    UUID_PATTERN.test(parts[0]) &&
    UUID_PATTERN.test(parts[1]) &&
    parts[2] === "segments" &&
    /^[0-9]{6}\.(webm|ogg|m4a)$/i.test(parts[3]);
  if (!isRecording && !isSegment) return "";

  try {
    const response = await liveAudioRequest(
      "storage/v1/object/sign/live-audio-recordings/" + parts.map(encodeURIComponent).join("/"),
      { method: "POST", body: { expiresIn: 3600 } }
    );
    const signedPath = String(response && (response.signedURL || response.signedUrl) || "");
    if (!signedPath) return "";

    const base = SUPABASE_URL.replace(/\/+$/, "");
    const resolved = /^https?:\/\//i.test(signedPath)
      ? new URL(signedPath)
      : new URL(
        signedPath.startsWith("/storage/v1/")
          ? base + signedPath
          : base + "/storage/v1" + (signedPath.startsWith("/") ? signedPath : "/" + signedPath)
      );
    if (resolved.origin !== new URL(base).origin || resolved.protocol !== "https:") return "";
    return resolved.href;
  } catch (error) {
    return "";
  }
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
    const topic = "realtime:live-audio:" + programId;
    let ref = 0;
    let joined = false;
    let closed = false;
    let heartbeat = null;
    let reconnectTimer = null;
    let connectTimeout = null;
    let socket = null;
    let joinRef = "";
    let resolved = false;
    const callbacks = options || {};
    const baseReconnectDelay = Math.max(25, Number(callbacks.reconnectBaseDelayMs) || 1000);
    const maxReconnectDelay = Math.max(baseReconnectDelay, Number(callbacks.reconnectMaxDelayMs) || 30000);
    let reconnectDelay = baseReconnectDelay;

    const stopHeartbeat = () => {
      if (heartbeat) globalThis.clearInterval(heartbeat);
      heartbeat = null;
    };
    const cleanup = () => {
      if (closed) return;
      closed = true;
      joined = false;
      stopHeartbeat();
      if (reconnectTimer !== null) globalThis.clearTimeout(reconnectTimer);
      if (connectTimeout !== null) globalThis.clearTimeout(connectTimeout);
      reconnectTimer = null;
      connectTimeout = null;
      const currentSocket = socket;
      socket = null;
      if (currentSocket) {
        try { currentSocket.close(1000, "Live audio session closed"); } catch (error) {}
      }
    };

    const sendFrame = (event, payload, frameTopic) => {
      if (!joined || !socket || socket.readyState !== 1) return false;
      ref += 1;
      try {
        socket.send(JSON.stringify({
          topic: frameTopic || topic,
          event,
          payload: payload || {},
          ref: String(ref),
          join_ref: joinRef
        }));
        return true;
      } catch (error) {
        scheduleReconnect();
        return false;
      }
    };

    const scheduleReconnect = () => {
      if (closed || reconnectTimer !== null) return;
      joined = false;
      stopHeartbeat();
      if (callbacks.onStatus) callbacks.onStatus("reconnecting");
      const delay = reconnectDelay;
      reconnectDelay = Math.min(maxReconnectDelay, reconnectDelay * 2);
      reconnectTimer = globalThis.setTimeout(() => {
        reconnectTimer = null;
        openSocket();
      }, delay);
    };

    const channel = {
      send(signal) {
        if (closed || !joined) return false;
        return sendFrame("broadcast", { type: "broadcast", event: "rtc-signal", payload: signal });
      },
      close: cleanup,
      get closed() { return closed; },
      get connected() { return joined && !closed; }
    };

    const openSocket = () => {
      if (closed) return;
      let currentSocket;
      try {
        currentSocket = new WebSocketClass(signalEndpoint());
      } catch (error) {
        scheduleReconnect();
        return;
      }
      socket = currentSocket;
      currentSocket.addEventListener("open", () => {
        if (closed || socket !== currentSocket) return;
        ref += 1;
        joinRef = String(ref);
        try {
          currentSocket.send(JSON.stringify({
            topic,
            event: "phx_join",
            payload: {
              config: { broadcast: { ack: false, self: false }, presence: { key: "" }, private: false },
              access_token: SUPABASE_PUBLISHABLE_KEY
            },
            ref: joinRef,
            join_ref: joinRef
          }));
        } catch (error) {
          scheduleReconnect();
        }
      });
      currentSocket.addEventListener("message", event => {
        if (closed || socket !== currentSocket) return;
        let message;
        try { message = JSON.parse(event.data); } catch (error) { return; }
        if (message.topic === topic && message.event === "phx_reply" && message.ref === joinRef) {
          if (message.payload && message.payload.status === "ok") {
            joined = true;
            reconnectDelay = baseReconnectDelay;
            stopHeartbeat();
            heartbeat = globalThis.setInterval(() => sendFrame("heartbeat", {}, "phoenix"), 25000);
            if (callbacks.onStatus) callbacks.onStatus("connected");
            if (!resolved) {
              resolved = true;
              if (connectTimeout !== null) globalThis.clearTimeout(connectTimeout);
              connectTimeout = null;
              resolve(channel);
            }
          } else {
            joined = false;
            try { currentSocket.close(1011, "Live audio channel could not join"); } catch (error) {}
            scheduleReconnect();
          }
          return;
        }
        if (message.topic === topic && message.event === "broadcast" &&
            message.payload && message.payload.event === "rtc-signal" &&
            callbacks.onSignal) {
          callbacks.onSignal(message.payload.payload);
        }
        if (message.topic === topic && (message.event === "phx_error" || message.event === "phx_close")) {
          joined = false;
          try { currentSocket.close(1011, "Live audio signaling interrupted"); } catch (error) {}
          scheduleReconnect();
        }
      });
      currentSocket.addEventListener("error", () => {
        if (closed || socket !== currentSocket) return;
        joined = false;
        try { currentSocket.close(); } catch (error) {}
        scheduleReconnect();
      });
      currentSocket.addEventListener("close", () => {
        if (closed || socket !== currentSocket) return;
        joined = false;
        stopHeartbeat();
        scheduleReconnect();
      });
    };

    connectTimeout = globalThis.setTimeout(() => {
      if (resolved || closed) return;
      cleanup();
      reject(new Error("Live audio signaling could not connect. Check your internet connection and try again."));
    }, Math.max(1000, Number(callbacks.connectTimeoutMs) || 30000));

    openSocket();
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

export async function makeAudioPeerConnection(options) {
  const iceServers = await getLiveAudioIceServers(options);
  return new RTCPeerConnection({
    iceServers
  });
}


// Realtime reaction bursts. Subscribes to INSERTs on live_audio_reaction_bursts for one
// programme. Rows are delivered only while the programme is on air (RLS select policy).
// Returns { close() }. Callers keep their polling fallback running alongside this.
export function subscribeLiveAudioBursts(programId, callbacks) {
  if (!UUID_PATTERN.test(String(programId || "")) || !isLiveAudioBackendConfigured()) {
    return { close() {} };
  }
  const WebSocketClass = globalThis.WebSocket;
  if (!WebSocketClass) return { close() {} };
  const opts = callbacks || {};
  const topic = "realtime:live-audio-bursts:" + programId;
  let socket = null;
  let closed = false;
  let ref = 0;
  let joinRef = "";
  let heartbeat = null;
  let reconnectTimer = null;
  let delay = 1000;

  const send = (event, payload, frameTopic) => {
    if (!socket || socket.readyState !== 1) return;
    ref += 1;
    try {
      socket.send(JSON.stringify({ topic: frameTopic || topic, event, payload: payload || {}, ref: String(ref), join_ref: joinRef }));
    } catch (error) { /* socket will reconnect */ }
  };
  const stopHeartbeat = () => { if (heartbeat) globalThis.clearInterval(heartbeat); heartbeat = null; };
  const scheduleReconnect = () => {
    if (closed || reconnectTimer !== null) return;
    stopHeartbeat();
    reconnectTimer = globalThis.setTimeout(() => {
      reconnectTimer = null;
      open();
    }, delay);
    delay = Math.min(30000, delay * 2);
  };
  const open = () => {
    if (closed) return;
    let current;
    try { current = new WebSocketClass(signalEndpoint()); } catch (error) { scheduleReconnect(); return; }
    socket = current;
    current.addEventListener("open", () => {
      if (closed || socket !== current) return;
      ref += 1;
      joinRef = String(ref);
      current.send(JSON.stringify({
        topic,
        event: "phx_join",
        payload: {
          config: {
            broadcast: { ack: false, self: false },
            presence: { key: "" },
            private: false,
            postgres_changes: [{
              event: "INSERT",
              schema: "public",
              table: "live_audio_reaction_bursts",
              filter: "program_id=eq." + programId
            }]
          },
          access_token: SUPABASE_PUBLISHABLE_KEY
        },
        ref: joinRef,
        join_ref: joinRef
      }));
    });
    current.addEventListener("message", event => {
      if (closed || socket !== current) return;
      let message;
      try { message = JSON.parse(event.data); } catch (error) { return; }
      if (message.topic !== topic) return;
      if (message.event === "phx_reply" && message.ref === joinRef) {
        if (message.payload && message.payload.status === "ok") {
          delay = 1000;
          stopHeartbeat();
          heartbeat = globalThis.setInterval(() => send("heartbeat", {}, "phoenix"), 25000);
          if (opts.onStatus) opts.onStatus("connected");
        } else {
          try { current.close(1011, "burst channel could not join"); } catch (error) {}
          scheduleReconnect();
        }
        return;
      }
      if (message.event === "postgres_changes" && message.payload && message.payload.data) {
        const data = message.payload.data;
        if (data.type === "INSERT" && data.record && opts.onBurst) {
          opts.onBurst({
            id: Number(data.record.id) || 0,
            reaction: String(data.record.reaction || ""),
            visitorId: String(data.record.visitor_id || ""),
            createdAt: String(data.record.created_at || "")
          });
        }
      }
      if (message.event === "system" && message.payload && message.payload.status === "error") {
        try { current.close(1011, "burst channel error"); } catch (error) {}
      }
    });
    current.addEventListener("close", () => {
      if (closed || socket !== current) return;
      socket = null;
      if (opts.onStatus) opts.onStatus("reconnecting");
      scheduleReconnect();
    });
    current.addEventListener("error", () => {});
  };

  open();
  return {
    close() {
      if (closed) return;
      closed = true;
      stopHeartbeat();
      if (reconnectTimer !== null) globalThis.clearTimeout(reconnectTimer);
      reconnectTimer = null;
      const current = socket;
      socket = null;
      if (current) { try { current.close(1000, "bursts closed"); } catch (error) {} }
    }
  };
}
