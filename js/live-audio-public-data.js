import { createLiveAudioId, getLiveAudioVisitorId, liveAudioRequest } from "./live-audio-realtime.js";

const DEFAULT_CATEGORIES = ["Bible Study", "Sunday Service", "Prayer Meeting", "Worship", "Youth Service", "Other"];
const REACTION_TYPES = ["love", "clap", "fire"];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asArray(value) {
  return Array.isArray(value) ? value : value && typeof value === "object" ? [value] : [];
}

function safeImageUrl(value) {
  const input = String(value || "").trim();
  if (!input) return "";
  try {
    const url = new URL(input);
    return url.protocol === "https:" ? url.href : "";
  } catch (error) {
    return "";
  }
}

function normalizeProgram(row) {
  const id = String(row && row.id || "").trim();
  const title = String(row && row.title || "").trim().slice(0, 120);
  if (!id || !title) return null;
  return {
    id,
    title,
    description: String(row.description || "").trim().slice(0, 2000),
    speaker: String(row.speaker || "").trim().slice(0, 100),
    category: String(row.category || "Other").trim().slice(0, 48) || "Other",
    imageUrl: safeImageUrl(row.image_url),
    venue: String(row.venue || "").trim().slice(0, 140),
    date: String(row.program_date || "").slice(0, 32),
    status: row.status === "published" ? "published" : "draft",
    onAir: row.is_live === true && Boolean(row.live_session_id),
    liveSessionId: String(row.live_session_id || ""),
    streamUrl: "",
    listenCount: 0,
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || "")
  };
}

export function emptyLiveAudioData() {
  return {
    categories: DEFAULT_CATEGORIES.slice(),
    programs: [],
    comments: [],
    reactions: {},
    visitorReactions: {},
    myReactions: {},
    loading: false,
    error: ""
  };
}

export async function loadPublicLiveAudioData() {
  const programRows = await liveAudioRequest(
    "live_audio_programs?select=id,title,description,speaker,category,image_url,venue,program_date,status,is_live,live_session_id,live_started_at,created_at,updated_at&status=eq.published&order=created_at.desc"
  );
  const programs = asArray(programRows).map(normalizeProgram).filter(Boolean);
  const data = emptyLiveAudioData();
  data.programs = programs;
  data.categories = Array.from(new Set(programs.map(program => program.category)))
    .sort((left, right) => left.localeCompare(right));
  if (!data.categories.length) data.categories = DEFAULT_CATEGORIES.slice();

  if (!programs.length) return data;

  const visitorId = getLiveAudioVisitorId();
  const summaryRows = await liveAudioRequest("rpc/get_live_audio_interactions", {
    method: "POST",
    body: {
      p_program_ids: programs.map(program => program.id),
      p_visitor_id: visitorId
    }
  });

  asArray(summaryRows).forEach(row => {
    const programId = String(row.program_id || "");
    const program = programs.find(item => item.id === programId);
    if (!program) return;

    data.reactions[programId] = {
      love: Math.max(0, Number(row.love_count) || 0),
      clap: Math.max(0, Number(row.clap_count) || 0),
      fire: Math.max(0, Number(row.fire_count) || 0)
    };
    data.myReactions[programId] = Array.isArray(row.my_reactions)
      ? row.my_reactions.filter(reaction => REACTION_TYPES.includes(reaction))
      : [];
    program.listenCount = Math.max(0, Number(row.listener_count) || 0);

    const comments = Array.isArray(row.comments) ? row.comments : [];
    comments.forEach(comment => {
      if (!comment || !comment.id || !String(comment.body || "").trim()) return;
      data.comments.push({
        id: String(comment.id),
        programId,
        body: String(comment.body).trim().slice(0, 280),
        createdAt: String(comment.created_at || "")
      });
    });
  });

  return data;
}

export async function togglePublicLiveAudioReaction(programId, reaction) {
  if (!REACTION_TYPES.includes(reaction)) throw new Error("Choose a supported reaction.");
  if (!UUID_PATTERN.test(String(programId || ""))) throw new Error("This programme is not available for reactions.");
  return liveAudioRequest("rpc/toggle_live_audio_reaction", {
    method: "POST",
    body: {
      p_program_id: programId,
      p_visitor_id: getLiveAudioVisitorId(),
      p_reaction: reaction
    }
  });
}

export async function submitPublicLiveAudioComment(programId, body) {
  const text = String(body || "").trim();
  if (!text) throw new Error("Write a comment first.");
  if (text.length > 280) throw new Error("Comments must be 280 characters or fewer.");
  if (!UUID_PATTERN.test(String(programId || ""))) throw new Error("This programme is not available for comments.");
  return liveAudioRequest("rpc/submit_live_audio_comment", {
    method: "POST",
    body: {
      p_program_id: programId,
      p_visitor_id: getLiveAudioVisitorId(),
      p_body: text
    }
  });
}

export async function recordPublicLiveAudioListen(programId, sessionId) {
  const eventId = sessionId || createLiveAudioId();
  if (!UUID_PATTERN.test(String(programId || "")) || !UUID_PATTERN.test(String(eventId || ""))) {
    throw new Error("This listening session could not be identified.");
  }
  return liveAudioRequest("rpc/record_live_audio_listen", {
    method: "POST",
    body: {
      p_program_id: programId,
      p_visitor_id: getLiveAudioVisitorId(),
      p_session_id: eventId
    }
  });
}
