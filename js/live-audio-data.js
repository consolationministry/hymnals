export const LIVE_AUDIO_STORAGE_KEY = "cerc-live-audio-v1";
const VISITOR_KEY = "cerc-live-audio-visitor-v1";
const DEFAULT_CATEGORIES = ["Bible Study", "Sunday Service", "Prayer Meeting", "Worship", "Youth Service", "Other"];
const REACTION_TYPES = ["love", "clap", "fire"];
const MAX_COMMENTS = 200;

function emptyData() {
  return { categories: DEFAULT_CATEGORIES.slice(), programs: [], comments: [], reactions: {}, visitorReactions: {} };
}

function getStorage() {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch (error) {
    return null;
  }
}

function safeUrl(value) {
  const input = String(value || "").trim();
  if (!input) return "";
  try {
    const url = new URL(input);
    return url.protocol === "https:" ? url.href : "";
  } catch (error) {
    return "";
  }
}

function normalizedCategories(value) {
  const categories = Array.isArray(value) ? value : DEFAULT_CATEGORIES;
  const unique = Array.from(new Set(categories.map(function (item) {
    return String(item || "").trim().slice(0, 48);
  }).filter(Boolean)));
  return unique.length ? unique : DEFAULT_CATEGORIES.slice();
}

function normalizeProgram(value) {
  if (!value || typeof value !== "object") return null;
  const id = String(value.id || "").trim();
  const title = String(value.title || "").trim().slice(0, 120);
  if (!id || !title) return null;
  return {
    id: id,
    title: title,
    speaker: String(value.speaker || "").trim().slice(0, 100),
    category: String(value.category || "Other").trim().slice(0, 48) || "Other",
    imageUrl: safeUrl(value.imageUrl),
    description: String(value.description || "").trim().slice(0, 2000),
    venue: String(value.venue || "").trim().slice(0, 140),
    date: String(value.date || "").trim().slice(0, 32),
    streamUrl: safeUrl(value.streamUrl),
    status: value.status === "published" ? "published" : "draft",
    onAir: value.onAir === true && value.status === "published" && Boolean(safeUrl(value.streamUrl)),
    listenCount: Math.max(0, Number.parseInt(value.listenCount, 10) || 0),
    createdAt: String(value.createdAt || new Date().toISOString()),
    updatedAt: String(value.updatedAt || new Date().toISOString())
  };
}

function normalizeData(value) {
  if (!value || typeof value !== "object") return emptyData();
  const programs = Array.isArray(value.programs) ? value.programs.map(normalizeProgram).filter(Boolean) : [];
  const comments = Array.isArray(value.comments) ? value.comments.filter(function (comment) {
    return comment && typeof comment === "object" && programs.some(function (program) { return program.id === comment.programId; });
  }).slice(-MAX_COMMENTS).map(function (comment) {
    return {
      id: String(comment.id || ""),
      programId: String(comment.programId || ""),
      body: String(comment.body || "").trim().slice(0, 280),
      createdAt: String(comment.createdAt || "")
    };
  }).filter(function (comment) { return comment.id && comment.body; }) : [];
  const reactions = {};
  if (value.reactions && typeof value.reactions === "object") {
    programs.forEach(function (program) {
      const counts = value.reactions[program.id];
      reactions[program.id] = {};
      REACTION_TYPES.forEach(function (type) {
        reactions[program.id][type] = Math.max(0, Number.parseInt(counts && counts[type], 10) || 0);
      });
    });
  }
  const visitorReactions = value.visitorReactions && typeof value.visitorReactions === "object"
    ? value.visitorReactions
    : {};
  return {
    categories: normalizedCategories(value.categories),
    programs: programs,
    comments: comments,
    reactions: reactions,
    visitorReactions: visitorReactions
  };
}

export function getLiveAudioData() {
  const storage = getStorage();
  if (!storage) return emptyData();
  try {
    const saved = storage.getItem(LIVE_AUDIO_STORAGE_KEY);
    return saved ? normalizeData(JSON.parse(saved)) : emptyData();
  } catch (error) {
    return emptyData();
  }
}

function writeLiveAudioData(data) {
  const normalized = normalizeData(data);
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(LIVE_AUDIO_STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
      // Keep the current view usable when browser storage is full or unavailable.
    }
  }
  return normalized;
}

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return "audio-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

function visitorId() {
  const storage = getStorage();
  if (!storage) return "session";
  try {
    let id = storage.getItem(VISITOR_KEY);
    if (!id) {
      id = makeId();
      storage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch (error) {
    return "session";
  }
}

export function saveLiveAudioProgram(input) {
  const data = getLiveAudioData();
  const now = new Date().toISOString();
  const old = data.programs.find(function (program) { return program.id === input.id; });
  const candidate = normalizeProgram(Object.assign({}, old || {}, input, {
    id: old ? old.id : makeId(),
    createdAt: old ? old.createdAt : now,
    updatedAt: now,
    listenCount: old ? old.listenCount : 0
  }));
  if (!candidate) throw new Error("Enter a program title before saving.");
  const index = data.programs.findIndex(function (program) { return program.id === candidate.id; });
  if (index === -1) data.programs.unshift(candidate);
  else data.programs[index] = candidate;
  return writeLiveAudioData(data).programs.find(function (program) { return program.id === candidate.id; });
}

export function setLiveAudioProgramStatus(id, status) {
  if (status !== "draft" && status !== "published") throw new Error("Choose Draft or Published.");
  const data = getLiveAudioData();
  const program = data.programs.find(function (item) { return item.id === id; });
  if (!program) throw new Error("This audio program could not be found.");
  program.status = status;
  program.updatedAt = new Date().toISOString();
  return writeLiveAudioData(data);
}

export function setLiveAudioProgramOnAir(id, onAir) {
  const data = getLiveAudioData();
  const program = data.programs.find(function (item) { return item.id === id; });
  if (!program) throw new Error("This audio program could not be found.");
  if (onAir && (program.status !== "published" || !program.streamUrl)) {
    throw new Error("Publish the program and add a secure stream URL before setting it on air.");
  }
  program.onAir = Boolean(onAir);
  program.updatedAt = new Date().toISOString();
  return writeLiveAudioData(data);
}

export function deleteLiveAudioProgram(id) {
  const data = getLiveAudioData();
  data.programs = data.programs.filter(function (program) { return program.id !== id; });
  data.comments = data.comments.filter(function (comment) { return comment.programId !== id; });
  delete data.reactions[id];
  delete data.visitorReactions[id];
  return writeLiveAudioData(data);
}

export function saveLiveAudioCategories(categories) {
  const data = getLiveAudioData();
  data.categories = normalizedCategories(categories);
  return writeLiveAudioData(data);
}

export function addLiveAudioComment(programId, body) {
  const text = String(body || "").trim();
  if (!text) throw new Error("Write a comment first.");
  if (text.length > 280) throw new Error("Comments must be 280 characters or fewer.");
  const data = getLiveAudioData();
  if (!data.programs.some(function (program) { return program.id === programId && program.status === "published"; })) {
    throw new Error("This program is not available for comments.");
  }
  data.comments.push({ id: makeId(), programId: programId, body: text, createdAt: new Date().toISOString() });
  return writeLiveAudioData(data);
}

export function toggleLiveAudioReaction(programId, type) {
  if (!REACTION_TYPES.includes(type)) throw new Error("Choose a supported reaction.");
  const data = getLiveAudioData();
  if (!data.programs.some(function (program) { return program.id === programId && program.status === "published"; })) {
    throw new Error("This program is not available for reactions.");
  }
  if (!data.reactions[programId]) data.reactions[programId] = { love: 0, clap: 0, fire: 0, like: 0 };
  if (!data.visitorReactions[programId]) data.visitorReactions[programId] = {};
  const id = visitorId();
  const current = data.visitorReactions[programId][type] === id;
  data.reactions[programId][type] = Math.max(0, data.reactions[programId][type] + (current ? -1 : 1));
  data.visitorReactions[programId][type] = current ? "" : id;
  return writeLiveAudioData(data);
}

export function recordLiveAudioListen(programId) {
  const data = getLiveAudioData();
  const program = data.programs.find(function (item) { return item.id === programId && item.status === "published"; });
  if (!program) return data;
  program.listenCount += 1;
  return writeLiveAudioData(data);
}

export function getLiveAudioVisitorId() {
  return visitorId();
}

export function liveAudioReactionSelected(data, programId, type) {
  if (data && data.myReactions && Array.isArray(data.myReactions[programId])) {
    return data.myReactions[programId].includes(type);
  }
  const id = visitorId();
  return Boolean(data && data.visitorReactions && data.visitorReactions[programId] && data.visitorReactions[programId][type] === id);
}

export function liveAudioCounts(data, programId) {
  const counts = data && data.reactions && data.reactions[programId] ? data.reactions[programId] : {};
  return {
    love: Math.max(0, Number(counts.love) || 0),
    clap: Math.max(0, Number(counts.clap) || 0),
    fire: Math.max(0, Number(counts.fire) || 0),
    like: Math.max(0, Number(counts.like) || 0)
  };
}
