import { liveAudioCounts, liveAudioReactionSelected } from "./live-audio-data.js";

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

export function renderHomeAudioCard() {
  return '<section class="hero-card audio-home-card" aria-label="Church live audio">' +
    '<div class="hero-copy"><p class="hero-kicker">' + radioIcon() + " CHURCH LIVE AUDIO</p>" +
    "<h2>Listen together, wherever you are.</h2>" +
    "<p>Open the live audio room or browse published church programmes.</p>" +
    '<button class="button-primary" type="button" data-action="navigate" data-view="listen">' + radioIcon() + " Open Listen</button></div>" +
    '<img class="hero-mark" src="./assets/consolation-launcher.png" alt="" width="96" height="96"></section>';
}

function audioLibraryArtwork(program, className) {
  if (program && program.imageUrl) {
    return '<div class="' + className + '"><img src="' + escapeHtml(program.imageUrl) + '" alt="" loading="lazy"></div>';
  }
  return '<div class="' + className + ' audio-library-art-placeholder"><span class="audio-library-art-glow"></span><img src="./assets/consolation-launcher.png" alt="" loading="lazy"></div>';
}

function audioLibraryProgramRow(program) {
  const isLive = Boolean(program.onAir && program.liveSessionId);
  const meta = [program.speaker, program.date ? formattedDate(program.date) : "", program.venue]
    .filter(Boolean);
  if (isLive && program.listenCount) meta.push(program.listenCount + " listening");
  return '<article class="audio-library-row" data-testid="audio-program-' + escapeHtml(program.id) + '">' +
    audioLibraryArtwork(program, "audio-library-row-art") +
    '<div class="audio-library-row-copy"><div class="audio-library-row-kicker"><span>' + escapeHtml(program.category) + '</span>' +
    (isLive ? '<span class="audio-library-live-label"><i></i> Live</span>' : "") + '</div>' +
    '<h3>' + escapeHtml(program.title) + '</h3>' +
    (meta.length ? '<p class="audio-library-row-meta">' + meta.map(escapeHtml).join(' <span aria-hidden="true">·</span> ') + '</p>' : "") +
    '</div><button class="audio-library-row-play" type="button" data-action="open-live-audio" data-program-id="' + escapeHtml(program.id) + '" aria-label="' + (isLive ? "Listen to " : "Open ") + escapeHtml(program.title) + '">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 9 6-9 6z"/></svg></button></article>';
}

export function renderLiveAudioPage(data, query, category) {
  const programs = data.programs.filter(function (program) { return program.status === "published"; });
  const livePrograms = programs.filter(function (program) { return program.onAir && program.liveSessionId; });
  const normalizedQuery = String(query || "").trim().toLocaleLowerCase();
  const isLiveFilter = category === "__live__";
  const selectedCategory = isLiveFilter ? "" : String(category || "");
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
    categoryOptions.map(function (item) { return { value: item, label: item }; })
  );
  const filterMarkup = filters.map(function (item) {
    return '<button class="audio-library-filter' + (String(category || "") === item.value ? " is-selected" : "") + '" type="button" data-action="filter-live-audio" data-category="' + escapeHtml(item.value) + '" aria-pressed="' + (String(category || "") === item.value) + '">' +
      (item.value === "__live__" ? '<i class="audio-library-filter-dot" aria-hidden="true"></i>' : "") + escapeHtml(item.label) + '</button>';
  }).join("");
  const feature = livePrograms[0] || programs[0] || null;
  const waveformHeights = [22, 40, 28, 61, 38, 76, 31, 53, 88, 45, 68, 36, 96, 55, 73, 41, 83, 33, 62, 26, 49, 19, 37, 17];
  const waveform = waveformHeights.map(function (height) { return '<span style="height:' + height + '%"></span>'; }).join("");
  const featureMarkup = feature
    ? '<section class="audio-library-feature" aria-label="' + (livePrograms.length ? "Live programme" : "Featured programme") + '">' +
      audioLibraryArtwork(feature, "audio-library-feature-art") +
      '<div class="audio-library-feature-copy"><div class="audio-library-feature-status">' +
      (feature.onAir && feature.liveSessionId ? '<span class="audio-library-live-pill"><i></i> LIVE</span>' : '<span class="audio-library-feature-pill">FEATURED PROGRAMME</span>') +
      '<span class="audio-library-church-label">Consolation Evangelical and Revival Church</span></div>' +
      '<h1>' + escapeHtml(feature.title) + '</h1>' +
      '<p class="audio-library-feature-subtitle">' + escapeHtml(feature.speaker || "Worship · Word · Fellowship") + '</p>' +
      '<div class="audio-library-feature-meta">' + (feature.date ? '<span>' + escapeHtml(formattedDate(feature.date)) + '</span>' : "") +
      (feature.venue ? '<span>' + escapeHtml(feature.venue) + '</span>' : "") + '</div>' +
      '<div class="audio-library-feature-controls"><button class="audio-library-feature-play" type="button" data-action="open-live-audio" data-program-id="' + escapeHtml(feature.id) + '">' +
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m8 5 12 7-12 7z"/></svg>' + (feature.onAir && feature.liveSessionId ? "Listen now" : "Open programme") + '</button>' +
      '<div class="audio-library-waveform" aria-hidden="true">' + waveform + '</div>' +
      (feature.onAir && feature.listenCount ? '<span class="audio-library-listener-count">' + escapeHtml(feature.listenCount) + ' listening</span>' : "") +
      '</div></div></section>'
    : '<section class="audio-library-feature audio-library-feature-empty" aria-label="Church audio library">' +
      audioLibraryArtwork(null, "audio-library-feature-art") +
      '<div class="audio-library-feature-copy"><span class="audio-library-feature-pill">CHURCH AUDIO</span><h1>Listen together, wherever you are.</h1>' +
      '<p class="audio-library-feature-subtitle">Published services and programmes from Consolation Evangelical and Revival Church will appear here.</p>' +
      '<div class="audio-library-feature-controls"><div class="audio-library-waveform" aria-hidden="true">' + waveform + '</div></div></div></section>';
  const listContent = formalPrograms.length
    ? '<div class="audio-library-list" aria-live="polite">' + formalPrograms.map(audioLibraryProgramRow).join("") + '</div>'
    : '<div class="audio-library-empty" aria-live="polite"><span class="audio-library-empty-icon">' + radioIcon() + '</span><h3>' +
      (data.loading ? "Loading programmes" : programs.length ? "No programmes match" : "No programmes published yet") + '</h3><p>' +
      (data.loading ? "Checking for current broadcasts and published programmes…" : programs.length ? "Try another title or category." : "Published church programmes will appear here.") + '</p></div>';
  return '<section class="page live-audio-page audio-library-page">' +
    '<header class="audio-library-header"><div class="audio-library-header-inner">' +
    '<button class="audio-library-brand" type="button" data-action="navigate" data-view="home" aria-label="Go to Home"><img src="./assets/consolation-launcher.png" alt="" width="48" height="48"><span><strong>Consolation Evangelical<br>and Revival Church</strong><small>Audio Stream</small></span></button>' +
    '<div class="audio-library-header-actions"><a class="audio-library-header-icon" href="#live-audio-search" aria-label="Jump to programme search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/></svg></a>' +
    '<button class="audio-library-header-icon" type="button" data-action="navigate" data-view="programs" aria-label="Upcoming programmes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg></button>' +
    '<button class="audio-library-avatar" type="button" data-action="navigate" data-view="settings" aria-label="Open profile and settings">C</button></div></div></header>' +
    '<div class="audio-library-content">' + (data.error ? '<p class="audio-service-error" role="alert">' + escapeHtml(data.error) + '</p>' : "") +
    featureMarkup +
    '<section class="audio-library-section" aria-labelledby="audio-library-heading"><div class="audio-library-section-heading"><div><p class="audio-library-overline">CHURCH AUDIO</p><h2 id="audio-library-heading">Upcoming &amp; Recent Programmes</h2></div><span class="audio-library-program-count">' + formalPrograms.length + '</span></div>' +
    '<div class="audio-library-search-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/></svg><label class="sr-only" for="live-audio-search">Search programmes</label><input class="audio-library-search" id="live-audio-search" type="search" value="' + escapeHtml(query) + '" placeholder="Search programmes…" data-live-audio-search></div>' +
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
  if (!program) {
    return '<section class="page audio-listener-page"><button class="audio-back-button" type="button" data-action="back-to-live-audio">‹ Back to Listen</button>' +
      emptyState("Programme not found", "It may have been removed or saved as a draft.") + "</section>";
  }
  const counts = liveAudioCounts(data, program.id);
  const comments = data.comments.filter(function (comment) { return comment.programId === program.id; }).slice(-12).reverse();
  const isLive = program.onAir && Boolean(program.liveSessionId);
  const player = isLive
    ? '<div class="audio-player"><audio controls playsinline preload="none" data-live-audio-player aria-label="Listen to ' + escapeHtml(program.title) + '"></audio>' +
      '<p class="audio-player-note" data-live-audio-status aria-live="polite">' + escapeHtml(opts.status || "Connect to join the live audio room.") + "</p>" +
      '<div class="audio-live-actions"><button class="button-primary" type="button" data-action="connect-live-audio" data-program-id="' + escapeHtml(program.id) + '"' +
      (opts.connecting || opts.connected ? " disabled" : "") + ">" + (opts.connecting ? "Connecting…" : opts.connected ? "Connected" : "Connect to live audio") + "</button>" +
      (opts.connected || opts.connecting ? '<button class="button-secondary" type="button" data-action="disconnect-live-audio">Stop listening</button>' : "") + "</div></div>"
    : '<div class="audio-player"><p class="audio-player-note">This programme is not live right now. Return to Listen to see when the next broadcast begins.</p></div>';
  const commentList = comments.length
    ? '<ul class="audio-comment-list">' + comments.map(function (comment) {
      return '<li class="audio-comment"><p>' + escapeHtml(comment.body) + '</p><time datetime="' + escapeHtml(comment.createdAt) + '">' + escapeHtml(formattedDate(comment.createdAt)) + "</time></li>";
    }).join("") + "</ul>"
    : '<p class="audio-player-note">Be the first to leave a comment.</p>';
  const meta = [program.category, program.speaker, program.date ? formattedDate(program.date) : "", program.venue].filter(Boolean)
    .map(escapeHtml).join(" · ");
  return '<section class="page audio-listener-page"><button class="audio-back-button" type="button" data-action="back-to-live-audio">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg> Back to Listen</button>' +
    (data.error ? '<p class="audio-service-error" role="alert">' + escapeHtml(data.error) + "</p>" : "") +
    '<article class="audio-listener-card">' +
    (program.imageUrl ? '<div class="audio-listener-art"><img src="' + escapeHtml(program.imageUrl) + '" alt=""></div>' : '<div class="audio-listener-art"><span class="audio-listener-art-placeholder">' + radioIcon() + "</span></div>") +
    '<div class="audio-listener-body"><div class="audio-listener-title-row"><div><h1>' + escapeHtml(program.title) + "</h1>" +
    '<p class="audio-listener-speaker">' + (meta || "Consolation Evangelical and Revival Church") + "</p></div>" +
    (isLive ? '<span class="live-audio-badge is-live">On air</span>' : '<span class="live-audio-badge">Published programme</span>') + "</div>" +
    player + (program.description ? '<p class="audio-listener-description">' + escapeHtml(program.description) + "</p>" : "") +
    '<span class="audio-listener-timer" data-audio-listen-timer aria-live="polite"></span>' +
    '<div class="audio-reactions" aria-label="Reactions">' +
    '<button class="audio-reaction-button" type="button" data-action="audio-reaction" data-reaction="love" data-program-id="' + escapeHtml(program.id) + '" aria-pressed="' + liveAudioReactionSelected(data, program.id, "love") + '">❤️ <span>Love</span><span class="audio-reaction-count">' + counts.love + "</span></button>" +
    '<button class="audio-reaction-button" type="button" data-action="audio-reaction" data-reaction="clap" data-program-id="' + escapeHtml(program.id) + '" aria-pressed="' + liveAudioReactionSelected(data, program.id, "clap") + '">👏 <span>Clap</span><span class="audio-reaction-count">' + counts.clap + "</span></button>" +
    '<button class="audio-reaction-button" type="button" data-action="audio-reaction" data-reaction="fire" data-program-id="' + escapeHtml(program.id) + '" aria-pressed="' + liveAudioReactionSelected(data, program.id, "fire") + '">🔥 <span>Amen</span><span class="audio-reaction-count">' + counts.fire + "</span></button></div>" +
    '<section class="audio-comments" aria-labelledby="audio-comments-heading"><h2 id="audio-comments-heading">Share a comment</h2>' +
    '<form class="audio-comment-form" data-audio-comment-form data-program-id="' + escapeHtml(program.id) + '"><label class="sr-only" for="audio-comment-input">Your comment</label>' +
    '<textarea id="audio-comment-input" name="comment" maxlength="280" required placeholder="Encourage someone listening…"></textarea>' +
    '<button class="button-primary" type="submit">Post comment</button></form>' + commentList + "</section></div></article>" +
    '<p class="audio-preview-notice">Comments and reactions are shared with other listeners. Comments are public and do not display your name.</p></section>';
}

