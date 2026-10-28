import { liveAudioCounts, liveAudioReactionSelected } from "./live-audio-data.js";
import { publicLiveAudioConnectionMessage } from "./live-audio-status.js";

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character];
  });
}

function radioIcon(className) {
  return '<svg class="' + (className || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v10a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z"/><path d="m7 5 10-3M8 10h.01M12 10h.01M16 10h.01M8 15h8"/><circle cx="8" cy="15" r="1.8"/></svg>';
}

function formattedDate(value) {
  if (!value) return "";
  const date = new Date(value.length === 10 ? value + "T12:00:00" : value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function formattedTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}

function mediaMarkup(program, className) {
  if (program.imageUrl) {
    return '<div class="' + className + '"><img src="' + escapeHtml(program.imageUrl) + '" alt="" loading="lazy"></div>';
  }
  return '<div class="' + className + '"><span class="audio-program-card-placeholder">' + radioIcon() + '</span></div>';
}

function programMeta(program) {
  const items = [];
  if (program.speaker) items.push("<span>" + escapeHtml(program.speaker) + "</span>");
  if (program.date) items.push("<span>" + escapeHtml(formattedDate(program.date)) + "</span>");
  if (program.venue) items.push("<span>" + escapeHtml(program.venue) + "</span>");
  if (program.onAir && program.listenCount) items.push("<span>" + escapeHtml(program.listenCount) + " listening</span>");
  return items.length ? '<div class="audio-program-meta">' + items.join("") + "</div>" : "";
}

function programCard(program, isLive) {
  return '<article class="audio-program-card" data-testid="audio-program-' + escapeHtml(program.id) + '">' +
    mediaMarkup(program, "audio-program-card-media") +
    (isLive ? '<span class="live-audio-badge is-live">On air</span>' : "") +
    '<div class="audio-program-card-body"><span class="audio-program-meta"><span>' + escapeHtml(program.category) + "</span></span>" +
    '<h3>' + escapeHtml(program.title) + "</h3>" + programMeta(program) +
    '<button class="' + (isLive ? "button-primary" : "button-secondary") + '" type="button" data-action="open-live-audio" data-program-id="' + escapeHtml(program.id) + '">' +
    (isLive ? "Listen now" : "View program") + "</button></div></article>";
}

function emptyState(title, message) {
  return '<div class="audio-empty-state">' + radioIcon() + "<h3>" + escapeHtml(title) + "</h3><p>" + escapeHtml(message) + "</p></div>";
}

function audioLibraryArtwork(program, className) {
  if (program && program.imageUrl) {
    return '<div class="' + className + '"><img src="' + escapeHtml(program.imageUrl) + '" alt="" loading="lazy"></div>';
  }
  return '<div class="' + className + ' audio-library-art-placeholder"><span class="audio-library-art-glow"></span><img src="./assets/consolation-launcher.png" alt="" loading="lazy"></div>';
}

function audioLibrarySaveControl(program, data, isSaved, isSavedFilter) {
  const isSaving = data.savingProgramIds && data.savingProgramIds.has(program.id);
  if (isSaved && isSavedFilter) {
    return '<button class="audio-library-save audio-library-remove-save" type="button" data-action="remove-saved-live-audio" data-program-id="' + escapeHtml(program.id) + '">Remove</button>';
  }
  if (isSaved) return '<span class="audio-library-saved-mark" aria-label="Saved for offline listening">Saved</span>';
  if (!program.recordingUrl || !program.recordingPath) return "";
  return '<button class="audio-library-save" type="button" data-action="save-live-audio" data-program-id="' + escapeHtml(program.id) + '"' +
    (isSaving ? " disabled" : "") + ' aria-label="' + (isSaving ? "Saving " : "Save ") + escapeHtml(program.title) + ' for offline listening">' +
    (isSaving ? "Savingâ¦" : "Save") + '</button>';
}

function audioLibraryProgramRow(program, data, isSaved, isSavedFilter) {
  const isLive = Boolean(program.onAir && program.liveSessionId);
  const meta = [program.speaker, program.date ? formattedDate(program.date) : "", program.venue]
    .filter(Boolean);
  if (isLive && program.listenCount) meta.push(program.listenCount + " listening");
  return '<article class="audio-library-row" data-testid="audio-program-' + escapeHtml(program.id) + '">' +
    audioLibraryArtwork(program, "audio-library-row-art") +
    '<div class="audio-library-row-copy"><div class="audio-library-row-kicker"><span>' + escapeHtml(program.category) + '</span>' +
    (isLive ? '<span class="audio-library-live-label"><i></i> Live</span>' : program.recordingUrl || isSaved ? '<span class="audio-library-recorded-label">' + (isSaved ? "Saved offline" : "Recorded") + '</span>' : "") + '</div>' +
    '<h3>' + escapeHtml(program.title) + '</h3>' +
    (meta.length ? '<p class="audio-library-row-meta">' + meta.map(escapeHtml).join(' <span aria-hidden="true">Â·</span> ') + '</p>' : "") +
    '</div>' + audioLibrarySaveControl(program, data, isSaved, isSavedFilter) +
    '<button class="audio-library-row-play" type="button" data-action="open-live-audio" data-program-id="' + escapeHtml(program.id) + '" aria-label="' + (isLive ? "Listen to " : program.recordingUrl || isSaved ? "Listen to recording of " : "Open ") + escapeHtml(program.title) + '">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 9 6-9 6z"/></svg></button></article>';
}

function audioWaveformBars() {
  return Array.from({ length: 40 }, function () { return "<span></span>"; }).join("");
}

function audioPlayerButton(playerType, action, label, icon) {
  return '<button class="audio-player-control audio-player-' + action + '" type="button" data-action="' + action + '" data-player-type="' + playerType + '" aria-label="' + label + '">' +
    '<span data-audio-control-icon aria-hidden="true">' + icon + '</span></button>';
}

export function renderLiveAudioPage(data, query, category) {
  const isSavedFilter = category === "__saved__";
  const savedPrograms = Array.isArray(data.savedPrograms) ? data.savedPrograms : [];
  const savedProgramIds = new Set(savedPrograms.map(function (program) { return program.id; }));
  const allPrograms = data.programs.filter(function (program) { return program.status === "published"; });
  const programs = isSavedFilter
    ? savedPrograms
    : allPrograms;
  const livePrograms = programs.filter(function (program) { return program.onAir && program.liveSessionId; });
  const normalizedQuery = String(query || "").trim().toLocaleLowerCase();
  const isLiveFilter = category === "__live__";
  const selectedCategory = isLiveFilter || isSavedFilter ? "" : String(category || "");
  const formalPrograms = programs.filter(function (program) {
    const isLive = program.onAir && Boolean(program.liveSessionId);
    const matchesQuery = !normalizedQuery || (program.title + " " + program.category + " " + program.speaker + " " + program.description)
      .toLocaleLowerCase().includes(normalizedQuery);
    const matchesCategory = !selectedCategory || program.category === selectedCategory;
    return (!isLiveFilter || isLive) && matchesQuery && matchesCategory;
  });
  const categoryOptions = Array.from(new Set(programs.map(function (program) { return program.category; })))
    .filter(function (item) { return item.toLocaleLowerCase() !== "live"; })
    .sort(function (a, b) { return a.localeCompare(b); });
  const filters = [{ value: "", label: "All" }, { value: "__live__", label: "Live" }].concat(
    [{ value: "__saved__", label: "Saved" }],
    categoryOptions.map(function (item) { return { value: item, label: item }; })
  );
  const filterMarkup = filters.map(function (item) {
    return '<button class="audio-library-filter' + (String(category || "") === item.value ? " is-selected" : "") + '" type="button" data-action="filter-live-audio" data-category="' + escapeHtml(item.value) + '" aria-pressed="' + (String(category || "") === item.value) + '">' +
      (item.value === "__live__" ? '<i class="audio-library-filter-dot" aria-hidden="true"></i>' : "") + escapeHtml(item.label) + '</button>';
  }).join("");
  const feature = isSavedFilter ? null : livePrograms[0] || programs[0] || null;
  const waveformHeights = [22, 40, 28, 61, 38, 76, 31, 53, 88, 45, 68, 36, 96, 55, 73, 41, 83, 33, 62, 26, 49, 19, 37, 17];
  const waveform = waveformHeights.map(function (height) { return '<span style="height:' + height + '%"></span>'; }).join("");
  const featureMarkup = isSavedFilter
    ? ""
    : feature
    ? '<section class="audio-library-feature" aria-label="' + (livePrograms.length ? "Live programme" : "Featured programme") + '">' +
      audioLibraryArtwork(feature, "audio-library-feature-art") +
      '<div class="audio-library-feature-copy"><div class="audio-library-feature-status">' +
      (feature.onAir && feature.liveSessionId ? '<span class="audio-library-live-pill"><i></i> LIVE</span>' : feature.recordingUrl ? '<span class="audio-library-feature-pill">RECORDED BROADCAST</span>' : '<span class="audio-library-feature-pill">FEATURED PROGRAMME</span>') +
      '<span class="audio-library-church-label">Consolation Evangelical and Revival Church</span></div>' +
      '<h1>' + escapeHtml(feature.title) + '</h1>' +
      '<p class="audio-library-feature-subtitle">' + escapeHtml(feature.speaker || "Worship Â· Word Â· Fellowship") + '</p>' +
      '<div class="audio-library-feature-meta">' + (feature.date ? '<span>' + escapeHtml(formattedDate(feature.date)) + '</span>' : "") +
      (feature.venue ? '<span>' + escapeHtml(feature.venue) + '</span>' : "") + '</div>' +
      '<div class="audio-library-feature-controls"><button class="audio-library-feature-play" type="button" data-action="open-live-audio" data-program-id="' + escapeHtml(feature.id) + '">' +
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m8 5 12 7-12 7z"/></svg>' + (feature.onAir && feature.liveSessionId ? "Listen now" : feature.recordingUrl ? "Play recording" : "Open programme") + '</button>' +
      '<div class="audio-library-waveform" aria-hidden="true">' + waveform + '</div>' +
      (feature.onAir && feature.listenCount ? '<span class="audio-library-listener-count">' + escapeHtml(feature.listenCount) + ' listening</span>' : "") +
      '</div></div></section>'
    : '<section class="audio-library-feature audio-library-feature-empty" aria-label="Church audio library">' +
      audioLibraryArtwork(null, "audio-library-feature-art") +
      '<div class="audio-library-feature-copy"><span class="audio-library-feature-pill">CHURCH AUDIO</span><h1>Listen together, wherever you are.</h1>' +
      '<p class="audio-library-feature-subtitle">Published services and programmes from Consolation Evangelical and Revival Church will appear here.</p>' +
      '<div class="audio-library-feature-controls"><div class="audio-library-waveform" aria-hidden="true">' + waveform + '</div></div></div></section>';
  const listContent = formalPrograms.length
    ? '<div class="audio-library-list" aria-live="polite">' + formalPrograms.map(function (program) {
      return audioLibraryProgramRow(program, data, savedProgramIds.has(program.id), isSavedFilter);
    }).join("") + '</div>'
    : '<div class="audio-library-empty" aria-live="polite"><span class="audio-library-empty-icon">' + radioIcon() + '</span><h3>' +
      (data.loading && !isSavedFilter ? "Loading programmes" : programs.length ? "No programmes match" : isSavedFilter ? "No saved programmes yet" : "No programmes published yet") + '</h3><p>' +
      (data.loading && !isSavedFilter ? "Checking for current broadcasts and published programmesâ¦" : isSavedFilter ? "Save a recording to keep it on this device for offline listening." : programs.length ? "Try another title or category." : "Published church programmes will appear here.") + '</p></div>';
  return '<section class="page live-audio-page audio-library-page">' +
    '<header class="audio-library-header"><div class="audio-library-header-inner">' +
    '<button class="audio-library-brand" type="button" data-action="navigate" data-view="home" aria-label="Go to Home"><img src="./assets/consolation-launcher.png" alt="" width="48" height="48"><span><strong>Consolation Evangelical<br>and Revival Church</strong><small>Audio Stream</small></span></button>' +
    '<div class="audio-library-header-actions"><a class="audio-library-header-icon" href="#live-audio-search" aria-label="Jump to programme search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/></svg></a>' +
    '<button class="audio-library-header-icon" type="button" data-action="navigate" data-view="programs" aria-label="Upcoming programmes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg></button>' +
    '<button class="audio-library-avatar" type="button" data-action="navigate" data-view="settings" aria-label="Open profile and settings">C</button></div></div></header>' +
    '<div class="audio-library-content">' + (data.error && !isSavedFilter ? '<p class="audio-service-error" role="alert">' + escapeHtml(data.error) + '</p>' : "") +
    featureMarkup +
    '<section class="audio-library-section" aria-labelledby="audio-library-heading"><div class="audio-library-section-heading"><div><p class="audio-library-overline">CHURCH AUDIO</p><h2 id="audio-library-heading">' + (isSavedFilter ? "Saved Programmes" : "Upcoming &amp; Recent Programmes") + '</h2></div><span class="audio-library-program-count">' + formalPrograms.length + '</span></div>' +
    '<div class="audio-library-search-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/></svg><label class="sr-only" for="live-audio-search">Search programmes</label><input class="audio-library-search" id="live-audio-search" type="search" value="' + escapeHtml(query) + '" placeholder="Search programmesâ¦" data-live-audio-search></div>' +
    '<div class="audio-library-filters" role="group" aria-label="Filter programmes">' + filterMarkup + '</div>' + listContent +
    '</section></div>' +
    '<nav class="audio-library-bottom-nav" aria-label="Church audio navigation">' +
    '<button class="audio-library-nav-button" type="button" data-action="navigate" data-view="home"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg><span>Home</span></button>' +
    '<button class="audio-library-nav-button" type="button" data-action="navigate" data-view="hymns"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20"/></svg><span>Library</span></button>' +
    '<button class="audio-library-nav-button audio-library-nav-listen is-active" type="button" data-action="navigate" data-view="listen" aria-current="page"><span class="audio-library-nav-play"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m8 5 12 7-12 7z"/></svg></span><span>Listen</span></button>' +
    '<button class="audio-library-nav-button" type="button" data-action="navigate" data-view="programs"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg><span>Programmes</span></button>' +
    '<button class="audio-library-nav-button" type="button" data-action="navigate" data-view="settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg><span>Profile</span></button>' +
    '</nav></section>';
}

export function renderLiveAudioListener(data, programId, options) {
  const opts = options || {};
  const program = data.programs.find(function (item) { return item.id === programId && item.status === "published"; });
  const header = '<header class="audio-listener-header"><button class="audio-listener-back" type="button" data-action="back-to-live-audio" aria-label="Back to programme library"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>' +
    '<div class="audio-listener-brand"><img src="./assets/consolation-launcher.png" alt="" width="42" height="42"><span><strong>Consolation Evangelical<br>and Revival Church</strong><small>Audio Stream</small></span></div>' +
    '<button class="audio-listener-header-profile" type="button" data-action="navigate" data-view="settings" aria-label="Open profile and settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></button></header>';
  if (!program) {
    return '<section class="page audio-listener-page">' + header + '<div class="audio-listener-content">' +
      emptyState("Programme not found", "It may have been removed or saved as a draft.") + '</div></section>';
  }
  const counts = liveAudioCounts(data, program.id);
  const comments = data.comments.filter(function (comment) { return comment.programId === program.id; }).slice(-12).reverse();
  const isLive = program.onAir && Boolean(program.liveSessionId);
  const joinError = opts.joinError && typeof opts.joinError.message === "string" ? opts.joinError : null;
  const joinStatus = opts.status || (opts.connecting ? "connecting" : "connected");
  const showJoinOverlay = isLive && (joinError || opts.connecting ||
    ["connecting", "connected", "reconnecting", "disconnected"].includes(joinStatus));
  const joinOverlay = showJoinOverlay
    ? '<div class="audio-live-join-overlay" role="' + (joinError ? "alert" : "status") + '" aria-live="' + (joinError ? "assertive" : "polite") + '">' +
      '<div class="audio-live-join-panel">' +
      (joinError
        ? '<span class="audio-live-join-error-mark" aria-hidden="true">!</span>'
        : '<span class="audio-live-join-spinner" aria-hidden="true"></span>') +
      '<p class="audio-live-join-message">' + escapeHtml(joinError ? joinError.message : publicLiveAudioConnectionMessage(joinStatus)) + '</p>' +
      (joinError
        ? '<button class="audio-live-join-retry" type="button" data-action="retry-live-audio" data-program-id="' + escapeHtml(program.id) + '">' +
          (joinError.kind === "network" ? "Retry connection" : "Try again") + '</button>'
        : "") +
      '</div></div>'
    : "";
  const savedProgramIds = new Set((data.savedPrograms || []).map(function (item) { return item.id; }));
  const isSavedOffline = savedProgramIds.has(program.id);
  const offlinePlayback = Boolean(opts.offlinePlayback);
  const listenerCount = Math.max(0, Number(program.listenCount) || 0);
  const recordingDuration = Number(program.recordingDurationSeconds);
  const recordingDurationSeconds = Number.isFinite(recordingDuration) && recordingDuration > 0
    ? recordingDuration
    : 0;
  const liveSegments = (Array.isArray(program.liveSegments) ? program.liveSegments : [])
    .filter(function (segment) { return segment && segment.url; })
    .map(function (segment) {
      return {
        index: Number(segment.index),
        durationSeconds: Number(segment.durationSeconds),
        url: String(segment.url)
      };
    });
  const meta = [program.date ? formattedDate(program.date) : "", program.venue].filter(Boolean).map(escapeHtml);
  const artwork = program.imageUrl
    ? '<div class="audio-listener-art"><img src="' + escapeHtml(program.imageUrl) + '" alt="" loading="eager"></div>'
    : '<div class="audio-listener-art audio-listener-art-empty"><span class="audio-listener-art-placeholder">' + radioIcon() + '</span></div>';
  const player = isLive
    ? '<section class="audio-player audio-listener-player" aria-label="Buffered live audio player"><div class="audio-listener-player-heading"><span class="audio-listener-player-live"><i></i> BUFFERED LIVE Â· ~5 SEC</span><span class="audio-listener-player-caption">' +
      (opts.connecting ? "Joining the live broadcastâ¦" : opts.status === "buffering" ? "Building the five-second bufferâ¦" : opts.connected ? "Playing about five seconds behind" : "Delayed live broadcast audio") + '</span></div>' +
      '<audio class="audio-listener-audio-source" autoplay playsinline preload="none" data-live-audio-player data-audio-player="live" data-live-audio-segments="' + escapeHtml(JSON.stringify(liveSegments)) + '" aria-hidden="true" tabindex="-1" aria-label="Listen to ' + escapeHtml(program.title) + '"></audio>' +
      '<div class="audio-listener-controls" data-audio-player-controls="live">' +
      '<div class="audio-listener-waveform" data-audio-waveform="live" data-audio-waveform-seek role="img" aria-label="Buffered live waveform and rewind timeline">' + audioWaveformBars() + '</div>' +
      '<input class="audio-listener-seek" type="range" min="0" max="1000" step="1" value="1000" data-audio-seek="live" aria-label="Rewind buffered live broadcast" disabled>' +
      '<div class="audio-player-control-row">' +
      audioPlayerButton("live", "toggle-audio-playback", "Pause delayed live audio", "â¡") +
      '<span class="audio-listener-timer" data-audio-listen-timer aria-live="polite"></span>' +
      '<span class="audio-listener-time"><output data-audio-current-time="live">0:00</output><span aria-hidden="true"> / </span><output data-audio-duration="live">--:--</output></span>' +
      audioPlayerButton("live", "toggle-audio-mute", "Mute audio", "â))") +
      '<label class="audio-player-volume"><span class="sr-only">Volume</span><input type="range" min="0" max="100" step="1" value="100" data-audio-volume="live" aria-label="Delayed live audio volume"></label>' +
      '</div></div>' +
      '<p class="audio-player-note" data-live-audio-status aria-live="polite">' + escapeHtml(opts.status || "Opening the live audio roomâ¦") + '</p>' +
      '</section>'
    : program.recordingUrl
      ? '<section class="audio-player audio-listener-player" aria-label="Recorded audio player"><div class="audio-listener-player-heading"><span class="audio-listener-recorded">RECORDED BROADCAST</span><span class="audio-listener-player-caption">Listen to the full service</span></div>' +
        '<audio class="audio-listener-audio-source" crossorigin="anonymous" playsinline preload="metadata" data-recorded-audio-player data-audio-player="recorded" data-recording-duration-seconds="' + recordingDurationSeconds + '" src="' + escapeHtml(program.recordingUrl) + '" aria-hidden="true" tabindex="-1" aria-label="Play recording of ' + escapeHtml(program.title) + '"></audio>' +
        '<div class="audio-listener-controls" data-audio-player-controls="recorded">' +
        '<div class="audio-listener-waveform" data-audio-waveform="recorded" data-audio-waveform-seek role="img" aria-label="Recording waveform; highlighted bars show playback progress">' + audioWaveformBars() + '</div>' +
        '<input class="audio-listener-seek" type="range" min="0" max="1000" step="1" value="0" data-audio-seek="recorded" aria-label="Seek through recording" disabled>' +
        '<div class="audio-player-control-row">' +
        audioPlayerButton("recorded", "toggle-audio-playback", "Play recording", "â¶") +
        '<span class="audio-listener-time"><output data-audio-current-time="recorded">0:00</output><span aria-hidden="true"> / </span><output data-audio-duration="recorded">--:--</output></span>' +
        audioPlayerButton("recorded", "toggle-audio-mute", "Mute audio", "â))") +
        '<label class="audio-player-volume"><span class="sr-only">Volume</span><input type="range" min="0" max="100" step="1" value="100" data-audio-volume="recorded" aria-label="Recording volume"></label>' +
        '</div></div><p class="audio-player-note" data-audio-player-status="recorded">' + (offlinePlayback ? "Saved on this device Â· available offline." : "This recording was published by the church.") + '</p></section>'
      : '<section class="audio-player audio-listener-player"><p class="audio-player-note">This programme is not live right now. Return to the library to see when the next broadcast begins.</p></section>';
  const saveControl = isLive || !program.recordingPath || !program.recordingUrl
    ? ""
    : isSavedOffline
      ? '<p class="audio-listener-saved-note" role="status">Saved on this device for offline listening.</p>'
      : '<button class="audio-library-save audio-listener-save" type="button" data-action="save-live-audio" data-program-id="' + escapeHtml(program.id) + '">' +
        ((data.savingProgramIds && data.savingProgramIds.has(program.id)) ? "Savingâ¦" : "Save for offline") + '</button>';
  const commentList = comments.length
    ? '<ul class="audio-comment-list" aria-live="polite">' + comments.map(function (comment) {
      return '<li class="audio-comment"><span class="audio-comment-avatar" aria-hidden="true">â¢</span><div class="audio-comment-message"><div class="audio-comment-byline"><span>Listener</span><time datetime="' + escapeHtml(comment.createdAt) + '">' + escapeHtml(formattedTime(comment.createdAt)) + '</time></div><p>' + escapeHtml(comment.body) + '</p></div></li>';
    }).join("") + '</ul>'
    : '<p class="audio-comment-empty">Be the first to leave a comment.</p>';
  const interactions = offlinePlayback
    ? '<p class="audio-offline-interactions-note">Comments and reactions need an internet connection. Your saved recording is playing from this device.</p>'
    : '<div class="audio-reactions" aria-label="Reactions">' +
      '<button class="audio-reaction-button" type="button" data-action="audio-reaction" data-reaction="love" data-program-id="' + escapeHtml(program.id) + '" aria-pressed="' + liveAudioReactionSelected(data, program.id, "love") + '"><span class="audio-reaction-emoji">â¤ï¸</span><span>Love</span><span class="audio-reaction-count">' + counts.love + '</span></button>' +
      '<button class="audio-reaction-button" type="button" data-action="audio-reaction" data-reaction="clap" data-program-id="' + escapeHtml(program.id) + '" aria-pressed="' + liveAudioReactionSelected(data, program.id, "clap") + '"><span class="audio-reaction-emoji">ð</span><span>React</span><span class="audio-reaction-count">' + counts.clap + '</span></button>' +
      '<button class="audio-reaction-button" type="button" data-action="audio-reaction" data-reaction="fire" data-program-id="' + escapeHtml(program.id) + '" aria-pressed="' + liveAudioReactionSelected(data, program.id, "fire") + '"><span class="audio-reaction-emoji">ð</span><span>Amen</span><span class="audio-reaction-count">' + counts.fire + '</span></button>' +
      '<button class="audio-reaction-button audio-share-button" type="button" data-action="share-live-audio" data-program-id="' + escapeHtml(program.id) + '" aria-label="Share this programme"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4"/></svg><span>Share</span></button></div>' +
      '<section class="audio-comments" aria-labelledby="audio-comments-heading"><div class="audio-comments-heading"><div><span class="audio-comments-live-dot"></span><h2 id="audio-comments-heading">Live Comments</h2></div>' +
      '<span class="audio-comment-watchers">' + (isLive ? listenerCount + ' watching' : 'Programme comments') + '</span></div>' +
      '<form class="audio-comment-form" data-audio-comment-form data-program-id="' + escapeHtml(program.id) + '"><label class="sr-only" for="audio-comment-input">Your anonymous comment</label>' +
      '<textarea id="audio-comment-input" name="comment" rows="1" maxlength="280" required placeholder="Type a messageâ¦"></textarea>' +
      '<button class="button-primary audio-comment-send" type="submit" aria-label="Post comment"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.4 20.4 21 12 3.4 3.6 3 10l12 2-12 2z"/></svg></button></form>' +
      commentList + '</section>';
  return '<section class="page audio-listener-page">' + header + joinOverlay + '<div class="audio-listener-content">' +
    (data.error ? '<p class="audio-service-error" role="alert">' + escapeHtml(data.error) + '</p>' : "") + '<article class="audio-listener-card">' + artwork +
    '<div class="audio-listener-art-overlay">' +
    (isLive ? '<span class="audio-listener-live-badge"><i></i> LIVE</span><span class="audio-listener-viewers"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.2 0-7 2.1-7 4.5V21h14v-2.5c0-2.4-2.8-4.5-7-4.5Z"/></svg>' + listenerCount + '</span>' : '<span class="audio-listener-featured-badge">PUBLISHED PROGRAMME</span>') +
    '</div><div class="audio-listener-body"><div class="audio-listener-title-row"><div><h1>' + escapeHtml(program.title) + '</h1><p class="audio-listener-speaker">' +
    escapeHtml(program.speaker || "Consolation Evangelical and Revival Church") + '</p></div>' +
    (isLive ? '<span class="live-audio-badge is-live">On air</span>' : '<span class="live-audio-badge">Published programme</span>') + '</div>' +
    (meta.length || program.category ? '<div class="audio-listener-details">' + (program.category ? '<span class="audio-listener-category">' + escapeHtml(program.category) + '</span>' : "") +
      meta.map(function (item) { return '<span>' + item + '</span>'; }).join("") + '</div>' : "") +
    player + saveControl + (program.description ? '<p class="audio-listener-description">' + escapeHtml(program.description) + '</p>' : "") +
    interactions + '</div></article>' + (offlinePlayback ? "" : '<p class="audio-preview-notice">Comments and reactions are shared with other listeners. Comments are public and anonymous; avoid sharing private information.</p>') + '</div></section>';
}
