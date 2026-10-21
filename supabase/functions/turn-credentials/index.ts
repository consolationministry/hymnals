const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TURN_CREDENTIAL_TTL_SECONDS = 21600;
const DEFAULT_ALLOWED_ORIGINS = [
  "https://consolationministry.github.io",
  "https://localhost",
  "capacitor://localhost"
];

function getAllowedOrigins() {
  const configured = Deno.env.get("TURN_ALLOWED_ORIGINS");
  const origins = configured
    ? configured.split(",").map(origin => origin.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;
  return new Set(origins);
}

function responseHeaders(origin) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "apikey, authorization, content-type, x-client-info",
    "cache-control": "no-store",
    "content-type": "application/json",
    "vary": "Origin"
  };
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(origin)
  });
}

function getPublishableKey() {
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}");
    if (typeof keys.default === "string" && keys.default) return keys.default;
  } catch (error) {
    // Fall through to the legacy single-key environment variables.
  }
  return Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ||
    Deno.env.get("SUPABASE_ANON_KEY") ||
    "";
}

async function isActivePublishedSession(supabaseUrl, publishableKey, programId, sessionId) {
  const endpoint = new URL("/rest/v1/live_audio_programs", supabaseUrl);
  endpoint.search = new URLSearchParams({
    select: "id",
    id: "eq." + programId,
    live_session_id: "eq." + sessionId,
    is_live: "eq.true",
    status: "eq.published",
    limit: "1"
  }).toString();
  const response = await fetch(endpoint, {
    method: "GET",
    cache: "no-store",
    headers: {
      apikey: publishableKey,
      authorization: "Bearer " + publishableKey,
      accept: "application/json"
    }
  });
  if (!response.ok) throw new Error("The active broadcast could not be verified.");
  const rows = await response.json();
  return Array.isArray(rows) && rows.some(row => row && row.id === programId);
}

function normalizeTurnServers(iceServers) {
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

Deno.serve(async request => {
  const origin = request.headers.get("origin") || "";
  if (!origin || !getAllowedOrigins().has(origin)) {
    return new Response("Origin not allowed.", { status: 403 });
  }
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: responseHeaders(origin) });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return jsonResponse({ error: "A valid broadcast session is required." }, 400, origin);
  }
  const programId = String(body && body.programId || "");
  const sessionId = String(body && body.sessionId || "");
  if (!UUID_PATTERN.test(programId) || !UUID_PATTERN.test(sessionId)) {
    return jsonResponse({ error: "A valid broadcast session is required." }, 400, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const publishableKey = getPublishableKey();
  const turnKeyId = Deno.env.get("CLOUDFLARE_TURN_KEY_ID") || "";
  const turnApiToken = Deno.env.get("CLOUDFLARE_TURN_API_TOKEN") || "";
  if (!supabaseUrl || !publishableKey || !turnKeyId || !turnApiToken) {
    return jsonResponse({ error: "TURN relay is not configured." }, 503, origin);
  }

  try {
    const active = await isActivePublishedSession(supabaseUrl, publishableKey, programId, sessionId);
    if (!active) return jsonResponse({ error: "This broadcast is no longer live." }, 403, origin);

    const upstream = await fetch(
      "https://rtc.live.cloudflare.com/v1/turn/keys/" +
        encodeURIComponent(turnKeyId) +
        "/credentials/generate-ice-servers",
      {
        method: "POST",
        headers: {
          authorization: "Bearer " + turnApiToken,
          "content-type": "application/json"
        },
        body: JSON.stringify({ ttl: TURN_CREDENTIAL_TTL_SECONDS })
      }
    );
    if (!upstream.ok) {
      return jsonResponse({ error: "TURN relay credentials could not be issued." }, 502, origin);
    }
    const payload = await upstream.json();
    const iceServers = normalizeTurnServers(payload && payload.iceServers);
    if (!iceServers.length) {
      return jsonResponse({ error: "TURN relay credentials were not returned." }, 502, origin);
    }
    return jsonResponse({ iceServers }, 200, origin);
  } catch (error) {
    return jsonResponse({ error: "TURN relay credentials could not be issued." }, 502, origin);
  }
});
