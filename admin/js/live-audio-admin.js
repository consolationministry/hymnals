import {
  deleteLiveAudioProgram,
  getLiveAudioData,
  saveLiveAudioCategories,
  saveLiveAudioProgram,
  setLiveAudioProgramOnAir,
  setLiveAudioProgramStatus
} from "../../js/live-audio-data.js";

let activeTab = "programs";
let editingId = null;
let activeMicStream = null;
let activeMicContext = null;
let activeMicFrame = null;

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character];
  });
}

function toast(message) {
  const node = document.getElementById("admin-toast");
  if (!node) return;
  node.textContent = message;
  node.hidden = false;
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(function () { node.hidden = true; }, 4200);
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
    check: '<path d="m5 12 4 4L19 6"/>',
    edit: '<path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/>',
    back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3"/>'
  };
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || "") + "</svg>";
}

function tabButton(id, label) {
  return '<button class="audio-admin-tab' + (activeTab === id ? " is-active" : "") + '" type="button" data-action="audio-admin-tab" data-tab="' + id + '" aria-pressed="' + (activeTab === id) + '">' + label + "</button>";
}

function localNotice() {
  return '<div class="audio-admin-notice" role="note"><strong>Browser-only preview.</strong> Broadcast details, reactions, comments, and listener starts are stored on this device. The microphone check is in Broadcast settings and stays local; WebRTC publishing and cross-device data need a signaling/backend setup.</div>';
}

function renderStats(data) {
  const published = data.programs.filter(function (program) { return program.status === "published"; }).length;
  const drafts = data.programs.filter(function (program) { return program.status === "draft"; }).length;
  const listenerStarts = data.programs.reduce(function (sum, program) { return sum + program.listenCount; }, 0);
  const reactions = Object.values(data.reactions).reduce(function (sum, entry) {
    return sum + Number(entry.love || 0) + Number(entry.clap || 0) + Number(entry.fire || 0);
  }, 0);
  const cards = [
    ["Total broadcasts", data.programs.length, "Saved on this device"],
    ["Published", published, "Visible in this browser"],
    ["Drafts", drafts, "Not shown to listeners"],
    ["Listener starts", listenerStarts, "This browser only"],
    ["Reactions", reactions, "This browser only"],
    ["Comments", data.comments.length, "This browser only"]
  ];
  return '<section class="stats-grid audio-admin-stats" aria-label="Audio preview statistics">' + cards.map(function (card) {
    return '<article class="stat-card"><div class="stat-head"><span class="stat-label">' + card[0] + '</span><span class="audio-admin-stat-icon">' + icon("radio") + '</span></div><p class="stat-value">' + card[1] + '</p><p class="stat-hint">' + card[2] + "</p></article>";
  }).join("") + "</section>";
}

function renderProgramRows(data) {
  const programs = data.programs.filter(function (program) {
    return activeTab === "drafts" ? program.status === "draft" :
      activeTab === "published" ? program.status === "published" : true;
  });
  if (!programs.length) {
    const title = activeTab === "drafts" ? "No drafts yet" : activeTab === "published" ? "No published programmes yet" : "No broadcasts set up yet";
    return '<div class="audio-admin-empty">' + icon("radio") + "<h2>" + title + '</h2><p>Create a programme draft to begin. It will appear in the public Listen page when you publish it.</p></div>';
  }
  return '<div class="audio-admin-table-wrap"><table class="audio-admin-table"><thead><tr><th scope="col">Programme</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col">Stream</th><th scope="col">Updated</th><th scope="col">Actions</th></tr></thead><tbody>' +
    programs.map(function (program) {
      const status = program.onAir ? '<span class="status-pill status-published">On air · preview</span>' :
        '<span class="status-pill ' + (program.status === "published" ? "status-published" : "status-draft") + '">' + (program.status === "published" ? "Published" : "Draft") + "</span>";
      return '<tr><td><strong>' + escapeHtml(program.title) + '</strong><small>' + escapeHtml(program.speaker || "Speaker not set") + "</small></td>" +
        "<td>" + escapeHtml(program.category) + "</td><td>" + status + "</td><td>" + (program.streamUrl ? "URL added" : "Not connected") + "</td><td>" + escapeHtml(formatDate(program.updatedAt)) + '</td><td><div class="audio-admin-actions">' +
        '<button class="button button-secondary" type="button" data-action="audio-admin-edit" data-id="' + escapeHtml(program.id) + '" aria-label="Edit ' + escapeHtml(program.title) + '">' + icon("edit") + " Edit</button>" +
        (program.status === "published"
          ? '<button class="button button-secondary" type="button" data-action="audio-admin-on-air" data-id="' + escapeHtml(program.id) + '">' + (program.onAir ? "End preview" : "Set on air") + "</button>"
          : '<button class="button button-secondary" type="button" data-action="audio-admin-status" data-status="published" data-id="' + escapeHtml(program.id) + '">Publish</button>') +
        '<button class="button button-secondary audio-admin-delete" type="button" data-action="audio-admin-delete" data-id="' + escapeHtml(program.id) + '" aria-label="Delete ' + escapeHtml(program.title) + '">' + icon("trash") + "</button>" +
        "</div></td></tr>";
    }).join("") + "</tbody></table></div>";
}

function renderProgramForm(data) {
  const existing = data.programs.find(function (program) { return program.id === editingId; });
  const item = existing || { title: "", speaker: "", category: data.categories[0] || "Other", imageUrl: "", description: "", venue: "", date: "", streamUrl: "", status: "draft" };
  const categoryOptions = data.categories.map(function (category) {
    return '<option value="' + escapeHtml(category) + '"' + (category === item.category ? " selected" : "") + ">" + escapeHtml(category) + "</option>";
  }).join("");
  return '<section class="audio-admin-form-wrap"><div class="page-heading"><div><h1>' + (existing ? "Edit programme" : "New programme") +
    '</h1><p>Programme details are saved to this browser preview.</p></div><button class="button button-secondary audio-admin-back" type="button" data-action="audio-admin-back">' + icon("back") + "Back to broadcasts</button></div>" +
    '<form class="panel audio-admin-form" id="live-audio-program-form">' +
    '<div class="audio-admin-form-grid"><div class="admin-field"><label for="audio-title">Programme title <span aria-hidden="true">*</span></label><input class="form-input" id="audio-title" name="title" maxlength="120" value="' + escapeHtml(item.title) + '" required></div>' +
    '<div class="admin-field"><label for="audio-speaker">Speaker</label><input class="form-input" id="audio-speaker" name="speaker" maxlength="100" value="' + escapeHtml(item.speaker) + '"></div>' +
    '<div class="admin-field"><label for="audio-category">Category</label><select class="form-select" id="audio-category" name="category">' + categoryOptions + "</select></div>" +
    '<div class="admin-field"><label for="audio-date">Programme date</label><input class="form-input" id="audio-date" name="date" type="date" value="' + escapeHtml(item.date) + '"></div>' +
    '<div class="admin-field"><label for="audio-venue">Venue</label><input class="form-input" id="audio-venue" name="venue" maxlength="140" value="' + escapeHtml(item.venue) + '"></div>' +
    '<div class="admin-field"><label for="audio-image">Thumbnail image URL</label><input class="form-input" id="audio-image" name="imageUrl" type="url" inputmode="url" placeholder="https://…" value="' + escapeHtml(item.imageUrl) + '"><p class="field-hint">Use a secure HTTPS image address.</p></div>' +
    '<div class="admin-field audio-admin-wide"><label for="audio-description">Description</label><textarea class="form-textarea" id="audio-description" name="description" rows="4" maxlength="2000">' + escapeHtml(item.description) + '</textarea></div>' +
    '<div class="admin-field audio-admin-wide"><label for="audio-stream">Secure audio stream URL</label><input class="form-input" id="audio-stream" name="streamUrl" type="url" inputmode="url" placeholder="https://…" value="' + escapeHtml(item.streamUrl) + '"><p class="field-hint">This supports an existing HTTPS audio stream. It does not start WebRTC from the admin microphone.</p></div></div>' +
    '<div class="audio-admin-form-footer"><span class="field-hint">Church name, logo, and colours stay linked to the existing hymnal branding.</span><div class="form-actions-right">' +
    '<button class="button button-secondary" type="submit" data-audio-status="draft">Save as draft</button><button class="button button-primary" type="submit" data-audio-status="published">Save and publish</button></div></div></form></section>';
}

function renderSettings(data) {
  return '<section class="page-heading"><div><h1>Broadcast settings</h1><p>Check the microphone locally and manage audio categories. Broadcasting still needs a signaling service.</p></div><button class="button button-secondary audio-admin-back" type="button" data-action="audio-admin-back">' + icon("back") + "Back to broadcasts</button></section>" +
    '<div class="audio-settings-mic">' + renderMicTest() + "</div>" +
    '<section class="panel audio-admin-settings"><div class="audio-brand-preview"><img src="../assets/consolation-launcher.png" alt="" width="58" height="58"><div><strong>Consolation Evangelical and Revival Church</strong><span>Occupy Till I Come · Existing app branding</span></div></div>' +
    '<form id="audio-categories-form"><div class="admin-field"><label for="audio-categories">Programme categories</label><textarea class="form-textarea" id="audio-categories" name="categories" rows="5">' + escapeHtml(data.categories.join(", ")) +
    '</textarea><p class="field-hint">Separate categories with commas. Existing programmes keep their current category label.</p></div><button class="button button-primary" type="submit">Save categories</button></form></section>';
}

function renderMicTest() {
  return '<section class="panel audio-mic-panel"><header class="panel-header"><div><h2>Microphone check before going live</h2><p>Test the microphone locally before a future live-broadcast setup.</p></div></header><div class="panel-body"><p class="audio-mic-explanation">This check requests browser microphone permission and displays a local level meter. It does not record or transmit audio.</p><div class="audio-mic-meter" role="meter" aria-label="Microphone input level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span data-audio-mic-level></span></div><p class="audio-mic-status" data-audio-mic-status role="status" aria-live="polite">Microphone is off.</p><div class="audio-mic-actions"><button class="button button-secondary" type="button" data-action="audio-admin-mic-test">Test microphone</button><button class="button button-secondary" type="button" data-action="audio-admin-mic-stop" hidden>Stop test</button></div></div></section>';
}

export function renderLiveAudioAdmin() {
  const data = getLiveAudioData();
  if (editingId) return renderProgramForm(data);
  if (activeTab === "settings") return localNotice() + renderSettings(data);
  const listingTabs = '<div class="audio-admin-tabs" role="group" aria-label="Filter programmes">' +
    tabButton("programs", "All programmes") + tabButton("drafts", "Drafts") + tabButton("published", "Published") + tabButton("settings", "Broadcast settings") + "</div>";
  const listActions = '<div class="audio-admin-toolbar"><div><h2>' + (activeTab === "drafts" ? "Drafts" : activeTab === "published" ? "Published programmes" : "Broadcast management") +
    '</h2><p>Manage programme information for the member Listen page.</p></div><div class="audio-admin-toolbar-actions">' +
    (activeTab === "drafts" ? '<button class="button button-secondary" type="button" data-action="audio-admin-export">Export drafts</button>' : "") +
    '<button class="button button-primary" type="button" data-action="audio-admin-new">' + icon("check") + " New programme</button></div></div>";
  return '<section><div class="page-heading"><div><h1>Live Audio</h1><p>Broadcast setup for the existing Consolation Hymnal.</p></div><button class="button button-secondary audio-admin-back" type="button" data-action="navigate" data-view="dashboard">' + icon("back") + "Back to admin dashboard</button></div>" +
    localNotice() + renderStats(data) + listingTabs + listActions + renderProgramRows(data) + "</section>";
}

function rerender() {
  stopAdminAudioMicTest();
  const content = document.getElementById("admin-content");
  if (content) content.innerHTML = renderLiveAudioAdmin();
}

function downloadDrafts() {
  const drafts = getLiveAudioData().programs.filter(function (program) { return program.status === "draft"; });
  const blob = new Blob([JSON.stringify(drafts, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "consolation-audio-drafts.json";
  link.click();
  URL.revokeObjectURL(url);
}

async function startMicTest() {
  const status = document.querySelector("[data-audio-mic-status]");
  const meter = document.querySelector(".audio-mic-meter");
  const level = document.querySelector("[data-audio-mic-level]");
  const stopButton = document.querySelector('[data-action="audio-admin-mic-stop"]');
  const startButton = document.querySelector('[data-action="audio-admin-mic-test"]');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (status) status.textContent = "This browser does not provide microphone access.";
    return;
  }
  try {
    activeMicStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error("This browser does not support microphone metering.");
    activeMicContext = new AudioContextClass();
    const source = activeMicContext.createMediaStreamSource(activeMicStream);
    const analyser = activeMicContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    if (status) status.textContent = "Microphone is on. Speak to check the level.";
    if (meter) meter.setAttribute("aria-valuenow", "0");
    if (startButton) startButton.hidden = true;
    if (stopButton) stopButton.hidden = false;
    const tick = function () {
      analyser.getByteTimeDomainData(samples);
      let energy = 0;
      for (let index = 0; index < samples.length; index += 1) {
        const centered = (samples[index] - 128) / 128;
        energy += centered * centered;
      }
      const percent = Math.min(100, Math.round(Math.sqrt(energy / samples.length) * 260));
      if (level) level.style.width = percent + "%";
      if (meter) meter.setAttribute("aria-valuenow", String(percent));
      activeMicFrame = requestAnimationFrame(tick);
    };
    tick();
  } catch (error) {
    stopAdminAudioMicTest();
    if (status) status.textContent = error && error.name === "NotAllowedError"
      ? "Microphone permission was denied. Allow it in your browser settings to run the local check."
      : (error && error.message) || "The microphone check could not start.";
  }
}

export function stopAdminAudioMicTest() {
  if (activeMicFrame) cancelAnimationFrame(activeMicFrame);
  activeMicFrame = null;
  if (activeMicStream) activeMicStream.getTracks().forEach(function (track) { track.stop(); });
  activeMicStream = null;
  if (activeMicContext && activeMicContext.state !== "closed") activeMicContext.close().catch(function () {});
  activeMicContext = null;
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

export async function handleLiveAudioAdminAction(button) {
  const action = button.dataset.action;
  const data = getLiveAudioData();
  if (action === "audio-admin-tab") {
    activeTab = button.dataset.tab;
    editingId = null;
    rerender();
    return true;
  }
  if (action === "audio-admin-new") {
    editingId = "new";
    rerender();
    return true;
  }
  if (action === "audio-admin-edit") {
    editingId = button.dataset.id;
    rerender();
    return true;
  }
  if (action === "audio-admin-cancel") {
    editingId = null;
    rerender();
    return true;
  }
  if (action === "audio-admin-back") {
    editingId = null;
    activeTab = "programs";
    rerender();
    return true;
  }
  if (action === "audio-admin-status") {
    const id = button.dataset.id;
    const program = data.programs.find(function (item) { return item.id === id; });
    if (!program || !window.confirm('Publish "' + program.title + '" in this browser preview?')) return true;
    try {
      setLiveAudioProgramStatus(id, button.dataset.status);
      toast("Programme published in this browser preview.");
      rerender();
    } catch (error) { toast(error.message || "The programme could not be updated."); }
    return true;
  }
  if (action === "audio-admin-on-air") {
    const program = data.programs.find(function (item) { return item.id === button.dataset.id; });
    if (!program) return true;
    const next = !program.onAir;
    if (!window.confirm(next
      ? "Mark this programme on air in this browser preview? This does not start a WebRTC broadcast."
      : "End this programme's local preview status?")) return true;
    try {
      setLiveAudioProgramOnAir(program.id, next);
      toast(next ? "Programme marked on air in this preview." : "Preview marked off air.");
      rerender();
    } catch (error) { toast(error.message || "The on-air status could not be changed."); }
    return true;
  }
  if (action === "audio-admin-delete") {
    const program = data.programs.find(function (item) { return item.id === button.dataset.id; });
    if (!program || !window.confirm('Delete "' + program.title + '" and its local comments and reactions?')) return true;
    deleteLiveAudioProgram(program.id);
    toast("Programme deleted from this browser preview.");
    rerender();
    return true;
  }
  if (action === "audio-admin-export") {
    const drafts = data.programs.filter(function (program) { return program.status === "draft"; });
    if (!drafts.length) {
      toast("There are no drafts to export.");
      return true;
    }
    if (window.confirm("Download " + drafts.length + " draft programme(s) as a JSON file?")) downloadDrafts();
    return true;
  }
  if (action === "audio-admin-mic-test") {
    await startMicTest();
    return true;
  }
  if (action === "audio-admin-mic-stop") {
    stopAdminAudioMicTest();
    return true;
  }
  return false;
}

export function handleLiveAudioAdminSubmit(event) {
  if (event.target.id === "live-audio-program-form") {
    event.preventDefault();
    const form = event.target;
    const values = Object.fromEntries(new FormData(form).entries());
    const status = event.submitter && event.submitter.dataset.audioStatus === "published" ? "published" : "draft";
    if (status === "published" && !window.confirm("Publish this programme in the current browser preview? It will only appear on this device until shared storage is connected.")) return true;
    try {
      saveLiveAudioProgram(Object.assign({}, values, { id: editingId === "new" ? "" : editingId, status: status }));
      editingId = null;
      toast(status === "published" ? "Programme published in this browser preview." : "Programme saved as a local draft.");
      activeTab = status === "published" ? "published" : "drafts";
      rerender();
    } catch (error) {
      toast(error.message || "Programme details could not be saved.");
    }
    return true;
  }
  if (event.target.id === "audio-categories-form") {
    event.preventDefault();
    const input = event.target.elements.categories;
    const categories = input.value.split(",").map(function (item) { return item.trim(); }).filter(Boolean);
    saveLiveAudioCategories(categories);
    toast("Audio categories saved on this device.");
    rerender();
    return true;
  }
  return false;
}

