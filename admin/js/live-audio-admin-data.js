import { supabaseRequest } from "./supabase-client.js?v=32";

const CATEGORIES = ["Bible Study", "Sunday Service", "Prayer Meeting", "Worship", "Youth Service", "Other"];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asArray(value) {
  return Array.isArray(value) ? value : value && typeof value === "object" ? [value] : [];
}

function normalizeProgram(row) {
  return {
    id: String(row.id),
    title: String(row.title || ""),
    description: String(row.description || ""),
    speaker: String(row.speaker || ""),
    category: String(row.category || "Other"),
    imageUrl: String(row.image_url || ""),
    venue: String(row.venue || ""),
    date: String(row.program_date || ""),
    status: row.status === "published" ? "published" : "draft",
    onAir: row.is_live === true,
    liveSessionId: row.live_session_id || "",
    liveStartedAt: row.live_started_at || "",
    recordingPath: String(row.recording_path || ""),
    recordingDurationSeconds: Math.max(0, Number(row.recording_duration_seconds) || 0),
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    listenCount: Math.max(0, Number(row.listener_count) || 0)
  };
}

export async function loadAdminLiveAudioData() {
  const [programRows, categoryRows, stats] = await Promise.all([
    supabaseRequest("rest/v1/live_audio_programs?select=*&order=updated_at.desc"),
    supabaseRequest("rest/v1/live_audio_categories?select=name&order=name.asc"),
    supabaseRequest("rest/v1/rpc/get_live_audio_admin_stats", { method: "POST", body: {} })
  ]);
  const categories = asArray(categoryRows).map(row => String(row.name || "").trim()).filter(Boolean);
  return {
    programs: asArray(programRows).map(normalizeProgram),
    categories: categories.length ? categories : CATEGORIES.slice(),
    stats: stats || { total_broadcasts: 0, total_listeners: 0, total_likes: 0, total_comments: 0 }
  };
}

export async function loadAdminLiveAudioInteractions(programId) {
  if (!programId) return null;
  const rows = await supabaseRequest("rest/v1/rpc/get_live_audio_interactions", {
    method: "POST",
    body: { p_program_ids: [programId], p_visitor_id: null }
  });
  const row = asArray(rows).find(item => String(item.program_id || "") === String(programId));
  if (!row) return { loveCount: 0, clapCount: 0, fireCount: 0, commentCount: 0, listenCount: 0, comments: [] };
  const comments = Array.isArray(row.comments) ? row.comments : [];
  return {
    loveCount: Math.max(0, Number(row.love_count) || 0),
    clapCount: Math.max(0, Number(row.clap_count) || 0),
    fireCount: Math.max(0, Number(row.fire_count) || 0),
    commentCount: Math.max(0, Number(row.comment_count) || 0),
    listenCount: Math.max(0, Number(row.listener_count) || 0),
    comments: comments.filter(comment => comment && String(comment.body || "").trim()).map(comment => ({
      id: String(comment.id || ""),
      body: String(comment.body || "").trim().slice(0, 280),
      createdAt: String(comment.created_at || "")
    }))
  };
}

export async function saveAdminLiveAudioProgram(value) {
  const payload = {
    title: String(value.title || "").trim(),
    description: String(value.description || "").trim(),
    speaker: String(value.speaker || "").trim(),
    category: String(value.category || "Other").trim() || "Other",
    image_url: String(value.imageUrl || "").trim(),
    venue: String(value.venue || "").trim(),
    program_date: value.date || null,
    status: value.status === "published" ? "published" : "draft",
    updated_at: new Date().toISOString()
  };
  if (payload.image_url) {
    const imageUrl = new URL(payload.image_url);
    if (imageUrl.protocol !== "https:") throw new Error("Use a secure HTTPS cover image address.");
    payload.image_url = imageUrl.href;
  }
  if (!payload.title) throw new Error("Enter a programme title before saving.");
  const path = value.id
    ? "rest/v1/live_audio_programs?id=eq." + encodeURIComponent(value.id) + "&select=*"
    : "rest/v1/live_audio_programs?select=*";
  const rows = await supabaseRequest(path, {
    method: value.id ? "PATCH" : "POST",
    prefer: "return=representation",
    body: payload
  });
  const saved = asArray(rows)[0];
  if (!saved) throw new Error("The programme could not be saved.");
  return normalizeProgram(saved);
}

export async function setAdminLiveAudioStatus(programId, status) {
  const rows = await supabaseRequest(
    "rest/v1/live_audio_programs?id=eq." + encodeURIComponent(programId) + "&select=*",
    { method: "PATCH", prefer: "return=representation", body: { status, updated_at: new Date().toISOString() } }
  );
  return normalizeProgram(asArray(rows)[0]);
}

export async function deleteAdminLiveAudioProgram(programId) {
  await supabaseRequest("rest/v1/live_audio_programs?id=eq." + encodeURIComponent(programId), { method: "DELETE" });
}

export async function uploadAdminLiveAudioRecording(programId, sessionId, recording) {
  if (!UUID_PATTERN.test(String(programId || "")) || !UUID_PATTERN.test(String(sessionId || ""))) {
    throw new Error("This broadcast recording could not be identified.");
  }
  if (!recording || !recording.blob || !recording.blob.size) {
    throw new Error("There is no audio recording to upload.");
  }

  const format = String(recording.contentType || recording.blob.type || "").split(";")[0].trim().toLowerCase();
  const extensions = { "audio/webm": "webm", "audio/ogg": "ogg", "audio/mp4": "m4a" };
  const extension = extensions[format];
  if (!extension) throw new Error("The recording uses an unsupported audio format.");

  const storagePath = programId + "/" + sessionId + "." + extension;
  const encodedPath = storagePath.split("/").map(encodeURIComponent).join("/");
  const storageEndpoint = "storage/v1/object/live-audio-recordings/" + encodedPath;
  await supabaseRequest(storageEndpoint, {
    method: "POST",
    headers: { "content-type": format },
    body: recording.blob
  });

  try {
    const rows = await supabaseRequest(
      "rest/v1/live_audio_programs?id=eq." + encodeURIComponent(programId) + "&select=*",
      {
        method: "PATCH",
        prefer: "return=representation",
        body: {
          recording_path: storagePath,
          recording_duration_seconds: Math.max(1, Math.round(Number(recording.durationSeconds) || 1)),
          updated_at: new Date().toISOString()
        }
      }
    );
    const row = asArray(rows)[0];
    if (!row) throw new Error("The recording uploaded, but its broadcast details could not be saved.");
    return normalizeProgram(row);
  } catch (error) {
    await supabaseRequest(storageEndpoint, { method: "DELETE" }).catch(() => {});
    throw error;
  }
}

export async function saveAdminLiveAudioCategories(categories) {
  const names = Array.from(new Set((Array.isArray(categories) ? categories : [])
    .map(value => String(value || "").trim().slice(0, 48))
    .filter(Boolean)));
  if (!names.length) throw new Error("Keep at least one programme category.");
  const currentRows = await supabaseRequest("rest/v1/live_audio_categories?select=name");
  const current = asArray(currentRows).map(row => String(row.name || ""));
  const remove = current.filter(name => !names.includes(name));
  if (remove.length) {
    await Promise.all(remove.map(name => supabaseRequest(
      "rest/v1/live_audio_categories?name=eq." + encodeURIComponent(name),
      { method: "DELETE" }
    )));
  }
  await supabaseRequest("rest/v1/live_audio_categories?on_conflict=name", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: names.map(name => ({ name }))
  });
  return names;
}

export async function startAdminLiveAudioProgram(programId, sessionId) {
  const rows = await supabaseRequest(
    "rest/v1/live_audio_programs?id=eq." + encodeURIComponent(programId) + "&select=*",
    {
      method: "PATCH",
      prefer: "return=representation",
      body: {
        status: "published",
        is_live: true,
        live_session_id: sessionId,
        live_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  );
  const row = asArray(rows)[0];
  if (!row) throw new Error("The programme could not be started.");
  return normalizeProgram(row);
}

export async function endAdminLiveAudioProgram(programId, status) {
  const finalStatus = status === "draft" ? "draft" : "published";
  const rows = await supabaseRequest(
    "rest/v1/live_audio_programs?id=eq." + encodeURIComponent(programId) + "&select=*",
    {
      method: "PATCH",
      prefer: "return=representation",
      body: {
        status: finalStatus,
        is_live: false,
        live_session_id: null,
        live_started_at: null,
        updated_at: new Date().toISOString()
      }
    }
  );
  const row = asArray(rows)[0];
  if (!row) throw new Error("The broadcast could not be ended.");
  return normalizeProgram(row);
}
