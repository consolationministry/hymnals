import {
  deleteAdminLiveAudioProgram,
  endAdminLiveAudioProgram,
  loadAdminLiveAudioInteractions,
  loadAdminLiveAudioData,
  saveAdminLiveAudioCategories,
  saveAdminLiveAudioProgram,
  setAdminLiveAudioStatus,
  startAdminLiveAudioProgram,
  uploadAdminLiveAudioRecording
} from "./live-audio-admin-data.js";
import { createLiveAudioId } from "../../js/live-audio-realtime.js";
import { startLiveAudioRecording } from "../../js/live-audio-recording.js?v=1";
import { createLiveAudioMicEngine, DEFAULT_AUDIO_SETTINGS, startLiveAudioPublisher } from "../../js/live-audio-webrtc.js?v=2";

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
let activeRecording = null;
let activeRecordingSessionId = null;
let audioSettings = Object.assign({}, DEFAULT_AUDIO_SETTINGS);
let activeMicMuted = false;
let activeListenerCount = 0;
let activeSignalStatus = "connecting";
let studioInteractions = null;
let studioInteractionsError = "";
let studioRefreshTimer = null;
let studioClockTimer = null;
let studioVisible = false;
let availableMicrophones = [];
let selectedMicrophoneId = "";
let microphoneScanPending = false;

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

function formatElapsed(value) {
  const startedAt = new Date(value || "").getTime();
  if (!Number.isFinite(startedAt)) return "00:00:00";
  const seconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return [hours, minutes, seconds % 60].map(part => String(part).padStart(2, "0")).join(":");
}

function formatClock(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}

function safeImageUrl(value) {
  try {
    const parsed = new URL(String(value || "").trim());
    return parsed.protocol === "https:" ? parsed.href : "";
  } catch (error) {
    return "";
  }
}

function studioConnectionLabel() {
  if (activeSignalStatus === "connected") return "Audio room connected";
  if (activeSignalStatus === "disconnected") return "Reconnecting signal";
  return "Connecting audio room";
}

function renderStudioComments(comments) {
  if (!Array.isArray(comments) || !comments.length) {
    return '<div class="audio-studio-chat-empty"><span aria-hidden="true">✦</span><strong>No listener comments yet</strong><p>New comments will appear here while you’re live.</p></div>';
  }
  return comments.map(comment =>
    '<article class="audio-studio-comment"><span class="audio-studio-comment-avatar" aria-hidden="true">L</span><div class="audio-studio-comment-body">' +
    '<div class="audio-studio-comment-meta"><strong>Listener</strong><time datetime="' + escapeHtml(comment.createdAt) + '">' +
    escapeHtml(formatClock(comment.createdAt)) + '</time></div><p>' + escapeHtml(comment.body) + "</p></div></article>"
  ).join("");
}

function icon(name) {
  const paths = {
    radio: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v10a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z"/><path d="m7 5 10-3M8 15h8"/><circle cx="8" cy="10" r="1.7"/>',
    back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    mic: '<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',
    wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0M8.5 16.1a5.5 5.5 0 0 1 7 0M12 20h.01"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
    speaker: '<path d="M4 10v4h4l5 4V6l-5 4H4Z"/><path d="M17 9a5 5 0 0 1 0 6M19 6a9 9 0 0 1 0 12"/>',
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
  const image = item.imageUrl
    ? '<img data-preview-image src="' + escapeHtml(item.imageUrl) + '" alt="" loading="lazy">'
    : '<img data-preview-image src="" alt="" hidden>';
  return '<section class="audio-admin-form-wrap audio-broadcast-setup"><div class="audio-broadcast-heading">' +
    '<button class="audio-broadcast-back" type="button" data-action="audio-admin-back">' + icon("back") + "Back to broadcasts</button>" +
    '<div class="audio-broadcast-heading-row"><div><p class="audio-wizard-step">LIVE AUDIO · SETUP</p><h1>' +
    (existing ? "Edit Broadcast" : "Create New Broadcast") +
    '</h1><p>Set up your programme details before testing the microphone.</p></div>' +
    '<div class="audio-broadcast-steps" aria-label="Broadcast setup progress"><span class="is-current"><b>1</b> Details</span><i></i><span><b>2</b> Mic test</span><i></i><span><b>3</b> Go live</span></div></div></div>' +
    '<div class="audio-broadcast-layout"><form class="audio-broadcast-form" id="live-audio-program-form">' +
    '<section class="audio-broadcast-card audio-broadcast-intro-card" aria-label="Broadcast thumbnail and description">' +
    '<div class="audio-thumbnail-column"><label class="audio-broadcast-label" for="audio-image">Broadcast thumbnail</label>' +
    '<div class="audio-thumbnail-preview">' + image + '<div data-preview-placeholder ' + (item.imageUrl ? "hidden" : "") + '><img src="../assets/demo-church-mark.svg" alt=""><span>Programme artwork</span></div>' +
    '<span class="audio-preview-badge">DRAFT</span></div>' +
    '<div class="audio-thumbnail-url"><label for="audio-image">Thumbnail image URL</label><input class="form-input" id="audio-image" name="imageUrl" type="url" inputmode="url" placeholder="https://…" value="' + escapeHtml(item.imageUrl) + '">' +
    '<small>Use an HTTPS image address. Uploads aren’t enabled in the existing programme storage.</small></div></div>' +
    '<div class="audio-broadcast-primary-fields"><div class="admin-field"><label for="audio-title">Broadcast title <span aria-hidden="true">*</span></label>' +
    '<input class="form-input" id="audio-title" name="title" maxlength="120" value="' + escapeHtml(item.title) + '" placeholder="e.g. Sunday Worship Live" required>' +
    '<small class="audio-character-count"><span data-title-count>' + String(item.title.length) + '</span>/120</small></div>' +
    '<div class="admin-field"><label for="audio-description">Description</label><textarea class="form-textarea" id="audio-description" name="description" rows="4" maxlength="500" placeholder="Tell listeners what to expect…">' +
    escapeHtml(item.description) + '</textarea><small class="audio-character-count"><span data-description-count>' + String(item.description.length) + '</span>/500</small></div></div></section>' +
    '<section class="audio-broadcast-card"><h2 class="audio-broadcast-card-title">Broadcast details</h2><div class="audio-broadcast-details-grid">' +
    '<div class="admin-field"><label for="audio-speaker">Minister / Preacher</label><input class="form-input" id="audio-speaker" name="speaker" maxlength="100" value="' + escapeHtml(item.speaker) + '" placeholder="Minister name"></div>' +
    '<div class="admin-field"><label for="audio-venue">Venue / Location</label><input class="form-input" id="audio-venue" name="venue" maxlength="140" value="' + escapeHtml(item.venue) + '" placeholder="Main sanctuary"></div>' +
    '<div class="admin-field"><label for="audio-date">Broadcast date</label><input class="form-input" id="audio-date" name="date" type="date" value="' + escapeHtml(item.date) + '"></div>' +
    '<div class="admin-field"><label for="audio-category">Programme / Service type</label><select class="form-select" id="audio-category" name="category">' + categories + "</select>" +
    '<small class="audio-field-note">This selection is also shown as the programme category.</small></div></div></section>' +
    '<div class="audio-broadcast-form-footer"><button class="button button-secondary" type="button" data-action="audio-admin-back">Cancel</button>' +
    '<div><button class="button button-secondary" type="submit" data-audio-status="draft">Save draft</button>' +
    '<button class="button button-primary" type="submit" data-audio-next="true">Next: Configure Stream <span aria-hidden="true">›</span></button></div></div></form>' +
    '<aside class="audio-broadcast-aside"><section class="audio-broadcast-preview-card" aria-label="Broadcast preview"><h2>Broadcast Preview</h2>' +
    '<div class="audio-broadcast-cover">' + image.replace("data-preview-image", "data-preview-image-copy") +
    '<div data-preview-placeholder-copy ' + (item.imageUrl ? "hidden" : "") + '><img src="../assets/demo-church-mark.svg" alt=""><span>Consolation Evangelical<br>and Revival Church</span></div>' +
    '<span class="audio-preview-badge">DRAFT</span><div class="audio-broadcast-cover-title" data-preview-title>' + escapeHtml(item.title || "Your broadcast title") + "</div></div>" +
    '<h3 data-preview-summary-title>' + escapeHtml(item.title || "Your broadcast title") + '</h3><p class="audio-preview-summary-speaker" data-preview-speaker>' +
    escapeHtml(item.speaker || "Minister to be announced") + '</p><div class="audio-preview-tags"><span data-preview-category>' + escapeHtml(item.category || "Other") +
    '</span><span data-preview-status>Draft</span></div><dl class="audio-preview-summary">' +
    '<div><dt>Venue</dt><dd data-preview-venue>' + escapeHtml(item.venue || "Venue not set") + '</dd></div>' +
    '<div><dt>Date</dt><dd data-preview-date>' + escapeHtml(item.date ? formatDate(item.date) : "Date not set") + '</dd></div>' +
    '<div><dt>Programme</dt><dd data-preview-programme>' + escapeHtml(item.category || "Other") + "</dd></div></dl></section>" +
    '<section class="audio-broadcast-tips"><h2>Quick tips</h2><ul><li>Use a clear 16:9 image URL for the thumbnail.</li>' +
    '<li>Keep the title and description easy to scan.</li><li>You can review the microphone before going live.</li></ul></section></aside></div></section>';
}

function updateBroadcastPreview(form) {
  if (!form || !form.querySelector) return;
  const values = Object.fromEntries(new FormData(form).entries());
  const setText = (selector, value, fallback) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value || fallback;
  };
  const title = String(values.title || "").trim();
  const speaker = String(values.speaker || "").trim();
  const venue = String(values.venue || "").trim();
  const category = String(values.category || "").trim();
  const date = String(values.date || "").trim();
  setText("[data-preview-title]", title, "Your broadcast title");
  setText("[data-preview-summary-title]", title, "Your broadcast title");
  setText("[data-preview-speaker]", speaker, "Minister to be announced");
  setText("[data-preview-venue]", venue, "Venue not set");
  setText("[data-preview-date]", date ? formatDate(date) : "", "Date not set");
  setText("[data-preview-category]", category, "Other");
  setText("[data-preview-programme]", category, "Other");
  const count = document.querySelector("[data-description-count]");
  if (count) count.textContent = String(String(values.description || "").length);
  const titleCount = document.querySelector("[data-title-count]");
  if (titleCount) titleCount.textContent = String(title.length);
  const image = document.querySelector("[data-preview-image]");
  const imageCopy = document.querySelector("[data-preview-image-copy]");
  const placeholder = document.querySelector("[data-preview-placeholder]");
  const placeholderCopy = document.querySelector("[data-preview-placeholder-copy]");
  let safeImageUrl = "";
  try {
    const parsed = new URL(String(values.imageUrl || "").trim());
    if (parsed.protocol === "https:") safeImageUrl = parsed.href;
  } catch (error) {}
  [image, imageCopy].forEach(node => {
    if (!node) return;
    if (safeImageUrl) {
      node.src = safeImageUrl;
      node.hidden = false;
    } else {
      node.removeAttribute("src");
      node.hidden = true;
    }
  });
  [placeholder, placeholderCopy].forEach(node => { if (node) node.hidden = Boolean(safeImageUrl); });
}

function rangeControl(id, label, min, max, step, value, unit) {
  return '<label class="audio-control" for="audio-control-' + id + '"><span><strong>' + label +
    '</strong><output data-audio-output="' + id + '">' + value + unit + '</output></span><input id="audio-control-' +
    id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value +
    '" data-audio-control="' + id + '"><span class="audio-control-ends"><small>' + min + unit + "</small><small>" + max + unit + "</small></span></label>";
}

function renderHealthRow(label, value, healthy, iconName) {
  return '<div class="audio-health-row"><span class="audio-health-icon">' + icon(iconName) + '</span><span class="audio-health-copy"><strong>' +
    label + '</strong><small>' + value + '</small></span><span class="audio-health-state' +
    (healthy ? " is-healthy" : " is-warning") + '">' + (healthy ? "Ready" : "Check") + "</span></div>";
}

function renderMicrophoneOptions() {
  const options = ['<option value="">System default microphone</option>'];
  availableMicrophones.forEach((device, index) => {
    const label = device.label || "Microphone " + (index + 1);
    options.push('<option value="' + escapeHtml(device.deviceId) + '"' +
      (device.deviceId === selectedMicrophoneId ? " selected" : "") + ">" + escapeHtml(label) + "</option>");
  });
  return options.join("");
}

async function refreshMicrophoneOptions() {
  if (microphoneScanPending || typeof navigator === "undefined" ||
      !navigator.mediaDevices || typeof navigator.mediaDevices.enumerateDevices !== "function") return;
  const select = document.querySelector("[data-audio-mic-select]");
  if (!select) return;
  microphoneScanPending = true;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    availableMicrophones = devices.filter(device => device.kind === "audioinput");
    select.innerHTML = renderMicrophoneOptions();
    select.value = selectedMicrophoneId;
  } catch (error) {
    // Device names are optional; the browser's default microphone remains available.
  } finally {
    microphoneScanPending = false;
  }
}

function renderBroadcastSettings(data) {
  const program = data.programs.find(item => item.id === editingId);
  if (!program) return '<div class="audio-admin-empty"><h2>Programme not found</h2><p>Go back and choose a broadcast again.</p></div>';
  const isLive = program.onAir;
  const browser = typeof navigator === "undefined" ? null : navigator;
  const secure = typeof window !== "undefined" && window.isSecureContext === true;
  const online = browser ? browser.onLine !== false : false;
  const micSupported = Boolean(browser && browser.mediaDevices && typeof browser.mediaDevices.getUserMedia === "function");
  const audioSupported = typeof AudioContext === "function" ||
    (typeof window !== "undefined" && typeof window.webkitAudioContext === "function");
  const webrtcSupported = typeof RTCPeerConnection === "function" ||
    (typeof window !== "undefined" && typeof window.RTCPeerConnection === "function");
  const canGoLive = secure && online && micSupported && audioSupported && webrtcSupported;
  const micReady = Boolean(activeMicEngine || activeBroadcaster);
  const readyToBroadcast = micReady && canGoLive;
  const previewImage = program.imageUrl
    ? '<img class="audio-stream-artwork" src="' + escapeHtml(program.imageUrl) + '" alt="" loading="lazy">'
    : '<div class="audio-stream-artwork-placeholder"><img src="../assets/demo-church-mark.svg" alt=""><span>Consolation Evangelical<br>and Revival Church</span></div>';
  const liveStatus = isLive
    ? (activeBroadcastId === program.id ? "Broadcast is live. Keep this browser tab open." : "Marked live, but this session is not connected.")
    : activeMicEngine ? "Microphone is working. Audio stays local until you go live." : "Test your microphone before going live.";
  return '<section class="audio-mic-test-page">' +
    '<header class="audio-mic-test-heading"><button class="audio-broadcast-back" type="button" data-action="audio-admin-back-to-details">' +
    icon("back") + "Back to Broadcast Settings</button>" +
    '<div class="audio-mic-test-heading-row"><div class="audio-mic-title"><span class="audio-mic-title-icon">' + icon("mic") + '</span><div>' +
    '<p class="audio-wizard-step">LIVE AUDIO · SETUP</p><h1>Mic &amp; Audio Test</h1><p>Test your microphone and adjust audio before going live.</p></div></div>' +
    '<div class="audio-broadcast-steps audio-mic-progress" aria-label="Broadcast setup progress">' +
    '<span class="is-complete"><b>' + icon("check") + '</b>Settings</span><i></i><span class="is-current"><b>2</b>Mic Test</span>' +
    '<i></i><span><b>3</b>Preview</span><i></i><span><b>4</b>Go Live</span></div></div></header>' +
    '<div class="audio-mic-test-layout"><div class="audio-mic-main">' +
    '<section class="audio-mic-check-card" aria-labelledby="audio-mic-check-title">' +
    '<div class="audio-mic-check-controls"><div class="audio-mic-check-intro"><span class="audio-mic-test-icon">' + icon("mic") + '</span><div>' +
    '<h2 id="audio-mic-check-title">Microphone Test</h2><p>Speak to check your audio input.</p></div></div>' +
    '<div class="audio-mic-status-pill' + (micReady ? " is-ready" : "") + '" data-audio-ready-status>' +
    '<span class="audio-status-dot"></span>' + (micReady ? "Microphone is working" : "Microphone not tested") + '</div>' +
    '<label class="audio-device-select" for="audio-mic-device"><span>Select microphone</span><select id="audio-mic-device" data-audio-mic-select>' +
    renderMicrophoneOptions() + '</select></label>' +
    '<div class="audio-mic-actions">' + (isLive
      ? '<span class="audio-mic-live-indicator"><i></i>Broadcast is live</span>'
      : '<button class="button button-secondary" type="button" data-action="audio-admin-mic-test">' +
        (activeMicEngine ? "Test Again" : "Test microphone") + '</button><button class="button button-secondary" type="button" data-action="audio-admin-mic-stop" ' +
        (activeMicEngine && !activeBroadcaster ? "" : "hidden") + '>Stop test</button>') + '</div></div>' +
    '<div class="audio-mic-visual"><div class="audio-mic-visual-heading"><strong>Audio Preview</strong><span>Input level only · no local playback</span></div>' +
    '<canvas class="audio-waveform audio-mic-waveform" data-audio-waveform width="760" height="150" aria-label="Live microphone waveform" role="img"></canvas>' +
    '<div class="audio-mic-meter" role="meter" aria-label="Microphone input level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span data-audio-mic-level></span></div>' +
    '<p class="audio-mic-status" data-audio-mic-status role="status" aria-live="polite">' + escapeHtml(liveStatus) + '</p>' +
    (isLive ? '<p class="audio-listener-count" data-audio-listener-count>0 listeners connected</p>' : "") + '</div></section>' +
    '<section class="panel audio-mixer-panel"><header class="panel-header"><div><h2>Audio Editing &amp; Effects</h2><p>Adjust the voice signal before it reaches listeners.</p></div></header>' +
    '<div class="audio-mixer-grid">' + rangeControl("bass", "Bass", -12, 12, 1, audioSettings.bass, " dB") +
    rangeControl("treble", "Treble", -12, 12, 1, audioSettings.treble, " dB") +
    rangeControl("mid", "Mid", -12, 12, 1, audioSettings.mid, " dB") +
    rangeControl("pitch", "Pitch", -4, 4, 1, audioSettings.pitch, " st") +
    rangeControl("gain", "Mic level", -12, 6, 1, audioSettings.gain, " dB") + '</div>' +
    '<p class="field-hint">Adjustments are applied to the outgoing broadcast. Pitch shift depends on browser audio-worklet support.</p></section>' +
    '<div class="audio-mic-check-grid"><section class="panel audio-mic-device-check"><header class="panel-header"><div><h2>Audio Device Check</h2><p>Make sure your input and browser are ready.</p></div></header>' +
    '<div class="audio-check-status-grid">' + renderHealthRow("Microphone", micReady ? "Connected" : "Test required", micReady, "mic") +
    renderHealthRow("Audio processing", audioSupported ? "Supported" : "Unavailable", audioSupported, "speaker") +
    renderHealthRow("Connection security", secure ? "HTTPS browser context" : "HTTPS required", secure, "shield") + '</div></section>' +
    '<section class="panel audio-mic-system-check"><header class="panel-header"><div><h2>System Check</h2><p>Live connection requirements.</p></div></header>' +
    '<div class="audio-system-status-list">' + renderHealthRow("Browser network status", online ? "Online" : "Offline", online, "wifi") +
    renderHealthRow("WebRTC audio", webrtcSupported ? "Available" : "Not supported", webrtcSupported, "radio") + '</div>' +
    '<p class="audio-system-note">Some networks may block direct WebRTC audio; a TURN relay may be needed.</p></section></div></div>' +
    '<aside class="audio-mic-side">' +
    '<section class="audio-live-preview-card"><header class="audio-side-heading"><h2>Live Preview</h2><span class="audio-preview-mode"><i></i>' +
    (isLive ? "On Air" : "Preview Mode") + '</span></header><div class="audio-stream-artwork-wrap">' + previewImage +
    '<span class="audio-stream-badge' + (isLive ? " is-live" : "") + '">' + (isLive ? "LIVE" : "PREVIEW") + '</span>' +
    '<div class="audio-stream-artwork-copy"><strong>' + escapeHtml(program.title) + '</strong><span>Consolation Evangelical and Revival Church</span></div></div></section>' +
    '<section class="audio-stream-details-card"><header class="audio-side-heading"><h2>Stream Details</h2></header><dl class="audio-stream-details">' +
    '<div><dt>' + icon("radio") + 'Title</dt><dd>' + escapeHtml(program.title) + '</dd></div>' +
    '<div><dt>' + icon("mic") + 'Minister</dt><dd>' + escapeHtml(program.speaker || "Not set") + '</dd></div>' +
    '<div><dt>' + icon("shield") + 'Venue</dt><dd>' + escapeHtml(program.venue || "Not set") + '</dd></div>' +
    '<div><dt>' + icon("check") + 'Date</dt><dd>' + escapeHtml(program.date ? formatDate(program.date) : "Not set") + '</dd></div>' +
    '<div><dt>' + icon("wifi") + 'Category</dt><dd>' + escapeHtml(program.category || "Other") + '</dd></div></dl></section>' +
    '<section class="audio-network-status-card"><header class="audio-side-heading"><h2>Network &amp; Audio Status</h2></header><div class="audio-network-status-list">' +
    renderHealthRow("Browser network status", online ? "Online" : "Offline", online, "wifi") +
    renderHealthRow("Microphone", micReady ? "Input detected" : "Test required", micReady, "mic") +
    renderHealthRow("WebRTC", webrtcSupported ? "Supported" : "Unavailable", webrtcSupported, "radio") + '</div></section>' +
    '<section class="audio-go-live-card"><span class="audio-go-live-mark">' + icon(micReady || isLive ? "check" : "mic") + '</span>' +
    '<h2>' + (isLive ? "You’re Live!" : readyToBroadcast ? "You’re Ready!" : "Ready when you are") + '</h2>' +
    '<p>' + (isLive ? "Listeners can join from the public Listen page." : readyToBroadcast ? "Your microphone is working. Start the broadcast when ready." : "Test your microphone, then start the broadcast.") + '</p>' +
    (isLive
      ? '<button class="button button-secondary audio-admin-stop audio-go-live-button" type="button" data-action="audio-admin-stop-live" data-id="' + escapeHtml(program.id) + '">End Broadcast</button>'
      : '<button class="button button-primary audio-go-live-button" type="button" data-action="audio-admin-go-live-now" data-id="' + escapeHtml(program.id) + '"' + (canGoLive ? "" : " disabled") + '>' + icon("radio") + 'Go Live <span aria-hidden="true">›</span></button>') +
    '<p class="audio-go-live-note">' + (canGoLive ? "Your mic is only sent to listeners after you go live." : "Use HTTPS with an online browser that supports microphone and WebRTC audio.") + '</p></section>' +
    '</aside></div></section>';
}

function renderSettings(data) {
  return '<section class="page-heading"><div><h1>Broadcast settings</h1><p>Manage programme categories for the web audio service.</p></div>' +
    '<button class="button button-secondary audio-admin-back" type="button" data-action="audio-admin-back">' + icon("back") + "Back to broadcasts</button></section>" +
    '<section class="panel audio-admin-settings"><div class="audio-brand-preview"><img src="../assets/consolation-launcher.png" alt="" width="58" height="58"><div><strong>Consolation Evangelical and Revival Church</strong><span>Occupy Till I Come · Existing app branding</span></div></div>' +
    '<form id="audio-categories-form"><div class="admin-field"><label for="audio-categories">Programme categories</label><textarea class="form-textarea" id="audio-categories" name="categories" rows="5">' +
    escapeHtml(data.categories.join(", ")) + '</textarea><p class="field-hint">Separate categories with commas. Existing broadcasts keep their current category label.</p></div><button class="button button-primary" type="submit">Save categories</button></form></section>';
}

export function renderLiveAudioStudio(program) {
  const imageUrl = safeImageUrl(program.imageUrl);
  const artwork = imageUrl
    ? '<img class="audio-studio-artwork" src="' + escapeHtml(imageUrl) + '" alt="" loading="lazy">'
    : '<img class="audio-studio-artwork audio-studio-artwork-fallback" src="../assets/demo-church-mark.svg" alt="" loading="lazy">';
  const interactions = studioInteractions;
  const reactionTotal = interactions
    ? interactions.loveCount + interactions.clapCount + interactions.fireCount
    : null;
  const duration = formatElapsed(program.liveStartedAt);
  return '<section class="audio-live-studio" aria-label="Live Audio control room">' +
    '<header class="audio-studio-header"><div><p class="audio-studio-kicker">ON AIR CONTROL ROOM</p><h1>Live Audio Studio</h1><p>Monitor your microphone and listener activity while the service is live.</p></div>' +
    '<div class="audio-studio-header-actions"><button class="button button-secondary" type="button" data-action="audio-admin-back">' + icon("back") + 'Back to broadcasts</button>' +
    '<button class="button audio-studio-end" type="button" data-action="audio-admin-stop-live" data-id="' + escapeHtml(program.id) + '">End broadcast</button></div></header>' +
    '<div class="audio-studio-layout"><div class="audio-studio-main">' +
    '<section class="audio-studio-stage" aria-label="Live audio programme"><div class="audio-studio-artwork-wrap">' + artwork + '<div class="audio-studio-artwork-shade"></div>' +
    '<div class="audio-studio-stage-content"><span class="audio-studio-live-pill"><i></i> LIVE</span>' +
    '<p class="audio-studio-church">CONSOLATION EVANGELICAL AND REVIVAL CHURCH</p><h2>' + escapeHtml(program.title) + '</h2>' +
    '<p class="audio-studio-program-meta">' + escapeHtml(program.speaker || "Minister not set") + " · " + escapeHtml(program.category) + '</p>' +
    '<div class="audio-studio-wave-wrap"><canvas class="audio-waveform audio-studio-waveform" data-audio-waveform width="920" height="124" aria-label="Live microphone waveform" role="img"></canvas></div>' +
    '<div class="audio-studio-stage-footer"><span>Audio-only broadcast · Listen on the public web player</span><span class="audio-studio-connection" role="status"><i></i><span data-studio-connection>' + escapeHtml(studioConnectionLabel()) + '</span></span></div></div></div></section>' +
    '<section class="audio-studio-metrics" aria-label="Live broadcast metrics">' +
    '<article class="audio-studio-metric"><span class="audio-studio-metric-icon">◷</span><div><small>STREAM DURATION</small><strong data-studio-duration data-started-at="' + escapeHtml(program.liveStartedAt) + '">' + duration + '</strong></div></article>' +
    '<article class="audio-studio-metric"><span class="audio-studio-metric-icon">◉</span><div><small>CONNECTED LISTENERS</small><strong data-studio-live-listeners>' + String(activeListenerCount) + '</strong></div></article>' +
    '<article class="audio-studio-metric"><span class="audio-studio-metric-icon">♫</span><div><small>TOTAL LISTENS</small><strong data-studio-total-listens>' + (interactions ? String(interactions.listenCount) : "—") + '</strong></div></article>' +
    '<article class="audio-studio-metric"><span class="audio-studio-metric-icon">♡</span><div><small>REACTIONS</small><strong data-studio-reaction-total>' + (reactionTotal === null ? "—" : String(reactionTotal)) + '</strong></div></article></section>' +
    '<div class="audio-studio-workspace">' +
    '<section class="audio-studio-panel audio-studio-mixer"><header><div><p class="audio-studio-kicker">SOUND MIXER</p><h2>Microphone controls</h2></div><span class="audio-studio-mic-live"><i></i>MIC LIVE</span></header>' +
    '<div class="audio-mixer-grid">' +
    rangeControl("bass", "Bass", -12, 12, 1, audioSettings.bass, " dB") +
    rangeControl("mid", "Mid", -12, 12, 1, audioSettings.mid, " dB") +
    rangeControl("treble", "Treble", -12, 12, 1, audioSettings.treble, " dB") +
    rangeControl("pitch", "Pitch", -4, 4, 1, audioSettings.pitch, " st") +
    rangeControl("gain", "Mic level", -12, 6, 1, audioSettings.gain, " dB") +
    '</div><p class="audio-studio-panel-note">Changes apply to the live microphone immediately.</p></section>' +
    '<section class="audio-studio-panel audio-studio-mic-panel"><header><div><p class="audio-studio-kicker">INPUT MONITOR</p><h2>Microphone level</h2></div></header>' +
    '<div class="audio-mic-meter audio-studio-meter" role="meter" aria-label="Microphone input level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span data-audio-mic-level></span></div>' +
    '<p class="audio-mic-status" data-audio-mic-status role="status" aria-live="polite">Broadcast is live. Keep this browser tab open while streaming.</p>' +
    '<button class="button audio-studio-mute" type="button" data-action="audio-admin-toggle-mic" data-mic-mute-button aria-pressed="' + String(activeMicMuted) + '">' +
    (activeMicMuted ? "Unmute microphone" : "Mute microphone") + '</button></section></div>' +
    '<section class="audio-studio-reactions" aria-label="Listener reactions"><div class="audio-studio-reaction-heading"><div><p class="audio-studio-kicker">LIVE ENGAGEMENT</p><h2>Listener reactions</h2></div><span>All-time counts</span></div>' +
    '<div class="audio-studio-reaction-list">' +
    '<article><span aria-hidden="true">❤️</span><strong data-studio-love-count>' + (interactions ? String(interactions.loveCount) : "—") + '</strong><small>Love</small></article>' +
    '<article><span aria-hidden="true">👏</span><strong data-studio-clap-count>' + (interactions ? String(interactions.clapCount) : "—") + '</strong><small>Claps</small></article>' +
    '<article><span aria-hidden="true">🔥</span><strong data-studio-fire-count>' + (interactions ? String(interactions.fireCount) : "—") + '</strong><small>Fire</small></article>' +
    '<article><span aria-hidden="true">✉</span><strong data-studio-comment-count>' + (interactions ? String(interactions.commentCount) : "—") + '</strong><small>Comments</small></article></div></section>' +
    '</div><aside class="audio-studio-chat"><header><div><p class="audio-studio-kicker">LISTENER MESSAGES</p><h2>Live comments</h2></div><span class="audio-studio-chat-count" data-studio-chat-count>' + (interactions ? String(interactions.commentCount) : "—") + '</span></header>' +
    '<p class="audio-studio-chat-subtitle">Recent messages from listeners on the public player.</p><p class="audio-studio-refresh-error" data-studio-refresh-error role="status" hidden></p>' +
    '<div class="audio-studio-chat-list" data-live-comments role="log" aria-live="polite" aria-relevant="additions">' + renderStudioComments(interactions ? interactions.comments : []) + '</div>' +
    '<footer><span class="audio-studio-chat-foot-dot"></span>Updates automatically while you’re live</footer></aside></div></section>';
}

function renderLiveAudioContent() {
  if (!cachedData) {
    if (!loadingPromise) void refreshAdminData().catch(() => {});
    return '<section class="audio-admin-empty" role="status"><h2>' +
      (loadError ? "Live Audio setup needs attention" : "Loading Live Audio…") + "</h2><p>" +
      escapeHtml(loadError || "Connecting to the church broadcast service.") + "</p>" +
      (loadError ? '<button class="button button-primary" type="button" data-action="audio-admin-retry">Retry</button>' : "") + "</section>";
  }
  if (studioVisible && activeBroadcaster && activeBroadcastId) {
    const liveProgram = cachedData.programs.find(program => program.id === activeBroadcastId);
    if (liveProgram) return renderLiveAudioStudio(liveProgram);
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
    (activeBroadcaster ? '<div class="audio-live-admin-banner" role="status"><span class="live-dot"></span><span>Broadcast is live. Keep this browser tab open while streaming.</span><button class="audio-admin-open-studio" type="button" data-action="audio-admin-open-studio">Open control room</button></div>' : "") +
    renderProgramRows(cachedData) + "</section>";
}

function rerender() {
  const content = document.getElementById("admin-content");
  if (content) {
    const shell = content.closest(".admin-shell");
    if (shell) shell.classList.toggle("audio-broadcast-shell",
      (wizardStep === 1 || wizardStep === 2) && editingId !== null || Boolean(activeBroadcaster));
    content.innerHTML = renderLiveAudioAdmin();
    if (wizardStep === 2 && editingId !== null) void refreshMicrophoneOptions();
  }
  if (activeBroadcaster) {
    const status = document.querySelector("[data-audio-mic-status]");
    if (status) status.textContent = "Broadcast is live.";
  }
}

function updateStudioActivity() {
  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = String(value);
  };
  if (studioInteractions) {
    setText("[data-studio-total-listens]", studioInteractions.listenCount);
    setText("[data-studio-reaction-total]", studioInteractions.loveCount + studioInteractions.clapCount + studioInteractions.fireCount);
    setText("[data-studio-love-count]", studioInteractions.loveCount);
    setText("[data-studio-clap-count]", studioInteractions.clapCount);
    setText("[data-studio-fire-count]", studioInteractions.fireCount);
    setText("[data-studio-comment-count]", studioInteractions.commentCount);
    setText("[data-studio-chat-count]", studioInteractions.commentCount);
    const comments = document.querySelector("[data-live-comments]");
    if (comments) comments.innerHTML = renderStudioComments(studioInteractions.comments);
  }
  const error = document.querySelector("[data-studio-refresh-error]");
  if (error) {
    error.textContent = studioInteractionsError;
    error.hidden = !studioInteractionsError;
  }
}

async function refreshStudioActivity(programId) {
  if (!programId) return;
  try {
    studioInteractions = await loadAdminLiveAudioInteractions(programId);
    studioInteractionsError = "";
  } catch (error) {
    studioInteractionsError = "Couldn’t refresh listener activity. Showing the last available update.";
  }
  updateStudioActivity();
}

function updateStudioClock() {
  const node = document.querySelector("[data-studio-duration]");
  if (node) node.textContent = formatElapsed(node.dataset.startedAt);
}

function startStudioTimers() {
  if (studioRefreshTimer) window.clearInterval(studioRefreshTimer);
  if (studioClockTimer) window.clearInterval(studioClockTimer);
  studioRefreshTimer = window.setInterval(() => {
    if (activeBroadcastId) void refreshStudioActivity(activeBroadcastId);
  }, 15000);
  studioClockTimer = window.setInterval(updateStudioClock, 1000);
}

function stopStudioTimers() {
  if (studioRefreshTimer) window.clearInterval(studioRefreshTimer);
  if (studioClockTimer) window.clearInterval(studioClockTimer);
  studioRefreshTimer = null;
  studioClockTimer = null;
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
    if (!context) {
      activeMicFrame = requestAnimationFrame(updateMeter);
      return;
    }
    const samples = activeMicEngine.waveform();
    const width = canvas.width;
    const height = canvas.height;
    context.clearRect(0, 0, width, height);
    const themeRoot = document.querySelector(".admin-shell") || document.documentElement;
    context.fillStyle = getComputedStyle(themeRoot).getPropertyValue("--surface-soft").trim() || "#10233d";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = getComputedStyle(themeRoot).getPropertyValue("--purple").trim() || "#4b9bff";
    context.lineWidth = 3;
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
  activeMicEngine = await createLiveAudioMicEngine({ settings: audioSettings, deviceId: selectedMicrophoneId });
  const status = document.querySelector("[data-audio-mic-status]");
  if (status) status.textContent = activeMicEngine.pitchAvailable
    ? "Microphone is on. Speak to check your voice and waveform."
    : "Microphone is on. EQ and level work; pitch shift is not supported in this browser.";
  const startButton = document.querySelector('[data-action="audio-admin-mic-test"]');
  const stopButton = document.querySelector('[data-action="audio-admin-mic-stop"]');
  const readyStatus = document.querySelector("[data-audio-ready-status]");
  if (startButton) startButton.hidden = true;
  if (stopButton) stopButton.hidden = false;
  if (readyStatus) {
    readyStatus.classList.add("is-ready");
    readyStatus.innerHTML = '<span class="audio-status-dot"></span>Microphone is working';
  }
  void refreshMicrophoneOptions();
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
  const canvas = document.querySelector("[data-audio-waveform]");
  const startButton = document.querySelector('[data-action="audio-admin-mic-test"]');
  const stopButton = document.querySelector('[data-action="audio-admin-mic-stop"]');
  const readyStatus = document.querySelector("[data-audio-ready-status]");
  if (status) status.textContent = "Microphone is off.";
  if (level) level.style.width = "0%";
  if (meter) meter.setAttribute("aria-valuenow", "0");
  if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  if (startButton) startButton.hidden = false;
  if (stopButton) stopButton.hidden = true;
  if (readyStatus) {
    readyStatus.classList.remove("is-ready");
    readyStatus.innerHTML = '<span class="audio-status-dot"></span>Microphone not tested';
  }
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
  activeMicMuted = false;
  activeListenerCount = 0;
  activeSignalStatus = "connecting";
  studioInteractions = null;
  studioInteractionsError = "";
  let publisher = null;
  let recorder = null;
  let startedProgram = null;
  try {
    publisher = await startLiveAudioPublisher({
      programId,
      sessionId,
      stream: mic.stream,
      onStatus: status => {
        activeSignalStatus = status;
        const node = document.querySelector("[data-audio-mic-status]");
        if (node && status === "connected") node.textContent = "Connected. Waiting for listeners…";
        if (node && status === "disconnected" && activeBroadcaster) node.textContent = "Signaling disconnected; broadcast may no longer reach new listeners.";
        const connection = document.querySelector("[data-studio-connection]");
        if (connection) {
          connection.textContent = studioConnectionLabel();
          const wrapper = connection.closest(".audio-studio-connection");
          if (wrapper) wrapper.classList.toggle("is-disconnected", status === "disconnected");
        }
      },
      onListenerCount: count => {
        activeListenerCount = count;
        const node = document.querySelector("[data-audio-listener-count]");
        if (node) node.textContent = count + (count === 1 ? " listener connected" : " listeners connected");
        const studioNode = document.querySelector("[data-studio-live-listeners]");
        if (studioNode) studioNode.textContent = String(count);
      }
    });
    recorder = startLiveAudioRecording(mic.stream);
    startedProgram = await startAdminLiveAudioProgram(programId, sessionId);
    activeBroadcaster = publisher;
    activeBroadcastId = programId;
    activeRecording = recorder;
    activeRecordingSessionId = sessionId;
    if (cachedData) {
      cachedData.programs = cachedData.programs.map(item => item.id === programId ? startedProgram : item);
    }
    try {
      cachedData = await loadAdminLiveAudioData();
    } catch (error) {
      // Keep the confirmed live record already returned by the start request.
    }
    editingId = programId;
    wizardStep = 3;
    studioVisible = true;
    rerender();
    const status = document.querySelector("[data-audio-mic-status]");
    if (status) status.textContent = "Broadcast is live. Keep this browser tab open while streaming.";
    await refreshStudioActivity(programId);
    startStudioTimers();
    toast("You are live. Listeners can now join from the web Listen page.");
  } catch (error) {
    if (recorder) await recorder.stop().catch(() => {});
    if (publisher) await publisher.stop().catch(() => {});
    if (startedProgram) await endAdminLiveAudioProgram(programId, "draft").catch(() => {});
    activeBroadcaster = null;
    activeBroadcastId = null;
    activeRecording = null;
    activeRecordingSessionId = null;
    throw error;
  }
}

async function endBroadcast(programId) {
  const program = cachedData && cachedData.programs.find(item => item.id === programId);
  const title = program ? program.title : "this broadcast";
  if (!window.confirm("End " + title + " now? Listeners will be disconnected. You’ll choose whether to publish the recording next.")) return false;
  const hasLocalRecording = Boolean(activeRecording && activeRecordingSessionId && activeBroadcastId === programId);
  const publishPrompt = hasLocalRecording
    ? 'Publish "' + title + '" and its recording on the public Listen page now? Choose Cancel to save it as a draft.'
    : 'This tab has no local recording for "' + title + '". Publish the programme details on the public Listen page? Choose Cancel to save it as a draft.';
  const finalStatus = window.confirm(publishPrompt) ? "published" : "draft";
  let recordingError = null;
  if (activeBroadcaster && activeBroadcastId === programId) {
    await activeBroadcaster.stop();
    if (activeRecording) {
      try {
        const recording = await activeRecording.stop();
        await uploadAdminLiveAudioRecording(programId, activeRecordingSessionId, recording);
      } catch (error) {
        recordingError = error;
      }
    } else {
      recordingError = new Error("The stream did not produce an audio recording.");
    }
    stopStudioTimers();
    activeBroadcaster = null;
    activeBroadcastId = null;
    activeRecording = null;
    activeRecordingSessionId = null;
    studioVisible = false;
    activeMicMuted = false;
    activeListenerCount = 0;
    studioInteractions = null;
    studioInteractionsError = "";
    if (activeMicFrame) cancelAnimationFrame(activeMicFrame);
    activeMicFrame = null;
    if (activeMicEngine) await activeMicEngine.stop();
    activeMicEngine = null;
  }
  await endAdminLiveAudioProgram(programId, recordingError ? "draft" : finalStatus);
  cachedData = await loadAdminLiveAudioData();
  editingId = null;
  wizardStep = 1;
  activeTab = "programs";
  studioVisible = false;
  rerender();
  if (recordingError) {
    toast("Broadcast ended and saved as a draft, but its recording could not be uploaded. " + (recordingError.message || "Try again after checking the connection."));
  } else if (finalStatus === "published") {
    toast("Broadcast ended and published on the public Listen page.");
  } else {
    toast("Broadcast ended and saved as a draft. Publish it later from Drafts.");
  }
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
    studioVisible = false;
    await stopAdminAudioMicTest();
    rerender();
    return true;
  }
  if (action === "audio-admin-new") {
    editingId = "new";
    wizardStep = 1;
    studioVisible = false;
    await stopAdminAudioMicTest();
    rerender();
    return true;
  }
  if (action === "audio-admin-edit" || action === "audio-admin-go-live") {
    editingId = button.dataset.id;
    wizardStep = 1;
    studioVisible = false;
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
    studioVisible = false;
    rerender();
    return true;
  }
  if (action === "audio-admin-open-studio") {
    editingId = activeBroadcastId;
    wizardStep = 3;
    studioVisible = Boolean(activeBroadcaster && activeBroadcastId);
    rerender();
    return true;
  }
  if (action === "audio-admin-back-to-details") {
    if (activeBroadcaster) {
      toast("End the live broadcast before changing its details.");
      return true;
    }
    await stopAdminAudioMicTest();
    wizardStep = 1;
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
    if (activeMicEngine && !activeBroadcaster) await stopAdminAudioMicTest();
    await startMicTest();
    return true;
  }
  if (action === "audio-admin-mic-stop") {
    await stopAdminAudioMicTest();
    return true;
  }
  if (action === "audio-admin-toggle-mic") {
    activeMicMuted = !activeMicMuted;
    if (activeMicEngine) {
      activeMicEngine.stream.getAudioTracks().forEach(track => { track.enabled = !activeMicMuted; });
    }
    const muteButton = document.querySelector("[data-mic-mute-button]");
    if (muteButton) {
      muteButton.setAttribute("aria-pressed", String(activeMicMuted));
      muteButton.textContent = activeMicMuted ? "Unmute microphone" : "Mute microphone";
    }
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
      studioVisible = false;
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
  const updatePreviewFromEvent = event => {
    const form = event.target && event.target.closest && event.target.closest("#live-audio-program-form");
    if (form) updateBroadcastPreview(form);
  };
  document.addEventListener("input", updatePreviewFromEvent);
  document.addEventListener("change", updatePreviewFromEvent);
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
  document.addEventListener("change", async event => {
    const select = event.target;
    if (!select || !select.matches || !select.matches("[data-audio-mic-select]")) return;
    selectedMicrophoneId = select.value;
    if (activeMicEngine && !activeBroadcaster) {
      await stopAdminAudioMicTest();
      await startMicTest();
    }
  });
}

export function renderLiveAudioAdmin() {
  return renderLiveAudioContent();
}
