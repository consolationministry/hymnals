import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "../admin/config.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CLOUDINARY_REFERENCE_PATTERN = /^cloudinary:video:authenticated:(live-audio\/([0-9a-f-]{36})\/([0-9a-f-]{36})\/(recording|segments\/([0-9]{6}))):(webm|ogg|m4a)$/i;

export function parseCloudinaryLiveAudioReference(value) {
  const match = String(value || "").match(CLOUDINARY_REFERENCE_PATTERN);
  if (!match || !UUID_PATTERN.test(match[2]) || !UUID_PATTERN.test(match[3])) return null;
  const isSegment = match[4].startsWith("segments/");
  return {
    publicId: match[1],
    programId: match[2],
    sessionId: match[3],
    kind: isSegment ? "segment" : "recording",
    segmentIndex: isSegment ? Number(match[5]) : null,
    format: match[6].toLowerCase()
  };
}

async function requestPublicPlaybackUrl(payload) {
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(SUPABASE_URL) ||
      !/^sb_publishable_[A-Za-z0-9_-]+$/.test(SUPABASE_PUBLISHABLE_KEY)) {
    throw new Error("Cloudinary playback is not configured yet.");
  }
  const response = await fetch(
    SUPABASE_URL.replace(/\/+$/, "") + "/functions/v1/cloudinary-live-audio",
    {
      method: "POST",
      cache: "no-store",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        authorization: "Bearer " + SUPABASE_PUBLISHABLE_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );
  const text = await response.text();
  let result = null;
  if (text) {
    try { result = JSON.parse(text); }
    catch (error) { result = null; }
  }
  if (!response.ok || !result || typeof result.url !== "string") {
    throw new Error("This recording is not available for playback right now.");
  }
  let url;
  try { url = new URL(result.url); }
  catch (error) { throw new Error("This recording is not available for playback right now."); }
  if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") {
    throw new Error("This recording is not available for playback right now.");
  }
  return url.href;
}

export async function createCloudinaryLiveAudioPlaybackUrl(reference) {
  const asset = parseCloudinaryLiveAudioReference(reference);
  if (!asset) return "";
  return requestPublicPlaybackUrl({
    action: "resolve-playback-url",
    kind: asset.kind,
    programId: asset.programId,
    sessionId: asset.sessionId,
    segmentIndex: asset.segmentIndex,
    format: asset.format
  });
}
