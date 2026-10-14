import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "../admin/config.js";
import { readLocal, writeLocal } from "./local-store.js";

const VISITOR_ID_KEY = "cerc-programme-visitor-id-v1";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_COMMENT_LENGTH = 500;

function newVisitorId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, function (value) { return value.toString(16).padStart(2, "0"); }).join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20)
  ].join("-");
}

function getVisitorId() {
  const stored = readLocal(VISITOR_ID_KEY, "");
  if (typeof stored === "string" && UUID_PATTERN.test(stored)) return stored;
  const visitorId = newVisitorId();
  writeLocal(VISITOR_ID_KEY, visitorId);
  return visitorId;
}

function configured() {
  return typeof SUPABASE_URL === "string" &&
    /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(SUPABASE_URL) &&
    typeof SUPABASE_PUBLISHABLE_KEY === "string" &&
    SUPABASE_PUBLISHABLE_KEY.length > 0;
}

async function callRpc(name, body) {
  if (!configured() || typeof fetch !== "function") {
    throw new Error("Likes and comments are unavailable right now. Please try again later.");
  }

  let response;
  let payload;
  try {
    response = await fetch(SUPABASE_URL.replace(/\/+$/, "") + "/rest/v1/rpc/" + name, {
      method: "POST",
      cache: "no-store",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        authorization: "Bearer " + SUPABASE_PUBLISHABLE_KEY,
        "content-type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify(body)
    });
    payload = await response.json();
  } catch (error) {
    throw new Error("Likes and comments are unavailable right now. Check your connection and try again.");
  }

  if (!response.ok) {
    const message = payload && (payload.message || payload.msg);
    if (typeof message === "string" && /wait .*before commenting/i.test(message)) {
      throw new Error(message);
    }
    throw new Error("Likes and comments are unavailable right now. Please try again later.");
  }
  return payload;
}

export async function getProgrammeInteractions(programs) {
  const programIds = (Array.isArray(programs) ? programs : [])
    .map(function (program) { return program && program.id; })
    .filter(function (id) { return typeof id === "string" && UUID_PATTERN.test(id); });
  if (!programIds.length) return { available: true, byProgram: {} };

  try {
    const rows = await callRpc("get_programme_interactions", {
      p_program_ids: programIds,
      p_visitor_id: getVisitorId()
    });
    if (!Array.isArray(rows)) throw new Error("Invalid interaction response.");

    const byProgram = {};
    rows.forEach(function (row) {
      if (!row || typeof row.program_id !== "string" || !UUID_PATTERN.test(row.program_id)) return;
      byProgram[row.program_id] = {
        likeCount: Math.max(0, Number(row.like_count) || 0),
        commentCount: Math.max(0, Number(row.comment_count) || 0),
        liked: Boolean(row.liked),
        comments: Array.isArray(row.comments) ? row.comments : []
      };
    });
    return { available: true, byProgram };
  } catch (error) {
    return { available: false, byProgram: {} };
  }
}

export async function toggleProgrammeLike(programId) {
  if (typeof programId !== "string" || !UUID_PATTERN.test(programId)) {
    throw new Error("This programme could not be identified. Refresh and try again.");
  }
  const result = await callRpc("toggle_programme_like", {
    p_program_id: programId,
    p_visitor_id: getVisitorId()
  });
  return {
    liked: Boolean(result && result.liked),
    likeCount: Math.max(0, Number(result && result.like_count) || 0)
  };
}

export async function postProgrammeComment(programId, value) {
  if (typeof programId !== "string" || !UUID_PATTERN.test(programId)) {
    throw new Error("This programme could not be identified. Refresh and try again.");
  }
  const body = String(value == null ? "" : value).trim();
  if (!body) throw new Error("Write a comment before posting.");
  if (body.length > MAX_COMMENT_LENGTH) {
    throw new Error("Comments must be 500 characters or fewer.");
  }

  const result = await callRpc("submit_programme_comment", {
    p_program_id: programId,
    p_visitor_id: getVisitorId(),
    p_body: body
  });
  if (!result || typeof result.id !== "string") {
    throw new Error("The comment could not be posted. Please try again.");
  }
  return {
    id: result.id,
    body: typeof result.body === "string" ? result.body : body,
    created_at: typeof result.created_at === "string" ? result.created_at : new Date().toISOString()
  };
}
