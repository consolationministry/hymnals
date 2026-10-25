const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FORMAT_PATTERN = /^(webm|ogg|m4a)$/;
const DEFAULT_ALLOWED_ORIGINS = [
  "https://consolationministry.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://localhost",
  "capacitor://localhost"
];

type CloudinaryConfig = {
  cloud_name: string;
  api_key: string;
  api_secret: string;
};

function getAllowedOrigins() {
  const configured = Deno.env.get("CLOUDINARY_ALLOWED_ORIGINS");
  const origins = configured
    ? configured.split(",").map(origin => origin.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;
  return new Set(origins);
}

function responseHeaders(origin: string) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "apikey, authorization, content-type, x-client-info",
    "cache-control": "no-store",
    "content-type": "application/json",
    "vary": "Origin"
  };
}

function jsonResponse(body: unknown, status: number, origin: string) {
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

function getSupabaseEnvironment() {
  return {
    url: (Deno.env.get("SUPABASE_URL") || "").replace(/\/+$/, ""),
    publishableKey: getPublishableKey(),
    serviceRoleKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
  };
}

function parseJson(value: string) {
  try { return JSON.parse(value); }
  catch (error) { return null; }
}

async function verifyAdmin(
  supabaseUrl: string,
  publishableKey: string,
  authorization: string
) {
  if (!/^Bearer\s+\S+$/i.test(authorization)) return false;
  const response = await fetch(new URL("/rest/v1/rpc/is_admin", supabaseUrl), {
    method: "POST",
    cache: "no-store",
    headers: {
      apikey: publishableKey,
      authorization,
      "content-type": "application/json"
    },
    body: "{}"
  });
  if (!response.ok) return false;
  return await response.json() === true;
}

function serviceHeaders(serviceRoleKey: string, includeJson = false) {
  const headers = new Headers({
    apikey: serviceRoleKey,
    authorization: "Bearer " + serviceRoleKey,
    accept: "application/json"
  });
  if (includeJson) headers.set("content-type", "application/json");
  return headers;
}

async function getCloudinaryConfig(supabaseUrl: string, serviceRoleKey: string) {
  const endpoint = new URL("/rest/v1/cloudinary_credentials", supabaseUrl);
  endpoint.search = new URLSearchParams({
    select: "cloud_name,api_key,api_secret",
    id: "eq.global",
    limit: "1"
  }).toString();
  const response = await fetch(endpoint, {
    method: "GET",
    cache: "no-store",
    headers: serviceHeaders(serviceRoleKey)
  });
  if (!response.ok) throw new Error("Cloudinary settings are not available.");
  const rows = await response.json();
  return Array.isArray(rows) && rows.length ? rows[0] as CloudinaryConfig : null;
}

async function saveCloudinaryConfig(
  supabaseUrl: string,
  serviceRoleKey: string,
  config: CloudinaryConfig
) {
  const endpoint = new URL("/rest/v1/cloudinary_credentials?on_conflict=id", supabaseUrl);
  const response = await fetch(endpoint, {
    method: "POST",
    cache: "no-store",
    headers: new Headers({
      ...Object.fromEntries(serviceHeaders(serviceRoleKey, true)),
      prefer: "resolution=merge-duplicates,return=minimal"
    }),
    body: JSON.stringify({ id: "global", ...config, updated_at: new Date().toISOString() })
  });
  if (!response.ok) throw new Error("Cloudinary settings could not be saved.");
}

async function removeCloudinaryConfig(supabaseUrl: string, serviceRoleKey: string) {
  const endpoint = new URL("/rest/v1/cloudinary_credentials", supabaseUrl);
  endpoint.search = new URLSearchParams({ id: "eq.global" }).toString();
  const response = await fetch(endpoint, {
    method: "DELETE",
    cache: "no-store",
    headers: serviceHeaders(serviceRoleKey)
  });
  if (!response.ok) throw new Error("Cloudinary settings could not be removed.");
}

function validCloudName(value: string) {
  return /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(value);
}

function encodeBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function sha1Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

async function cloudinaryUploadSignature(
  config: CloudinaryConfig,
  publicId: string,
  timestamp: number
) {
  const params = {
    overwrite: "true",
    public_id: publicId,
    timestamp: String(timestamp),
    type: "authenticated"
  };
  const toSign = Object.keys(params)
    .sort()
    .map(key => key + "=" + params[key as keyof typeof params])
    .join("&") + config.api_secret;
  return {
    ...params,
    signature: await sha1Hex(toSign),
    cloudName: config.cloud_name,
    apiKey: config.api_key
  };
}

async function cloudinaryDeliverySignature(
  config: CloudinaryConfig,
  publicId: string,
  format: string
) {
  const digest = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(publicId + "." + format + config.api_secret)
  );
  return encodeBase64Url(new Uint8Array(digest)).slice(0, 8);
}

function cloudinaryReference(publicId: string, format: string) {
  return "cloudinary:video:authenticated:" + publicId + ":" + format;
}

async function verifyCloudinaryCredentials(config: CloudinaryConfig) {
  const credentials = btoa(config.api_key + ":" + config.api_secret);
  let response: Response;
  try {
    response = await fetch(
      "https://api.cloudinary.com/v1_1/" + encodeURIComponent(config.cloud_name) + "/usage",
      { method: "GET", cache: "no-store", headers: { authorization: "Basic " + credentials } }
    );
  } catch (error) {
    throw new Error("Cloudinary could not be reached. Check the connection and try again.");
  }
  if (!response.ok) {
    throw new Error("Cloudinary rejected those credentials. Check the cloud name, API key and API secret.");
  }
}

async function queryRows(url: URL, publishableKey: string) {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      apikey: publishableKey,
      authorization: "Bearer " + publishableKey,
      accept: "application/json"
    }
  });
  if (!response.ok) return [];
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

function validAudioIds(programId: string, sessionId: string) {
  return UUID_PATTERN.test(programId) && UUID_PATTERN.test(sessionId);
}

function expectedAsset(kind: string, programId: string, sessionId: string, segmentIndex: number | null) {
  if (kind === "recording") {
    return { publicId: "live-audio/" + programId + "/" + sessionId + "/recording", kind };
  }
  if (kind === "segment" && Number.isInteger(segmentIndex) &&
      (segmentIndex as number) >= 0 && (segmentIndex as number) < 1000000) {
    return {
      publicId: "live-audio/" + programId + "/" + sessionId + "/segments/" +
        String(segmentIndex).padStart(6, "0"),
      kind
    };
  }
  return null;
}

async function isPublishedAsset(
  supabaseUrl: string,
  publishableKey: string,
  programId: string,
  sessionId: string,
  kind: string,
  segmentIndex: number | null,
  format: string
) {
  const expected = expectedAsset(kind, programId, sessionId, segmentIndex);
  if (!expected || !FORMAT_PATTERN.test(format)) return false;
  const expectedReference = cloudinaryReference(expected.publicId, format);
  const programUrl = new URL("/rest/v1/live_audio_programs", supabaseUrl);
  const programQuery: Record<string, string> = {
    select: kind === "recording" ? "id,recording_path" : "id",
    id: "eq." + programId,
    status: "eq.published",
    limit: "1"
  };
  if (kind === "segment") {
    programQuery.is_live = "eq.true";
    programQuery.live_session_id = "eq." + sessionId;
  }
  programUrl.search = new URLSearchParams(programQuery).toString();
  const programs = await queryRows(programUrl, publishableKey);
  if (!programs.length) return false;
  if (kind === "recording") return programs[0].recording_path === expectedReference;

  const segmentUrl = new URL("/rest/v1/live_audio_segments", supabaseUrl);
  segmentUrl.search = new URLSearchParams({
    select: "storage_path",
    program_id: "eq." + programId,
    session_id: "eq." + sessionId,
    segment_index: "eq." + segmentIndex,
    limit: "1"
  }).toString();
  const segments = await queryRows(segmentUrl, publishableKey);
  return segments.some(segment => segment.storage_path === expectedReference);
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

  const { url: supabaseUrl, publishableKey, serviceRoleKey } = getSupabaseEnvironment();
  if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
    return jsonResponse({ error: "Cloudinary audio storage is not configured." }, 503, origin);
  }
  const body = parseJson(await request.text()) || {};
  const action = String(body.action || "");
  const publicAction = action === "resolve-playback-url";
  if (!publicAction) {
    const authorized = await verifyAdmin(
      supabaseUrl,
      publishableKey,
      request.headers.get("authorization") || ""
    ).catch(() => false);
    if (!authorized) return jsonResponse({ error: "Administrator access is required." }, 403, origin);
  }

  try {
    if (action === "get-config") {
      const config = await getCloudinaryConfig(supabaseUrl, serviceRoleKey);
      return jsonResponse({
        configured: Boolean(config),
        cloudName: config ? config.cloud_name : ""
      }, 200, origin);
    }

    if (action === "save-config") {
      const cloudName = String(body.cloudName || "").trim();
      const apiKey = String(body.apiKey || "").trim();
      const apiSecret = String(body.apiSecret || "").trim();
      if (!validCloudName(cloudName)) {
        return jsonResponse({ error: "Enter a valid Cloudinary cloud name." }, 400, origin);
      }
      const current = await getCloudinaryConfig(supabaseUrl, serviceRoleKey);
      if (!apiKey && !apiSecret && current && current.cloud_name === cloudName) {
        return jsonResponse({ configured: true, cloudName }, 200, origin);
      }
      if (!apiKey || !apiSecret || apiKey.length > 128 || apiSecret.length > 256 ||
          /[\r\n]/.test(apiKey) || /[\r\n]/.test(apiSecret)) {
        return jsonResponse({ error: "Enter both the Cloudinary API key and API secret." }, 400, origin);
      }
      const config = { cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret };
      await verifyCloudinaryCredentials(config);
      await saveCloudinaryConfig(supabaseUrl, serviceRoleKey, config);
      return jsonResponse({ configured: true, cloudName }, 200, origin);
    }

    if (action === "remove-config") {
      await removeCloudinaryConfig(supabaseUrl, serviceRoleKey);
      return jsonResponse({ configured: false, cloudName: "" }, 200, origin);
    }

    if (action === "sign-upload") {
      const programId = String(body.programId || "");
      const sessionId = String(body.sessionId || "");
      const kind = String(body.kind || "");
      const format = String(body.format || "").toLowerCase();
      const segmentIndex = body.segmentIndex == null ? null : Number(body.segmentIndex);
      const expected = expectedAsset(kind, programId, sessionId, segmentIndex);
      if (!validAudioIds(programId, sessionId) || !expected || !FORMAT_PATTERN.test(format)) {
        return jsonResponse({ error: "A valid audio recording is required." }, 400, origin);
      }
      const config = await getCloudinaryConfig(supabaseUrl, serviceRoleKey);
      if (!config) return jsonResponse({ error: "Connect Cloudinary in Admin Settings before recording audio." }, 503, origin);
      const timestamp = Math.floor(Date.now() / 1000);
      const signed = await cloudinaryUploadSignature(config, expected.publicId, timestamp);
      return jsonResponse({
        ...signed,
        kind,
        format,
        assetReference: cloudinaryReference(expected.publicId, format)
      }, 200, origin);
    }

    if (action === "resolve-playback-url") {
      const programId = String(body.programId || "");
      const sessionId = String(body.sessionId || "");
      const kind = String(body.kind || "");
      const segmentIndex = body.segmentIndex == null ? null : Number(body.segmentIndex);
      const expected = expectedAsset(kind, programId, sessionId, segmentIndex);
      const format = String(body.format || "").toLowerCase();
      if (!validAudioIds(programId, sessionId) || !expected || !FORMAT_PATTERN.test(format)) {
        return jsonResponse({ error: "This recording is not available for playback." }, 404, origin);
      }
      const published = await isPublishedAsset(
        supabaseUrl,
        publishableKey,
        programId,
        sessionId,
        kind,
        segmentIndex,
        format
      );
      if (!published) return jsonResponse({ error: "This recording is not available for playback." }, 404, origin);
      const config = await getCloudinaryConfig(supabaseUrl, serviceRoleKey);
      if (!config) return jsonResponse({ error: "This recording is not available for playback." }, 404, origin);
      const signature = await cloudinaryDeliverySignature(config, expected.publicId, format);
      const assetPath = expected.publicId.split("/").map(encodeURIComponent).join("/") + "." + format;
      return jsonResponse({
        url: "https://res.cloudinary.com/" + encodeURIComponent(config.cloud_name) +
          "/video/authenticated/s--" + signature + "--/" + assetPath
      }, 200, origin);
    }

    return jsonResponse({ error: "Unsupported Cloudinary action." }, 400, origin);
  } catch (error) {
    return jsonResponse({ error: "Cloudinary audio storage could not complete this request." }, 500, origin);
  }
});
