import { supabaseRequest } from "./supabase-client.js?v=31";

const CATEGORIES = ["Bible Study", "Sunday Service", "Prayer Meeting", "Worship", "Youth Service", "Other"];

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

export async function endAdminLiveAudioProgram(programId) {
  const rows = await supabaseRequest(
    "rest/v1/live_audio_programs?id=eq." + encodeURIComponent(programId) + "&select=*",
    {
      method: "PATCH",
      prefer: "return=representation",
      body: {
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
