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

export function renderLiveAudioPage(data, query, category) {
  const programs = data.programs.filter(function (program) { return program.status === "published"; });
  const livePrograms = programs.filter(function (program) { return program.onAir && program.streamUrl; });
  const normalizedQuery = String(query || "").trim().toLocaleLowerCase();
  const formalPrograms = programs.filter(function (program) {
    if (program.onAir && program.streamUrl) return false;
    const matchesQuery = !normalizedQuery || (program.title + " " + program.category + " " + program.speaker + " " + program.description)
      .toLocaleLowerCase().includes(normalizedQuery);
    const matchesCategory = !category || program.category === category;
    return matchesQuery && matchesCategory;
  });
  const categoryOptions = Array.from(new Set(programs.map(function (program) { return program.category; })))
    .sort(function (a, b) { return a.localeCompare(b); });
  const selectOptions = '<option value="">All categories</option>' + categoryOptions.map(function (item) {
    return '<option value="' + escapeHtml(item) + '"' + (item === category ? " selected" : "") + ">" + escapeHtml(item) + "</option>";
  }).join("");
  return '<section class="page live-audio-page">' +
    '<div class="page-heading"><h1>Listen</h1><p>Live audio and published programmes from Consolation Evangelical and Revival Church.</p></div>' +
    '<section class="live-audio-hero" aria-label="Live audio status"><div class="live-audio-hero-copy">' +
    '<p class="live-audio-kicker">' + (livePrograms.length ? '<span class="live-audio-badge is-live">Live now</span>' : '<span class="live-audio-badge">Church radio</span>') + "</p>" +
    "<h2>" + (livePrograms.length ? "Join the service in progress." : "Stay close to the church community.") + "</h2>" +
    "<p>" + (livePrograms.length ? "Choose an audio programme below. Live audio playback is available when the stream is connected." : "No audio stream is on air right now. Published programmes will appear here when the church adds them.") + "</p></div>" +
    '<div class="live-audio-emblem"><img src="./assets/consolation-launcher.png" alt="Consolation Evangelical and Revival Church"></div></section>' +
    '<section class="audio-section" aria-labelledby="audio-live-heading"><div class="audio-section-heading"><div><h2 id="audio-live-heading">Live programmes</h2><p>Currently marked on air by the admin.</p></div></div>' +
    (livePrograms.length ? '<div class="audio-live-carousel" aria-label="Live audio programmes">' + livePrograms.map(function (program) { return programCard(program, true); }).join("") + "</div>" : emptyState("Nothing is live right now", "When a published programme is set on air, it will appear in this row.")) + "</section>" +
    '<section class="audio-section" aria-labelledby="audio-program-heading"><div class="audio-section-heading"><div><h2 id="audio-program-heading">Programme library</h2><p>Search by title, speaker, description, or category.</p></div></div>' +
    '<div class="audio-controls"><label class="sr-only" for="live-audio-search">Search programmes</label><input class="audio-search-input" id="live-audio-search" type="search" value="' + escapeHtml(query) + '" placeholder="Search programmes…" data-live-audio-search>' +
    '<label class="sr-only" for="live-audio-category">Filter by category</label><select class="audio-category-select" id="live-audio-category" data-live-audio-category>' + selectOptions + "</select></div>" +
    (formalPrograms.length ? '<div class="audio-program-grid">' + formalPrograms.map(function (program) { return programCard(program, false); }).join("") + "</div>" :
      emptyState(programs.length ? "No programmes match" : "No programmes published yet", programs.length ? "Try a different title or category." : "Published programmes from the admin workspace will be listed here.")) +
    '<p class="audio-preview-notice">This first-phase preview keeps programme details, comments, reactions, and listener counts in this browser only. WebRTC broadcasting and shared listener totals need a signaling and data service.</p></section></section>';
}

export function renderLiveAudioListener(data, programId) {
  const program = data.programs.find(function (item) { return item.id === programId && item.status === "published"; });
  if (!program) {
    return '<section class="page audio-listener-page"><button class="audio-back-button" type="button" data-action="back-to-live-audio">‹ Back to Listen</button>' +
      emptyState("Programme not found", "It may have been removed or saved as a draft.") + "</section>";
  }
  const counts = liveAudioCounts(data, program.id);
  const comments = data.comments.filter(function (comment) { return comment.programId === program.id; }).slice(-12).reverse();
  const player = program.streamUrl
    ? '<div class="audio-player"><audio controls preload="none" src="' + escapeHtml(program.streamUrl) + '" aria-label="Listen to ' + escapeHtml(program.title) + '"></audio><p class="audio-player-note">' + (program.onAir ? "Live audio stream. Playback may take a moment to connect." : "Audio stream provided by the church.") + "</p></div>"
    : '<div class="audio-player"><p class="audio-player-note">Audio playback will appear here when this programme has a secure stream URL. Peer-to-peer WebRTC is not connected in this preview.</p></div>';
  const commentList = comments.length
    ? '<ul class="audio-comment-list">' + comments.map(function (comment) {
      return '<li class="audio-comment"><p>' + escapeHtml(comment.body) + '</p><time datetime="' + escapeHtml(comment.createdAt) + '">' + escapeHtml(formattedDate(comment.createdAt)) + "</time></li>";
    }).join("") + "</ul>"
    : '<p class="audio-player-note">Be the first to leave a comment.</p>';
  const meta = [program.category, program.speaker, program.date ? formattedDate(program.date) : "", program.venue].filter(Boolean)
    .map(escapeHtml).join(" · ");
  return '<section class="page audio-listener-page"><button class="audio-back-button" type="button" data-action="back-to-live-audio">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg> Back to Listen</button>' +
    '<article class="audio-listener-card">' +
    (program.imageUrl ? '<div class="audio-listener-art"><img src="' + escapeHtml(program.imageUrl) + '" alt=""></div>' : '<div class="audio-listener-art"><span class="audio-listener-art-placeholder">' + radioIcon() + "</span></div>") +
    '<div class="audio-listener-body"><div class="audio-listener-title-row"><div><h1>' + escapeHtml(program.title) + "</h1>" +
    '<p class="audio-listener-speaker">' + (meta || "Consolation Evangelical and Revival Church") + "</p></div>" +
    (program.onAir ? '<span class="live-audio-badge is-live">On air</span>' : '<span class="live-audio-badge">Published programme</span>') + "</div>" +
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
    '<p class="audio-preview-notice">Comments and reactions in this preview are stored on this device only; they are not visible to other listeners.</p></section>';
}

