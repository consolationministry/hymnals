import {
  deleteAdminLiveAudioProgram,
  endAdminLiveAudioProgram,
  loadAdminLiveAudioData,
  saveAdminLiveAudioCategories,
  saveAdminLiveAudioProgram,
  setAdminLiveAudioStatus,
  startAdminLiveAudioProgram
} from "./live-audio-admin-data.js";
import { createLiveAudioId } from "../../js/live-audio-realtime.js";
import { createLiveAudioMicEngine, DEFAULT_AUDIO_SETTINGS, startLiveAudioPublisher } from "../../js/live-audio-webrtc.js";

let activeTab = "programs";
let editingId = null;
let wizardStep = 1;
let cachedData = null;
let loadingPromise = null;
let loadError = "";
let activeMicEngine = null;
let activeMicFrame = null;
let activeBroadcaster = null;
let activeBroadcastId = null;
let audioSettings = Object.assign({}, DEFAULT_AUDIO_SETTINGS);

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[character]);
}

function toast(message) {
  const node = document.getElementById("admin-toast");
  if (!node) return;
  node.textContent = message;
  node.hidden = false;
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => { node.hidden = true; }, 4200);
}

function formatDate(value) {
  if (!value) return "Date not set";
  const parsed = new Date(value.length === 10 ? value + "T12:00:00" : value);
  if (Number.isNaN(parsed.getTime())) return "Date not set";
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(parsed);
}

function icon(name) {
  const paths = {
    radio: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v10a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z"/><path d="m7 5 10-3M8 15h8"/><circle cx="8" cy="10" r="1.7"/>',
    back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    edit: '<path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3"/>'
  };
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || "") + "</svg>";
}

function tabButton(id, label) {
  return '<button class="audio-admin-tab' + (activeTab === id ? " is-active" : "") +
    '" type="button" data-action="audio-admin-tab" data-tab="' + id + '" aria-pressed="' + (activeTab === id) + '">' + label + "</button>";
}

function refreshAdminData() {
  if (loadingPromise) return loadingPromise;
  loadError = "";
  loadingPromise = loadAdminLiveAudioData().then(data => {
    cachedData = data;
    loadError = "";
    return data;
  }).catch(error => {
    loadError = error && error.message ? error.message : "Live Audio setup could not be loaded.";
    throw error;
  }).finally(() => {
    loadingPromise = null;
    rerender();
  });
  return loadingPromise;
}

export function ensureLiveAudioAdminLoaded() {
  return refreshAdminData();
}

function renderStats(data) {
  const stats = data.stats || {};
  const cards = [
    ["Total broadcasts", Number(stats.total_broadcasts) || 0],
    ["Listener sessions", Number(stats.total_listeners) || 0],
    ["Reactions", Number(stats.total_likes) || 0],
    ["Comments", Number(stats.total_comments) || 0]
  ];
  return '<section class="stats-grid audio-admin-stats" aria-label="Live Audio statistics">' + cards.map(card =>
    '<article class="stat-card"><div class="stat-head"><span class="stat-label">' + card[0] +
    '</span><span class="audio-admin-stat-icon">' + icon("radio") + '</span></div><p class="stat-value">' +
    card[1] + '</p><p class="stat-hint">Shared web broadcast data</p></article>'
  ).join("") + "</section>";
}

function renderProgramRows(data) {
  const programs = data.programs.filter(program =>
    activeTab === "drafts" ? program.status === "draft" :
      activeTab === "published" ? program.status === "published" : true
  );
  if (!programs.length) {
    const title = activeTab === "drafts" ? "No drafts yet" :
      activeTab === "published" ? "No published broadcasts yet" : "No broadcasts yet";
    return '<div class="audio-admin-empty">' + icon("radio") + "<h2>" + title +
      '</h2><p>Choose Go live to add programme details, test the microphone, then start the web broadcast.</p></div>';
  }
  return '<div class="audio-admin-table-wrap"><table class="audio-admin-table"><thead><tr>' +
    '<th scope="col">Broadcast</th><th scope="col">Category</th><th scope="col">Status</th>' +
    '<th scope="col">Date</th><th scope="col">Actions</th></tr></thead><tbody>' +
    programs.map(program => {
      const status = program.onAir
        ? '<span class="status-pill status-published">Live now</span>'
        : '<span class="status-pill ' + (program.status === "published" ? "status-published" : "status-draft") + '">' +
          (program.status === "published" ? "Published" : "Draft") + "</span>";
      return '<tr><td><strong>' + escapeHtml(program.title) + '</strong><small>' +
        escapeHtml(program.speaker || "Minister not set") + "</small></td><td>" +
        escapeHtml(program.category) + "</td><td>" + status + "</td><td>" +
        escapeHtml(formatDate(program.date)) + '</td><td><div class="audio-admin-actions">' +
        '<button class="button button-secondary" type="button" data-action="audio-admin-edit" data-id="' +
        escapeHtml(program.id) + '">' + icon("edit") + " Edit</button>" +
        (program.onAir
          ? '<button class="button button-secondary audio-admin-stop" type="button" data-action="audio-admin-stop-live" data-id="' + escapeHtml(program.id) + '">End broadcast</button>'
          : '<button class="button button-primary" type="button" data-action="audio-admin-go-live" data-id="' + escapeHtml(program.id) + '">Go live</button>') +
        (program.status === "draft"
          ? '<button class="button button-secondary" type="button" data-action="audio-admin-publish" data-id="' + escapeHtml(program.id) + '">Publish</button>'
          : "") +
        '<button class="button button-secondary audio-admin-delete" type="button" data-action="audio-admin-delete" data-id="' +
        escapeHtml(program.id) + '" aria-label="Delete ' + escapeHtml(program.title) + '">' + icon("trash") + "</button>" +
        "</div></td></tr>";
    }).join("") + "</tbody></table></div>";
}

function renderProgramDetails(data) {
  const existing = data.programs.find(program => program.id === editingId);
  const item = existing || { title: "", speaker: "", category: data.categories[0] || "Other", imageUrl: "", description: "", venue: "", date: "" };
  const categories = data.categories.map(category =>
    '<option value="' + escapeHtml(category) + '"' + (category === item.category ? " selected" : "") + ">" + escapeHtml(category) + "</option>"
  ).join("");
  return '<section class="audio-admin-form-wrap"><div class="page-heading"><div><p class="audio-wizard-step">STEP 1 OF 2</p><h1>' +
    (existing ? "Broadcast details" : "New broadcast") +
    '</h1><p>Add the programme information before microphone setup.</p></div><button class="button button-secondary audio-admin-back" type="button" data-action="audio-admin-back">' +
    icon("back") + "Back to broadcasts</button></div>" +
    '<form class="panel audio-admin-form" id="live-audio-program-form"><div class="audio-admin-form-grid">' +
    '<div class="admin-field"><label for="audio-title">Programme title <span aria-hidden="true">*</span></label><input class="form-input" id="audio-title" name="title" maxlength="120" value="' + escapeHtml(item.title) + '" required></div>' +
    '<div class="admin-field"><label for="audio-speaker">Minister name</label><input class="form-input" id="audio-speaker" name="speaker" maxlength="100" value="' + escapeHtml(item.speaker) + '"></div>' +
    '<div class="admin-field"><label for="audio-category">Category</label><select class="form-select" id="audio-category" name="category">' + categories + "</select></div>" +
    '<div class="admin-field"><label for="audio-date">Programme date</label><input class="form-input" id="audio-date" name="date" type="date" value="' + escapeHtml(item.date) + '"></div>' +
    '<div class="admin-field"><label for="audio-venue">Venue</label><input class="form-input" id="audio-venue" name="venue" maxlength="140" value="' + escapeHtml(item.venue) + '"></div>' +
    '<div class="admin-field"><label for="audio-image">Cover / thumbnail image URL</label><input class="form-input" id="audio-image" name="imageUrl" type="url" inputmode="url" placeholder="https://…" value="' + escapeHtml(item.imageUrl) + '"><p class="field-hint">Use an HTTPS image address. This is only the programme artwork—audio comes from your microphone.</p></div>' +
    '<div class="admin-field audio-admin-wide"><label for="audio-description">Programme description</label><textarea class="form-textarea" id="audio-description" name="description" rows="4" maxlength="2000">' + escapeHtml(item.description) + "</textarea></div>" +
    '</div><div class="audio-admin-form-footer"><span class="field-hint">Church name, logo, and colours stay linked to the existing Consolation branding.</span><div class="form-actions-right">' +
    '<button class="button button-secondary" type="submit" data-audio-status="draft">Save draft</button>' +
    '<button class="button button-primary" type="submit" data-audio-next="true">Next: microphone settings</button></div></div></form></section>';
}

function rangeControl(id, label, min, max, step, value, unit) {
  return '<label class="audio-control" for="audio-control-' + id + '"><span><strong>' + label +
    '</strong><output data-audio-output="' + id + '">' + value + unit + '</output></span><input id="audio-control-' +
    id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value +
    '" data-audio-control="' + id + '"><span class="audio-control-ends"><small>' + min + unit + "</small><small>" + max + unit + "</small></span></label>";
}

function renderBroadcastSettings(data) {
  const program = data.programs.find(item => item.id === editingId);
  if (!program) return '<div class="audio-admin-empty"><h2>Programme not found</h2><p>Go back and choose a broadcast again.</p></div>';
  const isLive = program.onAir;
  return '<section class="audio-admin-form-wrap"><div class="page-heading"><div><p class="audio-wizard-step">STEP 2 OF 2</p><h1>Microphone &amp; broadcast settings</h1><p>Test your voice, adjust the sound, then go live.</p></div>' +
    '<button class="button button-secondary audio-admin-back" type="button" data-action="audio-admin-back">' + icon("back") + "Back to broadcasts</button></div>" +
    '<div class="audio-current-program"><span class="audio-current-icon">' + icon("radio") + '</span><div><small>READY TO BROADCAST</small><strong>' +
    escapeHtml(program.title) + '</strong><span>' + escapeHtml(program.speaker || "Minister not set") + " · " + escapeHtml(program.category) +
    "</span></div></div>" +
    '<section class="panel audio-mic-panel"><header class="panel-header"><div><h2>Microphone check</h2><p>Mic stays in this browser. It is not recorded or sent until you choose Go live.</p></div></header>' +
    '<div class="panel-body"><canvas class="audio-waveform" data-audio-waveform width="760" height="112" aria-label="Live microphone waveform" role="img"></canvas>' +
    '<div class="audio-mic-meter" role="meter" aria-label="Microphone input level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span data-audio-mic-level></span></div>' +
    '<p class="audio-mic-status" data-audio-mic-status role="status" aria-live="polite">' +
    (isLive ? (activeBroadcastId === program.id ? "Broadcast is live." : "Broadcast is marked live, but this admin session is not connected.") : "Microphone is off.") + "</p>" +
    (isLive ? '<p class="audio-listener-count" data-audio-listener-count>0 listeners connected</p>' : "") +
    '<div class="audio-mic-actions">' +
    (isLive
      ? '<button class="button button-secondary audio-admin-stop" type="button" data-action="audio-admin-stop-live" data-id="' + escapeHtml(program.id) + '">End broadcast</button>'
      : '<button class="button button-secondary" type="button" data-action="audio-admin-mic-test">Test microphone</button><button class="button button-primary" type="button" data-action="audio-admin-go-live-now" data-id="' + escapeHtml(program.id) + '">Go live</button>') +
    '<button class="button button-secondary" type="button" data-action="audio-admin-mic-stop" hidden>Stop mic test</button></div></div></section>' +
    '<section class="panel audio-mixer-panel"><header class="panel-header"><div><h2>Voice sound</h2><p>Small adjustments are best. Keep the mic level out of the red.</p></div></header><div class="audio-mixer-grid">' +
    rangeControl("bass", "Bass", -12, 12, 1, audioSettings.bass, " dB") +
    rangeControl("mid", "Mid", -12, 12, 1, audioSettings.mid, " dB") +
    rangeControl("treble", "Treble", -12, 12, 1, audioSettings.treble, " dB") +
    rangeControl("pitch", "Pitch", -4, 4, 1, audioSettings.pitch, " st") +
    rangeControl("gain", "Mic level", -12, 6, 1, audioSettings.gain, " dB") +
    '</div><p class="field-hint">Pitch shift is subtle and browser-dependent. For listeners on networks that block direct peer connections, a TURN relay will be needed.</p></section>' +
    '<div class="audio-admin-form-footer"><span class="field-hint">Going live publishes the programme and sends processed mic audio directly to listeners with WebRTC.</span>' +
    '<div class="form-actions-right"><button class="button button-secondary" type="button" data-action="audio-admin-save-draft">Save draft</button></div></div></section>';
}

function renderSettings(data) {
  return '<section class="page-heading"><div><h1>Broadcast settings</h1><p>Manage programme categories for the web audio service.</p></div>' +
    '<button class="button button-secondary audio-admin-back" type="button" data-action="audio-admin-back">' + icon("back") + "Back to broadcasts</button></section>" +
    '<section class="panel audio-admin-settings"><div class="audio-brand-preview"><img src="../assets/consolation-launcher.png" alt="" width="58" height="58"><div><strong>Consolation Evangelical and Revival Church</strong><span>Occupy Till I Come · Existing app branding</span></div></div>' +
    '<form id="audio-categories-form"><div class="admin-field"><label for="audio-categories">Programme categories</label><textarea class="form-textarea" id="audio-categories" name="categories" rows="5">' +
    escapeHtml(data.categories.join(", ")) + '</textarea><p class="field-hint">Separate categories with commas. Existing broadcasts keep their current category label.</p></div><button class="button button-primary" type="submit">Save categories</button></form></section>';
}

function renderLiveAudioContent() {
  if (!cachedData) {
    if (!loadingPromise) void refreshAdminData().catch(() => {});
    return '<section class="audio-admin-empty" role="status"><h2>' +
      (loadError ? "Live Audio setup needs attention" : "Loading Live Audio…") + "</h2><p>" +
      escapeHtml(loadError || "Connecting to the church broadcast service.") + "</p>" +
      (loadError ? '<button class="button button-primary" type="button" data-action="audio-admin-retry">Retry</button>' : "") + "</section>";
  }
  if (wizardStep === 1 && editingId !== null) return renderProgramDetails(cachedData);
  if (wizardStep === 2 && editingId !== null) return renderBroadcastSettings(cachedData);
  if (activeTab === "settings") return renderSettings(cachedData);
  const tabs = '<div class="audio-admin-tabs" role="group" aria-label="Filter broadcasts">' +
    tabButton("programs", "All broadcasts") + tabButton("drafts", "Drafts") +
    tabButton("published", "Published") + tabButton("settings", "Settings") + "</div>";
  const title = activeTab === "drafts" ? "Drafts" : activeTab === "published" ? "Published broadcasts" : "Broadcast management";
  return '<section><div class="page-heading"><div><h1>Live Audio</h1><p>Web-only microphone broadcasts for Consolation Evangelical and Revival Church.</p></div>' +
    '<button class="button button-secondary audio-admin-back" type="button" data-action="navigate" data-view="dashboard">' + icon("back") + "Back to admin dashboard</button></div>" +
    renderStats(cachedData) + tabs + '<div class="audio-admin-toolbar"><div><h2>' + title + '</h2><p>Programme details, microphone setup, and WebRTC broadcast control.</p></div>' +
    '<div class="audio-admin-toolbar-actions">' +
    (activeTab === "drafts" ? '<button class="button button-secondary" type="button" data-action="audio-admin-export">Export drafts</button>' : "") +
    '<button class="button button-primary" type="button" data-action="audio-admin-new">' + icon("radio") + "Go live</button></div></div>" +
    (activeBroadcaster ? '<p class="audio-live-admin-banner" role="status"><span class="live-dot"></span>Broadcast is live. Keep this browser tab open while streaming.</p>' : "") +
    renderProgramRows(cachedData) + "</section>";
}

function rerender() {
  const content = document.getElementById("admin-content");
  if (content) content.innerHTML = renderLiveAudioAdmin();
  if (activeBroadcaster) {
    const status = document.querySelector("[data-audio-mic-status]");
    if (status) status.textContent = "Broadcast is live.";
  }
}

function updateMeter() {
  if (!activeMicEngine) return;
  const meter = document.querySelector(".audio-mic-meter");
  const level = document.querySelector("[data-audio-mic-level]");
  const canvas = document.querySelector("[data-audio-waveform]");
  const percent = activeMicEngine.level();
  if (meter) meter.setAttribute("aria-valuenow", String(percent));
  if (level) level.style.width = percent + "%";
  if (canvas) {
    const context = canvas.getContext("2d");
    const samples = activeMicEngine.waveform();
    const width = canvas.width;
    const height = canvas.height;
    context.clearRect(0, 0, width, height);
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--surface-soft").trim() || "#f8f6fa";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--purple").trim() || "#70409b";
    context.lineWidth = 2;
    context.beginPath();
    for (let i = 0; i < samples.length; i += 1) {
      const x = (i / (samples.length - 1)) * width;
      const y = (samples[i] / 255) * height;
      if (i === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }
  activeMicFrame = requestAnimationFrame(updateMeter);
}

async function ensureMicEngine() {
  if (activeMicEngine) return activeMicEngine;
  activeMicEngine = await createLiveAudioMicEngine({ settings: audioSettings });
  const status = document.querySelector("[data-audio-mic-status]");
  if (status) status.textContent = activeMicEngine.pitchAvailable
    ? "Microphone is on. Speak to check your voice and waveform."
    : "Microphone is on. EQ and level work; pitch shift is not supported in this browser.";
  const startButton = document.querySelector('[data-action="audio-admin-mic-test"]');
  const stopButton = document.querySelector('[data-action="audio-admin-mic-stop"]');
  if (startButton) startButton.hidden = true;
  if (stopButton) stopButton.hidden = false;
  updateMeter();
  return activeMicEngine;
}

async function startMicTest() {
  try {
    await ensureMicEngine();
  } catch (error) {
    const status = document.querySelector("[data-audio-mic-status]");
    if (status) status.textContent = error.message || "The microphone check could not start.";
    else toast(error.message || "The microphone check could not start.");
  }
}

export async function stopAdminAudioMicTest() {
  if (activeBroadcaster) return;
  if (activeMicFrame) cancelAnimationFrame(activeMicFrame);
  activeMicFrame = null;
  if (activeMicEngine) await activeMicEngine.stop();
  activeMicEngine = null;
  const status = document.querySelector("[data-audio-mic-status]");
  const level = document.querySelector("[data-audio-mic-level]");
  const meter = document.querySelector(".audio-mic-meter");
  const startButton = document.querySelector('[data-action="audio-admin-mic-test"]');
  const stopButton = document.querySelector('[data-action="audio-admin-mic-stop"]');
  if (status) status.textContent = "Microphone is off.";
  if (level) level.style.width = "0%";
  if (meter) meter.setAttribute("aria-valuenow", "0");
  if (startButton) startButton.hidden = false;
  if (stopButton) stopButton.hidden = true;
}

function downloadDrafts() {
  const drafts = cachedData.programs.filter(program => program.status === "draft");
  const blob = new Blob([JSON.stringify(drafts, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "consolation-audio-drafts.json";
  link.click();
  URL.revokeObjectURL(url);
}

async function beginBroadcast(programId) {
  const program = cachedData.programs.find(item => item.id === programId);
  if (!program) throw new Error("Choose a saved programme first.");
  const mic = await ensureMicEngine();
  const sessionId = createLiveAudioId();
  const publisher = await startLiveAudioPublisher({
    programId,
    sessionId,
    stream: mic.stream,
    onStatus: status => {
      const node = document.querySelector("[data-audio-mic-status]");
      if (node && status === "connected") node.textContent = "Connected. Waiting for listeners…";
      if (node && status === "disconnected" && activeBroadcaster) node.textContent = "Signaling disconnected; broadcast may no longer reach new listeners.";
    },
    onListenerCount: count => {
      const node = document.querySelector("[data-audio-listener-count]");
      if (node) node.textContent = count + (count === 1 ? " listener connected" : " listeners connected");
    }
  });
  try {
    await startAdminLiveAudioProgram(programId, sessionId);
    activeBroadcaster = publisher;
    activeBroadcastId = programId;
    cachedData = await loadAdminLiveAudioData();
    editingId = programId;
    wizardStep = 2;
    rerender();
    const status = document.querySelector("[data-audio-mic-status]");
    if (status) status.textContent = "Broadcast is live. Keep this browser tab open while streaming.";
    toast("You are live. Listeners can now join from the web Listen page.");
  } catch (error) {
    await publisher.stop();
    throw error;
  }
}

async function endBroadcast(programId) {
  if (!window.confirm("End this live broadcast now? Listeners will be disconnected.")) return false;
  if (activeBroadcaster && activeBroadcastId === programId) {
    await activeBroadcaster.stop();
    activeBroadcaster = null;
    activeBroadcastId = null;
    if (activeMicFrame) cancelAnimationFrame(activeMicFrame);
    activeMicFrame = null;
    if (activeMicEngine) await activeMicEngine.stop();
    activeMicEngine = null;
  }
  await endAdminLiveAudioProgram(programId);
  cachedData = await loadAdminLiveAudioData();
  rerender();
  toast("Broadcast ended.");
  return true;
}

export async function handleLiveAudioAdminAction(button) {
  const action = button.dataset.action;
  if (action === "audio-admin-retry") {
    cachedData = null;
    loadError = "";
    await refreshAdminData().catch(error => toast(error.message));
    return true;
  }
  if (action === "audio-admin-tab") {
    activeTab = button.dataset.tab;
    editingId = null;
    wizardStep = 1;
    await stopAdminAudioMicTest();
    rerender();
    return true;
  }
  if (action === "audio-admin-new") {
    editingId = "new";
    wizardStep = 1;
    await stopAdminAudioMicTest();
    rerender();
    return true;
  }
  if (action === "audio-admin-edit" || action === "audio-admin-go-live") {
    editingId = button.dataset.id;
    wizardStep = 1;
    audioSettings = Object.assign({}, DEFAULT_AUDIO_SETTINGS);
    await stopAdminAudioMicTest();
    rerender();
    return true;
  }
  if (action === "audio-admin-back") {
    await stopAdminAudioMicTest();
    editingId = null;
    wizardStep = 1;
    activeTab = "programs";
    rerender();
    return true;
  }
  if (action === "audio-admin-publish") {
    const program = cachedData.programs.find(item => item.id === button.dataset.id);
    if (!program || !window.confirm('Publish "' + program.title + '" on the web Listen page?')) return true;
    try {
      await setAdminLiveAudioStatus(program.id, "published");
      cachedData = await loadAdminLiveAudioData();
      rerender();
      toast("Programme published.");
    } catch (error) { toast(error.message || "The programme could not be published."); }
    return true;
  }
  if (action === "audio-admin-delete") {
    const program = cachedData.programs.find(item => item.id === button.dataset.id);
    if (!program || !window.confirm('Delete "' + program.title + '" and its comments/reactions?')) return true;
    try {
      if (program.onAir && !await endBroadcast(program.id)) return true;
      await deleteAdminLiveAudioProgram(program.id);
      cachedData = await loadAdminLiveAudioData();
      rerender();
      toast("Broadcast deleted.");
    } catch (error) { toast(error.message || "The broadcast could not be deleted."); }
    return true;
  }
  if (action === "audio-admin-export") {
    const drafts = cachedData.programs.filter(program => program.status === "draft");
    if (!drafts.length) toast("There are no drafts to export.");
    else if (window.confirm("Download " + drafts.length + " draft broadcast(s) as JSON?")) downloadDrafts();
    return true;
  }
  if (action === "audio-admin-mic-test") {
    await startMicTest();
    return true;
  }
  if (action === "audio-admin-mic-stop") {
    await stopAdminAudioMicTest();
    return true;
  }
  if (action === "audio-admin-go-live-now") {
    try { await beginBroadcast(button.dataset.id); }
    catch (error) { toast(error.message || "The broadcast could not start."); }
    return true;
  }
  if (action === "audio-admin-stop-live") {
    try { await endBroadcast(button.dataset.id); }
    catch (error) { toast(error.message || "The broadcast could not be ended."); }
    return true;
  }
  if (action === "audio-admin-save-draft") {
    if (!editingId || editingId === "new") return true;
    try {
      await setAdminLiveAudioStatus(editingId, "draft");
      cachedData = await loadAdminLiveAudioData();
      editingId = null;
      wizardStep = 1;
      rerender();
      toast("Draft saved.");
    } catch (error) { toast(error.message || "Draft could not be saved."); }
    return true;
  }
  return false;
}

export async function handleLiveAudioAdminSubmit(event) {
  if (event.target.id === "live-audio-program-form") {
    event.preventDefault();
    const form = event.target;
    const values = Object.fromEntries(new FormData(form).entries());
    const existing = editingId && editingId !== "new" ? editingId : "";
    const submitter = event.submitter;
    const next = Boolean(submitter && submitter.dataset.audioNext === "true");
    const status = submitter && submitter.dataset.audioStatus === "draft" ? "draft" : "draft";
    try {
      const saved = await saveAdminLiveAudioProgram(Object.assign({}, values, { id: existing, status }));
      cachedData = await loadAdminLiveAudioData();
      if (next) {
        editingId = saved.id;
        wizardStep = 2;
        audioSettings = Object.assign({}, DEFAULT_AUDIO_SETTINGS);
      } else {
        editingId = null;
        wizardStep = 1;
        activeTab = "drafts";
        toast("Programme saved as a draft.");
      }
      rerender();
    } catch (error) {
      toast(error.message || "Programme details could not be saved.");
    }
    return true;
  }
  if (event.target.id === "audio-categories-form") {
    event.preventDefault();
    const categories = event.target.elements.categories.value.split(",").map(value => value.trim()).filter(Boolean);
    try {
      await saveAdminLiveAudioCategories(categories);
      cachedData = await loadAdminLiveAudioData();
      rerender();
      toast("Broadcast categories saved.");
    } catch (error) {
      toast(error.message || "Categories could not be saved.");
    }
    return true;
  }
  return false;
}

if (typeof document !== "undefined" && document.addEventListener) {
  document.addEventListener("input", event => {
    const input = event.target;
    if (!input || !input.matches || !input.matches("[data-audio-control]")) return;
    const key = input.dataset.audioControl;
    audioSettings[key] = Number(input.value);
    const output = document.querySelector('[data-audio-output="' + key + '"]');
    const unit = key === "pitch" ? " st" : " dB";
    if (output) output.value = input.value + unit;
    if (activeMicEngine) activeMicEngine.setSettings(audioSettings);
  });
}

export function renderLiveAudioAdmin() {
  return renderLiveAudioContent();
}
