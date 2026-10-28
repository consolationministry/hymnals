import { createLiveAudioId, createLiveAudioRecordingSignedUrl, getLiveAudioVisitorId, liveAudioRequest } from "./live-audio-realtime.js";
import { createCloudinaryLiveAudioPlaybackUrl, parseCloudinaryLiveAudioReference } from "./cloudinary-live-audio.js";

const DEFAULT_CATEGORIES = ["Bible Study", "Sunday Service", "Prayer Meeting", "Worship", "Youth Service", "Other"];
const REACTION_TYPES = ["love", "clap", "fire", "like"];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RECORDING_URL_CACHE = new Map();
const LIVE_SEGMENT_URL_CACHE = new Map();

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
    liveStartedAt: String(row.live_started_at || ""),
    liveSegments: [],
    recordingPath: String(row.recording_path || ""),
    recordingDurationSeconds: Math.max(0, Number(row.recording_duration_seconds) || 0),
    recordingUrl: "",
    streamUrl: "",
    listenCount: 0,
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || "")
  };
}

async function resolveRecordingUrl(program) {
  if (!program.recordingPath) return "";
  const cached = RECORDING_URL_CACHE.get(program.recordingPath);
  if (cached && cached.expiresAt > Date.now()) return cached.url;
  const cloudinaryAsset = parseCloudinaryLiveAudioReference(program.recordingPath);
  const url = cloudinaryAsset
    ? await createCloudinaryLiveAudioPlaybackUrl(program.recordingPath)
    : await createLiveAudioRecordingSignedUrl(program.recordingPath);
  if (url) RECORDING_URL_CACHE.set(program.recordingPath, { url, expiresAt: Date.now() + 55 * 60 * 1000 });
  return url;
}

async function resolveLiveAudioSegments(program, segmentIndex) {
  if (!program || !program.onAir || !UUID_PATTERN.test(program.id) ||
      !UUID_PATTERN.test(program.liveSessionId)) return [];
  try {
    const rows = asArray(await liveAudioRequest(
      "live_audio_segments?select=segment_index,started_at,duration_seconds,storage_path" +
      "&program_id=eq." + encodeURIComponent(program.id) +
      "&session_id=eq." + encodeURIComponent(program.liveSessionId) +
      (Number.isInteger(segmentIndex) && segmentIndex >= 0
        ? "&segment_index=eq." + String(segmentIndex)
        : "") +
      "&order=segment_index.asc"
    ));
    const segments = rows.map(row => {
      const index = Number(row.segment_index);
      const durationSeconds = Number(row.duration_seconds);
      const storagePath = String(row.storage_path || "");
      const cloudinaryAsset = parseCloudinaryLiveAudioReference(storagePath);
      const isCloudinarySegment = cloudinaryAsset &&
        cloudinaryAsset.kind === "segment" &&
        cloudinaryAsset.programId === program.id &&
        cloudinaryAsset.sessionId === program.liveSessionId &&
        cloudinaryAsset.segmentIndex === index;
      const prefix = program.id + "/" + program.liveSessionId + "/segments/";
      const file = !cloudinaryAsset && storagePath.startsWith(prefix)
        ? storagePath.slice(prefix.length).match(/^([0-9]{6})\.(webm|ogg|m4a)$/i)
        : null;
      if (!Number.isInteger(index) || index < 0 ||
          !Number.isFinite(durationSeconds) || durationSeconds <= 0 ||
          (!isCloudinarySegment && (!file || Number(file[1]) !== index))) return null;
      return {
        index,
        durationSeconds,
        startedAt: String(row.started_at || ""),
        storagePath
      };
    }).filter(Boolean);
    const now = Date.now();
    const resolved = await Promise.all(segments.map(async segment => {
      const cached = LIVE_SEGMENT_URL_CACHE.get(segment.storagePath);
      const url = cached && cached.expiresAt > now
        ? cached.url
        : parseCloudinaryLiveAudioReference(segment.storagePath)
          ? await createCloudinaryLiveAudioPlaybackUrl(segment.storagePath)
          : await createLiveAudioRecordingSignedUrl(segment.storagePath);
      if (url) LIVE_SEGMENT_URL_CACHE.set(segment.storagePath, {
        url,
        expiresAt: now + 55 * 60 * 1000
      });
      return { ...segment, url };
    }));
    if (LIVE_SEGMENT_URL_CACHE.size > 4000) {
      for (const [path, cached] of LIVE_SEGMENT_URL_CACHE) {
        if (cached.expiresAt <= now || LIVE_SEGMENT_URL_CACHE.size > 3000) LIVE_SEGMENT_URL_CACHE.delete(path);
      }
    }
    return resolved.filter(segment => Boolean(segment.url));
  } catch (error) {
    return [];
  }
}

export async function loadPublicLiveAudioSegment(programId, sessionId, segmentIndex) {
  if (!UUID_PATTERN.test(String(programId || "")) ||
      !UUID_PATTERN.test(String(sessionId || "")) ||
      !Number.isInteger(Number(segmentIndex)) || Number(segmentIndex) < 0) return null;
  const segments = await resolveLiveAudioSegments({
    id: String(programId),
    liveSessionId: String(sessionId),
    onAir: true
  }, Number(segmentIndex));
  return segments[0] || null;
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
  let programRows;
  try {
    programRows = await liveAudioRequest(
      "live_audio_programs?select=id,title,description,speaker,category,image_url,venue,program_date,status,is_live,live_session_id,live_started_at,recording_path,recording_duration_seconds,created_at,updated_at&status=eq.published&order=created_at.desc"
    );
  } catch (error) {
    if (!/recording_path|recording_duration_seconds|setup is not finished/i.test(error.message || "")) throw error;
    programRows = await liveAudioRequest(
      "live_audio_programs?select=id,title,description,speaker,category,image_url,venue,program_date,status,is_live,live_session_id,live_started_at,created_at,updated_at&status=eq.published&order=created_at.desc"
    );
  }
  const programs = asArray(programRows).map(normalizeProgram).filter(Boolean);
  const data = emptyLiveAudioData();
  data.programs = programs;
  await Promise.all(programs.map(async program => {
    const [recordingUrl, liveSegments] = await Promise.all([
      resolveRecordingUrl(program),
      resolveLiveAudioSegments(program)
    ]);
    program.recordingUrl = recordingUrl;
    program.liveSegments = liveSegments;
  }));
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
      fire: Math.max(0, Number(row.fire_count) || 0),
      like: Math.max(0, Number(row.like_count) || 0)
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

export async function sendPublicLiveAudioBurst(programId, reaction) {
  if (!["love", "clap", "fire", "like"].includes(reaction)) throw new Error("Choose a supported reaction.");
  if (!UUID_PATTERN.test(String(programId || ""))) throw new Error("This programme is not available for reactions.");
  return liveAudioRequest("rpc/send_live_audio_burst", {
    method: "POST",
    body: { p_program_id: programId, p_visitor_id: getLiveAudioVisitorId(), p_reaction: reaction }
  });
}
