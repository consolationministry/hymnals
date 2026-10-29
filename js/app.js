import { getAllHymns } from "./hymn-service.js";
import { searchHymns, rankHymnResults } from "./search.js";
import { getFavorites, isFavorite, toggleFavorite } from "./favorites.js";
import { addRecent, getRecentNumbers } from "./recent.js";
import { getReadingParts } from "./hymn-reading.js";
import { getMemberContent, servicePlanDayLabel } from "./public-content.js";
import { castProgrammeVote, getProgrammeInteractions } from "./programme-interactions.js";
import { excerptProgrammeDescription, PROGRAMME_DESCRIPTION_COLLAPSE_LIMIT, repairMojibake } from "./programme-feed-utils.js";
import { ACCENT_THEMES, getSettings, saveSettings } from "./settings.js";
import { shareHymn } from "./sharing.js";
import { applyAvailableUpdate, initializeUpdates } from "./updates.js";
import { APP_VERSION } from "./version.js";
import { remainingSplashMs } from "./splash-timing.js";
import { quoteBannerHtml, startQuoteBanner, stopQuoteBanner } from "./quote-banner.js";
import { displayHymnalName } from "./hymnal-labels.js";
import {
  emptyLiveAudioData,
  loadPublicLiveAudioSegment,
  loadPublicLiveAudioData,
  recordPublicLiveAudioListen,
  submitPublicLiveAudioComment,
  togglePublicLiveAudioReaction,
  sendPublicLiveAudioBurst
} from "./live-audio-public-data.js";
import { createLiveAudioId, subscribeLiveAudioBursts, getLiveAudioVisitorId } from "./live-audio-realtime.js";
import { publicLiveAudioConnectionMessage, publicLiveAudioJoinError, publicLiveAudioNetworkIssue } from "./live-audio-status.js";
import {
  createSavedLiveAudioPlaybackUrl,
  getSavedLiveAudioPrograms,
  removeSavedLiveAudioProgram,
  saveLiveAudioRecordingOffline
} from "./live-audio-offline.js";
import { startLiveAudioListener } from "./live-audio-webrtc.js";
import {
  mountAudioPlayer,
  prepareAudioPlayer,
  preserveRecordedAudioPlayer,
  isWaitingForLiveAudioSegment,
  getNextLiveAudioSegmentIndex,
  seekAudioPlayer,
  returnToLiveAudio,
  setLiveAudioStream,
  setAudioPlayerVolume,
  stopAudioPlayer,
  toggleAudioMute,
  toggleAudioPlayback
} from "./live-audio-player.js";
import { renderLiveAudioListener, renderLiveAudioPage } from "./live-audio-views.js";

const splashStartedAt = Date.now();
const CHURCH_MOTTO = "Occupy Till I Come";

const header = document.getElementById("brand-header");
const main = document.getElementById("main-content");
const nav = document.getElementById("bottom-nav");
const shell = document.getElementById("app-shell");
const splash = document.getElementById("splash");
const splashMotto = document.querySelector(".splash-motto");
if (splashMotto) splashMotto.textContent = CHURCH_MOTTO;
const toast = document.getElementById("toast");
const updateDialog = document.getElementById("update-dialog");
const updateMessage = document.getElementById("update-message");
const updateVersion = document.getElementById("update-version");
const updateStatus = document.getElementById("update-status");
const updateInstallButton = document.getElementById("update-install");
const state = { hymns: [], publicContent: null, programmeInteractions: {}, programmeInteractionsAvailable: null, programmeVotesAvailable: null, programmeVotePending: {}, programmeDescriptionsExpanded: {}, programmeSelectedId: null, programmeCategoryFilter: "", serviceSelectedId: null, serviceAimId: null, liveAudioData: emptyLiveAudioData(), savedLiveAudioPrograms: getSavedLiveAudioPrograms(), savingLiveAudioIds: new Set(), liveAudioPlaybackUrl: "", liveAudioOfflinePlayback: false, liveAudioOpenToken: 0, liveAudioLoading: false, liveAudioError: "", liveAudioJoinError: null, liveAudioQuery: "", liveAudioCategory: "", selectedLiveAudioProgramId: null, liveAudioStartedAt: null, liveAudioTimer: null, liveAudioPollTimer: null, liveAudioSegmentPollTimer: null, liveAudioSegmentRequest: false, liveAudioSegmentRequestToken: 0, liveAudioRequestToken: 0, liveAudioConnectToken: 0, liveAudioListener: null, liveAudioConnecting: false, liveAudioConnectionStatus: "", liveAudioStatusCode: "", liveAudioCountRecorded: false, liveAudioEnding: false, liveAudioEndingTimer: null, liveAudioBurstSub: null, liveAudioBurstProgramId: "", liveAudioListenEventId: "", view: "home", readerReturnView: "home", selectedNumber: null, query: "", category: "", searchOpen: false, settings: getSettings(), toastTimer: null };

const iconPaths = {
  home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20M8 7h8M8 10h7"/>',
  heart: '<path d="M20.8 8.8c0 5.3-8.8 11-8.8 11s-8.8-5.7-8.8-11a4.8 4.8 0 0 1 8.8-2.4 4.8 4.8 0 0 1 8.8 2.4Z"/>',
  history: '<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1a1.7 1.7 0 1 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 1 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 1 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 1 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 1 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 1 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 1 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 1 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  arrow: '<path d="m15 18-6-6 6-6"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  sparkle: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20.7 14.4A8.8 8.8 0 0 1 9.6 3.3 8.8 8.8 0 1 0 20.7 14.4Z"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  radio: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v10a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z"/><path d="m7 5 10-3M8 15h8"/><circle cx="8" cy="10" r="1.7"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/>'
};

function icon(name, extraClass) {
  return '<svg class="' + (extraClass || "") + '" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (iconPaths[name] || "") + '</svg>';
}

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character];
  });
}

function applyPreferences() {
  const preference = state.settings.theme;
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = preference === "system" ? (prefersDark ? "dark" : "light") : preference;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.accent = state.settings.accent;
  document.documentElement.style.setProperty("--hymn-size", state.settings.fontSize + "px");
  document.documentElement.style.fontSize = (state.settings.fontSize * 16 / 21) + "px";
}

function renderHeader() {
  const activeView = state.view === "reader" ? state.readerReturnView : state.view;
  const searchExpanded = state.view === "home" ? state.searchOpen || Boolean(state.query) : false;
  header.innerHTML = '<button class="brand-lockup" type="button" data-action="navigate" data-view="home" aria-label="Go to Home" data-testid="button-brand-home"><img src="./assets/consolation-launcher.png" alt="" width="60" height="60"><span><span class="brand-name">Consolation Evangelical<br class="brand-break"> and Revival Church</span><span class="brand-subtitle">' + CHURCH_MOTTO + '</span></span></button><div class="header-actions"><button class="header-icon-button" type="button" data-action="header-search" aria-label="Search hymns" aria-expanded="' + searchExpanded + '" data-testid="button-header-search">' + icon("search") + '</button></div>';
}

function renderNav() {
  const activeView = state.view === "reader" ? state.readerReturnView : state.view;
  const items = [
    ["home", "Home", "home"],
    ["programs", "Programs", "sparkle"],
    ["services", "Services", "calendar"],
    ["listen", "Stream", "mic"],
    ["recent", "Recent", "history"],
    ["settings", "Settings", "settings"]
  ];
  nav.innerHTML = items.map(function (item) {
    return '<button class="nav-item" type="button" data-action="navigate" data-view="' + item[0] + '" aria-current="' + (activeView === item[0] ? "page" : "false") + '" data-testid="nav-' + item[0] + '">' + icon(item[2]) + '<span>' + item[1] + '</span></button>';
  }).join("");
}

function renderSearchBar() {
  return '<div class="search-panel"><form class="search-form" role="search" data-search-form><label class="sr-only" for="hymn-search">Search by hymn number, title, keyword, or first line</label>' + icon("search", "search-icon") + '<input id="hymn-search" type="search" inputmode="search" autocomplete="off" value="' + escapeHtml(state.query) + '" placeholder="Search number, title, first line…" data-testid="input-hymn-search"><button class="search-submit" type="submit" aria-label="Search hymns" data-testid="button-search-hymns">' + icon("arrowRight") + '</button></form></div>';
}

function renderHomeSearch() {
  if (!state.searchOpen && !state.query) return "";
  return '<div class="home-search-control is-open">' + renderSearchBar() + '<button class="home-search-close" type="button" data-action="close-search" aria-label="Close search" data-testid="button-close-search">' + icon("close") + '</button></div>';
}

function hasEnglishText(hymn) {
  return Array.isArray(hymn.verses_en) && hymn.verses_en.length > 0;
}

function displayHymnNumber(hymn) {
  const label = String(hymn.source_number_label || hymn.source_hymn_number || hymn.hymn_number);
  const match = label.match(/^(\d+)(.*)$/);
  return match ? match[1].padStart(2, "0") + match[2] : label;
}

function currentHymnTitle(hymn) {
  return hymn.title_en || hymn.title_yoruba;
}

function titleMarkup(hymn) {
  return hymn.title_en ? '<span lang="en">' + escapeHtml(hymn.title_en) + '</span>' : '<span lang="yo">' + escapeHtml(hymn.title_yoruba) + '</span>';
}

function previewMarkup(hymn) {
  return hymn.first_line_en ? '<span lang="en">' + escapeHtml(hymn.first_line_en) + '</span>' : '<span lang="yo">' + escapeHtml(hymn.first_line_yoruba) + '</span>';
}

function favoriteButton(hymn) {
  const saved = isFavorite(hymn.hymn_number);
  return '<button class="icon-button favorite-toggle ' + (saved ? "is-favorite" : "") + '" type="button" data-action="favorite" data-number="' + hymn.hymn_number + '" aria-label="' + (saved ? "Remove from" : "Add to") + ' favorites: ' + escapeHtml(currentHymnTitle(hymn)) + '" aria-pressed="' + saved + '" data-testid="button-favorite-' + hymn.hymn_number + '">' + icon("heart") + '</button>';
}

function hymnCard(hymn) {
  const number = displayHymnNumber(hymn);
  return '<article class="hymn-card" data-testid="card-hymn-' + hymn.hymn_number + '"><button class="hymn-open" type="button" data-action="open-hymn" data-number="' + hymn.hymn_number + '" aria-label="Open hymn ' + number + ': ' + escapeHtml(currentHymnTitle(hymn)) + '" data-testid="button-open-hymn-' + hymn.hymn_number + '"><span class="hymn-card-top"><span class="hymn-number">' + number + '</span><span class="hymn-details"><h3>' + titleMarkup(hymn) + '</h3><span class="hymn-preview">' + previewMarkup(hymn) + '</span></span></span></button>' + favoriteButton(hymn) + '</article>';
}

function hymnList(hymns, emptyTitle, emptyMessage) {
  if (!hymns.length) {
    return '<section class="empty-state" aria-live="polite"><span class="empty-icon">' + icon("book") + '</span><h2>' + escapeHtml(emptyTitle) + '</h2><p>' + escapeHtml(emptyMessage) + '</p>' + (state.query ? '<button class="button-secondary" type="button" data-action="clear-filters" data-testid="button-clear-filters">Clear search and filters</button>' : '') + '</section>';
  }
  return '<div class="hymn-list" aria-live="polite">' + hymns.map(hymnCard).join("") + '</div>';
}


function pageHeading(title, subtitle) {
  const subtitleMarkup = subtitle ? '<p>' + escapeHtml(subtitle) + '</p>' : "";
  return '<div class="page-heading"><h1>' + escapeHtml(title) + '</h1>' + subtitleMarkup + '</div>';
}

function compareByPrintedNumber(a, b) {
  const pa = Number(a.source_hymn_number || a.hymn_number), pb = Number(b.source_hymn_number || b.hymn_number);
  return pa - pb || Number(a.hymn_number) - Number(b.hymn_number);
}

function languageLabel(language) {
  return { english: "English", yoruba: "Yorùbá" }[language] || "English";
}

function languageToggle() {
  const choices = ["english", "yoruba"];
  return '<div class="language-toggle" role="group" aria-label="Hymn language">' + choices.map(function (language) {
    return '<button type="button" data-action="language" data-language="' + language + '" aria-pressed="' + (state.settings.language === language) + '" data-testid="button-language-' + language + '">' + languageLabel(language) + '</button>';
  }).join("") + '</div>';
}

function inActiveLanguage(hymn) {
  return (hymn.language || "english") === state.settings.language;
}

function renderHome() {
  const activeHymns = state.hymns.filter(inActiveLanguage);
  const matchingHymns = state.query ? rankHymnResults(activeHymns, state.query) : activeHymns.slice().sort(compareByPrintedNumber);
  const visibleHymns = matchingHymns;
  const emptyWord = state.settings.language === "yoruba" ? "Yorùbá hymns" : "hymns";
  let collection;
  if (!visibleHymns.length) {
    collection = '<section class="empty-state home-empty" aria-live="polite"><h2>No matching ' + emptyWord + '</h2><p>Try another number, title, word, or first line.</p><button class="button-secondary" type="button" data-action="clear-home-search" data-testid="button-clear-home-search">Clear search</button></section>';
  } else {
    collection = '<div class="home-hymn-list" aria-live="polite">' + visibleHymns.map(homeHymn).join("") + '</div>';
  }
  return '<section class="page home-page"><div class="home-language">' + languageToggle() + '</div>' + renderHomeSearch() + collection + '</section>';
}
function renderHymnLibrary() {
  const results = searchHymns(state.hymns.filter(inActiveLanguage), state.query, "").slice().sort(compareByPrintedNumber);
  const caption = state.query ? "Search results" : "All hymns";
  const emptyTitle = "No matching hymns";
  const emptyMessage = state.query ? "Try another number, title, word, or first line." : "No hymns are available.";
  return '<section class="page">' + pageHeading("Hymn library", "Browse by number, title, keyword, or first line.") + renderSearchBar() + '<div class="results-meta"><span>' + escapeHtml(caption) + '</span><span>' + results.length + (results.length === 1 ? " hymn" : " hymns") + '</span></div>' + hymnList(results, emptyTitle, emptyMessage) + '</section>';
}

function renderFavorites() {
  const ids = new Set(getFavorites());
  const saved = state.hymns.filter(function (hymn) {
    return ids.has(String(hymn.hymn_number));
  });
  const emptyTitle = "No favorites yet";
  const emptyMessage = "Hymns you save appear here.";
  return '<section class="page">' + pageHeading("Favorites", "Your saved hymns stay on this device.") + hymnList(saved, emptyTitle, emptyMessage) + '</section>';
}

function poemSection(label, lyrics, chorus, languageCode, hasMeterPreface, hymnalNote, hymn) {
  const source = String(hymn && hymn.source_hymnal || "").trim();
  const imported = Boolean(hymn && Number.isFinite(Number(hymn.source_hymn_number)) && Number(hymn.source_hymn_number) > 0 &&
    ((languageCode === "yo" && source === "Uploaded Yorùbá Hymn Collection") || (languageCode === "en" && source === "Uploaded Hymn Collection")));
  const readingParts = getReadingParts(lyrics, chorus, { imported: imported, language: languageCode === "yo" ? "yoruba" : "english" });
  if (hymnalNote) readingParts.unshift({ type: "note", text: hymnalNote });
  const partsMarkup = readingParts.map(function (part) {
    if (part.type === "heading" || part.type === "note") {
      return '<div class="verse-block hymnal-note" role="note"><span class="verse-label">Hymnal note</span><p class="verse-text" lang="' + languageCode + '">' + escapeHtml(part.text).replace(/\r?\n/g, "<br>") + '</p></div>';
    }
    if (part.type === "chorus") {
      const chorusLabel = languageCode === "yo" ? "Egbe" : "Chorus";
      return '<div class="chorus-block"><span class="verse-label">' + chorusLabel + '</span><p class="verse-text" lang="' + languageCode + '">' + escapeHtml(part.text).replace(/\r?\n/g, "<br>") + '</p></div>';
    }
    return '<div class="verse-block">' + (part.label ? '<span class="verse-label">' + part.label + '</span>' : '') + '<p class="verse-text" lang="' + languageCode + '">' + escapeHtml(part.text).replace(/\r?\n/g, "<br>") + '</p></div>';
  }).join("");
  return '<section class="language-reading" lang="' + languageCode + '"><h2>' + label + '</h2>' + partsMarkup + '</section>';
}

function renderRecentlyViewed() {
  const viewed = getRecentNumbers().map(function (number) {
    return state.hymns.find(function (hymn) { return hymn.hymn_number === number; });
  }).filter(function (hymn) {
    return Boolean(hymn);
  });
  return '<section class="page">' + pageHeading("Recently viewed", "Your hymn history on this device, newest first.") + hymnList(viewed, "No recently viewed hymns", "Open a hymn and it will appear here for quick access.") + '</section>';
}

function publicDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value).slice(0, 10))) return "";
  const date = new Date(String(value).slice(0, 10) + "T00:00:00");
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date);
}

// Short human date like "12 Dec 2026", built from the YYYY-MM-DD value the admin saved.
function programmeShortDate(value) {
  const text = String(value || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return "";
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const year = text.slice(0, 4);
  const monthIndex = Number(text.slice(5, 7)) - 1;
  const day = Number(text.slice(8, 10));
  if (monthIndex < 0 || monthIndex > 11) return "";
  return day + " " + monthNames[monthIndex] + " " + year;
}

function publicStatus(startValue, endValue) {
  const start = String(startValue || "").slice(0, 10);
  const end = String(endValue || startValue || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) return "";
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
  if (end < today) return "Past";
  if (start > today) return "Upcoming";
  return "Current";
}

function publicStatusBadge(status) {
  if (!status) return "";
  return '<span class="public-content-status status-' + status.toLowerCase() + '">' + escapeHtml(status) + '</span>';
}

function publicPostedDate(value) {
  const timestamp = String(value || "");
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function renderProgrammeInteractions(program) {
  const programId = program && program.id;
  const safeProgramId = escapeHtml(programId);
  const interaction = state.programmeInteractions[programId] || { voteYesCount: 0, voteNoCount: 0, myVote: null };
  const votesAvailable = state.programmeVotesAvailable === true;
  const question = repairMojibake(String(program && program.response_question || "Will you be available for this programme?")).trim();
  const yesLabel = repairMojibake(String(program && program.yes_label || "Yes, I’ll be there")).trim();
  const noLabel = repairMojibake(String(program && program.no_label || "Not this time")).trim();
  const votePending = Boolean(state.programmeVotePending[programId]);
  const disabled = !votesAvailable || votePending;
  const yesCount = votesAvailable ? escapeHtml(Math.max(0, Number(interaction.voteYesCount) || 0)) : "—";
  const noCount = votesAvailable ? escapeHtml(Math.max(0, Number(interaction.voteNoCount) || 0)) : "—";
  const voteStatus = votesAvailable
    ? (interaction.myVote ? "Your response is saved. You can change it any time." : "Choose one response. Votes are anonymous.")
    : (state.programmeInteractionsAvailable === null ? "Loading voting…" : "Voting is temporarily unavailable.");
  return '<section class="programme-interactions" aria-label="Programme voting"><div class="programme-voting"><h3>' + escapeHtml(question) + '</h3><div class="programme-vote-options">' +
    '<button class="programme-vote-button" type="button" data-action="cast-programme-vote" data-choice="yes" data-program-id="' + safeProgramId + '" aria-pressed="' + (interaction.myVote === "yes") + '"' + (disabled ? " disabled" : "") + '><span>' + escapeHtml(yesLabel) + '</span><strong>' + yesCount + '</strong></button>' +
    '<button class="programme-vote-button" type="button" data-action="cast-programme-vote" data-choice="no" data-program-id="' + safeProgramId + '" aria-pressed="' + (interaction.myVote === "no") + '"' + (disabled ? " disabled" : "") + '><span>' + escapeHtml(noLabel) + '</span><strong>' + noCount + '</strong></button>' +
    '</div><p class="programme-vote-status" aria-live="polite">' + escapeHtml(voteStatus) + '</p></div></section>';
}

function programmeCategory(program) {
  return repairMojibake(String(program && program.category || "")).trim();
}

function renderProgrammeCard(program, detail) {
  const title = escapeHtml(repairMojibake(program.title || "Untitled programme"));
  const programId = escapeHtml(program.id);
  const category = programmeCategory(program);
  const startDateValue = String(program.start_date || "").slice(0, 10);
  const status = publicStatus(program.start_date, program.end_date);
  // Header date: "from <start> to <end>" when the programme has a different end date, otherwise one date.
  const endDateValue = String(program.end_date || "").slice(0, 10);
  const startLabel = programmeShortDate(startDateValue);
  const endLabel = programmeShortDate(endDateValue);
  const dateLabel = startLabel && endLabel && endDateValue !== startDateValue
    ? "from " + startLabel + " to " + endLabel
    : startLabel;
  const flyer = typeof program.flyer_data_url === "string"
    && /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(program.flyer_data_url)
    && program.flyer_data_url.length <= 1900000
    ? '<img class="public-program-post-flyer" src="' + escapeHtml(program.flyer_data_url) + '" alt="Flyer for ' + title + '" loading="lazy">'
    : "";
  const media = flyer ? '<div class="public-program-post-media">' + flyer + '</div>' : "";
  // Venue and minister are NOT shown in the header. They only appear in the detail block below the image.
  const venue = repairMojibake(String(program.venue || "")).trim();
  const description = repairMojibake(String(program.description || "")).trim();
  const expanded = detail || Boolean(state.programmeDescriptionsExpanded[program.id]);
  const descriptionId = "programme-description-" + String(program.id || "programme").replace(/[^a-z0-9_-]/gi, "").slice(0, 80);
  const descriptionIsLong = !detail && Array.from(description).length > PROGRAMME_DESCRIPTION_COLLAPSE_LIMIT;
  const descriptionMarkup = description
    ? '<div class="public-program-post-description"><p class="public-program-post-description-copy" id="' + descriptionId + '">' + escapeHtml(expanded ? description : excerptProgrammeDescription(description)) + '</p>' +
      (descriptionIsLong ? '<button class="public-program-read-more" type="button" data-action="toggle-programme-description" data-program-id="' + programId + '" aria-controls="' + descriptionId + '" aria-expanded="' + expanded + '">' + (expanded ? "See less" : "See more") + '</button>' : "") + '</div>'
    : "";
  const minister = repairMojibake(String(program && program.minister || "")).trim();
  const eventDate = dateLabel
    ? '<time class="public-program-post-event-date" datetime="' + escapeHtml(startDateValue) + '">' + escapeHtml(dateLabel) + '</time>'
    : "";
  // The date is under the title (in the header), so the meta row only holds the status badge.
  const eventMetadata = status
    ? '<div class="public-program-post-meta">' + publicStatusBadge(status) + '</div>'
    : "";
  const titleMarkup = detail
    ? '<h1 class="public-program-post-title">' + title + '</h1>'
    : '<h2 class="public-program-post-title"><button class="public-program-post-title-button" type="button" data-action="open-programme" data-program-id="' + programId + '">' + title + '</button></h2>';
  const categoryMarkup = category
    ? '<button class="public-program-post-category" type="button" data-action="filter-programme-category" data-category="' + escapeHtml(category) + '">' + escapeHtml(category) + '</button>'
    : "";
  const header = '<header class="public-program-post-header"><img class="public-program-post-avatar" src="./assets/consolation-launcher.png" alt="" width="42" height="42"><div class="public-program-post-identity">' + titleMarkup + eventDate + '</div>' + categoryMarkup + '</header>';
  const descriptionSection = descriptionMarkup
    ? '<div class="public-program-post-body">' + descriptionMarkup + '</div>'
    : "";
  // Detail view only: Venue and Ministers rows below the image, styled like the survey block.
  const detailsBlock = detail
    ? '<section class="public-program-details" aria-label="Programme details">' +
      '<div class="public-program-detail-row"><span class="public-program-detail-title">Venue</span><span class="public-program-detail-value">' + escapeHtml(venue || "Not listed yet") + '</span></div>' +
      '<div class="public-program-detail-row"><span class="public-program-detail-title">Ministers</span><span class="public-program-detail-value">' + escapeHtml(minister || "Not listed yet") + '</span></div>' +
      '</section>'
    : "";
  // Votes/reactions come last, after the image and (in detail view) the Venue/Ministers block.
  return '<article class="public-program-post' + (detail ? ' public-program-post-detail' : '') + '">' + header + eventMetadata + descriptionSection + media + detailsBlock + renderProgrammeInteractions(program) + '</article>';
}

function renderPublicPrograms(allPrograms, available) {
  const category = state.programmeCategoryFilter;
  const programs = category ? allPrograms.filter(function (program) { return programmeCategory(program) === category; }) : allPrograms;
  if (!programs.length && category) return '<div class="public-content-empty">No programmes in this category yet.</div>';
  if (!programs.length) {
    const message = available ? "No programmes have been posted yet." : "Programme announcements are unavailable right now. Please try again later.";
    return '<div class="public-content-empty">' + escapeHtml(message) + '</div>';
  }
  return '<div class="public-program-list">' + programs.map(function (program) {
    return renderProgrammeCard(program, false);
  }).join("") + '</div>';
}

function renderPublicProgramsPage() {
  const content = state.publicContent || { programs: [], servicePlans: [], programsAvailable: false, servicePlansAvailable: false };
  const programs = Array.isArray(content.programs) ? content.programs : [];
  if (state.programmeSelectedId) {
    const selected = programs.find(function (program) { return String(program.id) === String(state.programmeSelectedId); });
    if (selected) {
      return '<section class="page public-programs-page public-programs-detail-page">' +
        '<button class="reader-back public-program-back" type="button" data-action="close-programme">← Back to programmes</button>' +
        '<section class="public-content-section" aria-label="Programme post">' + renderProgrammeCard(selected, true) + '</section></section>';
    }
    state.programmeSelectedId = null;
  }
  const category = state.programmeCategoryFilter;
  const filterMarkup = category
    ? '<div class="public-program-filter"><span>Showing <strong>' + escapeHtml(category) + '</strong> programmes</span><button class="text-link" type="button" data-action="clear-programme-category">Show all</button></div>'
    : "";
  const listMarkup = renderPublicPrograms(content.programs, content.programsAvailable);
  return '<section class="page public-programs-page">' + pageHeading("Upcoming Programmes") +
    '<section class="public-content-section" aria-label="Programme announcements">' + filterMarkup + listMarkup + '</section></section>';
}

function openServiceAim(planId, hymnId) {
  state.serviceSelectedId = String(planId);
  state.serviceAimId = String(hymnId);
  render();
  window.scrollTo(0, 0);
}

function closeServiceAim() {
  state.serviceSelectedId = null;
  state.serviceAimId = null;
  render();
  window.scrollTo(0, 0);
}

function openProgrammePost(programId) {
  state.programmeSelectedId = String(programId);
  render();
  window.scrollTo(0, 0);
}

function closeProgrammePost() {
  state.programmeSelectedId = null;
  render();
  window.scrollTo(0, 0);
}

function showProgrammeCategory(category) {
  state.programmeSelectedId = null;
  state.programmeCategoryFilter = String(category || "");
  render();
  window.scrollTo(0, 0);
}

async function refreshProgrammeInteractions() {
  const programs = state.publicContent && Array.isArray(state.publicContent.programs)
    ? state.publicContent.programs
    : [];
  const result = await getProgrammeInteractions(programs);
  state.programmeInteractions = result.byProgram;
  state.programmeInteractionsAvailable = result.available;
  state.programmeVotesAvailable = result.votesAvailable;
  if (state.view === "programs") render();
}

async function castPublicProgrammeVote(programId, choice) {
  if (state.programmeVotePending[programId]) return;
  state.programmeVotePending[programId] = true;
  if (state.view === "programs") render();
  try {
    const result = await castProgrammeVote(programId, choice);
    const current = state.programmeInteractions[programId] || {};
    state.programmeInteractions[programId] = Object.assign({}, current, {
      myVote: result.myVote,
      voteYesCount: result.voteYesCount,
      voteNoCount: result.voteNoCount
    });
  } catch (error) {
    showToast(error && error.message ? error.message : "Your response could not be saved. Please try again.");
  } finally {
    delete state.programmeVotePending[programId];
    if (state.view === "programs") render();
  }
}

function servicePlanHymns(plan) {
  const ids = Array.isArray(plan && plan.hymn_ids) ? plan.hymn_ids : [];
  return ids.map(function (id) {
    return state.hymns.find(function (hymn) { return hymn.id && String(hymn.id) === String(id); });
  }).filter(Boolean);
}

function servicePlanDateText(plan) {
  const dateValue = String(plan.date || "").slice(0, 10);
  return servicePlanDayLabel(dateValue) || publicDate(dateValue) || "Service date";
}

function renderServiceCard(plan) {
  const dateValue = String(plan.date || "").slice(0, 10);
  const planId = escapeHtml(plan.id);
  const title = escapeHtml(repairMojibake(String(plan.title || "Untitled service")));
  const aims = servicePlanHymns(plan);
  const aimMarkup = aims.length
    ? '<ol class="public-service-hymns" aria-label="Aims for ' + title + '">' + aims.map(function (hymn) {
      return '<li><button type="button" class="public-service-hymn" data-action="open-service-aim" data-plan-id="' + planId + '" data-hymn-id="' + escapeHtml(hymn.id) + '"><span>' + escapeHtml(displayHymnNumber(hymn)) + '</span>' + escapeHtml(currentHymnTitle(hymn)) + '</button></li>';
    }).join("") + '</ol>'
    : '<p class="public-content-unavailable">No aims have been added for this service yet.</p>';
  return '<article class="public-program-post public-service-card">' +
    '<header class="public-program-post-header"><img class="public-program-post-avatar" src="./assets/consolation-launcher.png" alt="" width="42" height="42">' +
    '<div class="public-program-post-identity"><h2 class="public-program-post-title">' + title + '</h2>' +
    '<time class="public-program-post-event-date" datetime="' + escapeHtml(dateValue) + '">' + escapeHtml(servicePlanDateText(plan)) + '</time></div></header>' +
    '<div class="public-service-aims"><p class="public-service-aims-label">Aims</p>' + aimMarkup + '</div>' +
    '</article>';
}

function renderPublicServicePlans(plans, available) {
  if (!plans.length) {
    const message = available ? "No service plans have been posted yet." : "Service plans are unavailable right now. Please try again later.";
    return '<div class="public-content-empty">' + escapeHtml(message) + '</div>';
  }
  return '<div class="public-service-list">' + plans.map(renderServiceCard).join("") + '</div>';
}

function renderServiceAimDetail(plan, hymn) {
  const title = escapeHtml(currentHymnTitle(hymn));
  const firstLine = hymn.first_line_en || hymn.first_line_yoruba || "";
  return '<section class="page public-service-aim-page">' +
    '<button class="reader-back public-program-back" type="button" data-action="close-service-aim">← Back to service plans</button>' +
    '<article class="public-program-post public-program-post-detail public-service-aim-detail">' +
    '<header class="public-program-post-header"><img class="public-program-post-avatar" src="./assets/consolation-launcher.png" alt="" width="42" height="42">' +
    '<div class="public-program-post-identity"><h1 class="public-program-post-title">' + title + '</h1>' +
    '<time class="public-program-post-event-date" datetime="' + escapeHtml(String(plan.date || "").slice(0, 10)) + '">' + escapeHtml(repairMojibake(String(plan.title || ""))) + ' · ' + escapeHtml(servicePlanDateText(plan)) + '</time></div></header>' +
    '<section class="public-program-details" aria-label="Aim details">' +
    '<div class="public-program-detail-row"><span class="public-program-detail-title">Aim</span><span class="public-program-detail-value">' + escapeHtml(displayHymnNumber(hymn)) + ' · ' + title + '</span></div>' +
    (firstLine ? '<div class="public-program-detail-row"><span class="public-program-detail-title">First line</span><span class="public-program-detail-value">' + escapeHtml(firstLine) + '</span></div>' : "") +
    '</section>' +
    '<div class="public-service-aim-actions"><button class="button button-primary" type="button" data-action="open-hymn" data-number="' + escapeHtml(hymn.hymn_number) + '">Open full hymn</button></div>' +
    '</article></section>';
}

function renderPublicServicePlansPage() {
  const content = state.publicContent || { programs: [], servicePlans: [], programsAvailable: false, servicePlansAvailable: false };
  if (state.serviceSelectedId && state.serviceAimId) {
    const plan = content.servicePlans.find(function (item) { return String(item.id) === String(state.serviceSelectedId); });
    const hymn = plan ? servicePlanHymns(plan).find(function (item) { return String(item.id) === String(state.serviceAimId); }) : null;
    if (plan && hymn) return renderServiceAimDetail(plan, hymn);
    state.serviceSelectedId = null;
    state.serviceAimId = null;
  }
  return '<section class="page public-service-plans-page">' + pageHeading("Service Planner", "Each service and the aims planned for it. Tap an aim to open it.") +
    '<section class="public-content-section" aria-label="Service plans">' + renderPublicServicePlans(content.servicePlans, content.servicePlansAvailable) + '</section></section>';
}

function homeHymn(hymn) {
  const number = displayHymnNumber(hymn);
  const title = currentHymnTitle(hymn);
  return '<article class="home-hymn" data-testid="home-hymn-' + hymn.hymn_number + '"><header class="home-hymn-heading"><button class="home-hymn-open" type="button" data-action="open-hymn" data-number="' + hymn.hymn_number + '" aria-label="Open hymn ' + number + ': ' + escapeHtml(title) + '"><span class="hymn-number">' + number + '</span><span class="home-hymn-title">' + escapeHtml(title) + '</span></button></header></article>';
}

function renderReader() {
  const hymn = state.hymns.find(function (item) { return item.hymn_number === Number(state.selectedNumber); });
  if (!hymn) return '<section class="page">' + pageHeading("Hymn not found", "This number is not in the current collection.") + '<button class="button-secondary" type="button" data-action="back" data-testid="button-reader-back">' + icon("arrow") + ' Back to hymns</button></section>';
  const number = displayHymnNumber(hymn);
  const hasEnglish = (hymn.language || "english") !== "yoruba" && hasEnglishText(hymn);
  const sourceHymnal = String(hymn.source_hymnal || "").toLowerCase();
  const showEnglishGospelMeterHeading = sourceHymnal.includes("ghb") || sourceHymnal.includes("gospel hymn book");
  const title = hasEnglish
    ? '<span lang="en">' + escapeHtml(hymn.title_en) + '</span>'
    : '<span lang="yo">' + escapeHtml(hymn.title_yoruba) + '</span>';
  const firstLine = hasEnglish
    ? '<span lang="en">' + escapeHtml(hymn.first_line_en) + '</span>'
    : '<span lang="yo">' + escapeHtml(hymn.first_line_yoruba) + '</span>';
  const descriptionText = hasEnglish ? hymn.description_en : hymn.description_yoruba;
  const descriptionLang = hasEnglish ? "en" : "yo";
  const descriptionMarkup = descriptionText
    ? '<section class="hymn-description" lang="' + descriptionLang + '"><span class="verse-label">Description</span><p class="verse-text" lang="' + descriptionLang + '">' + escapeHtml(descriptionText) + '</p></section>'
    : "";
  const sections = descriptionMarkup + (hasEnglish
    ? poemSection("English", hymn.verses_en, hymn.chorus_en, "en", showEnglishGospelMeterHeading, "", hymn)
    : poemSection("Yorùbá", hymn.verses_yoruba, hymn.chorus_yoruba, "yo", false, hymn.hymnal_note, hymn));
  const translationNote = "";
  return '<section class="page reader-page"><div class="reader-topbar"><button class="reader-back" type="button" data-action="back" data-testid="button-reader-back">' + icon("arrow") + ' Back</button><div class="reader-actions">' + favoriteButton(hymn) + '<button class="icon-button" type="button" data-action="share" data-number="' + hymn.hymn_number + '" aria-label="Share hymn ' + number + '" data-testid="button-share-hymn">' + icon("share") + '</button></div></div><header class="reader-heading"><div class="reader-edition"><span class="hymn-number">' + number + '</span><span>' + escapeHtml(displayHymnalName(hymn)) + '</span></div><h1>' + title + '</h1><p class="reader-first-line">' + firstLine + '</p></header><div class="reader-meta">' + '<div class="reading-size" role="group" aria-label="Change hymn text size"><button type="button" data-action="font-decrease" aria-label="Decrease hymn text size" data-testid="button-font-decrease">A−</button><output id="reader-font-size">' + state.settings.fontSize + ' px</output><button type="button" data-action="font-increase" aria-label="Increase hymn text size" data-testid="button-font-increase">A+</button></div></div><div class="hymn-reading">' + translationNote + sections + '</div><footer class="reader-footer"><button class="text-link" type="button" data-action="share" data-number="' + hymn.hymn_number + '">' + icon("share") + ' Share hymn</button></footer></section>';
}

function themeChoice(theme, label, iconName) {
  return '<button class="preference-choice" type="button" data-action="theme" data-theme="' + theme + '" aria-pressed="' + (state.settings.theme === theme) + '" data-testid="button-theme-' + theme + '">' + icon(iconName) + label + '</button>';
}

function renderSettings() {
  const size = state.settings.fontSize;
  const accentLabels = { red: "Red", purple: "Purple", black: "Black", green: "Green", sky: "Sky", blue: "Blue" };
  const accentChoices = ACCENT_THEMES.map(function (accent) {
    return '<button class="preference-choice accent-choice" type="button" data-action="accent" data-accent="' + accent + '" aria-pressed="' + (state.settings.accent === accent) + '" data-testid="button-accent-' + accent + '"><span class="color-dot" aria-hidden="true"></span><span>' + accentLabels[accent] + '</span></button>';
  }).join("");
  return '<section class="page">' + pageHeading("Settings", "Make the hymn book comfortable for you.") +
    '<section class="settings-group"><h2>Appearance</h2><p class="settings-description">Choose how the app looks on this device.</p><div class="preference-choices">' + themeChoice("light", "Light", "sun") + themeChoice("dark", "Dark", "moon") + themeChoice("system", "System", "settings") + '</div></section>' +
    '<section class="settings-group"><h2>Accent colour</h2><p class="settings-description">Choose from six colours. Your choice works with light and dark mode.</p><div class="accent-grid">' + accentChoices + '</div></section>' +
    '<section class="settings-group"><h2>Reading</h2><p class="settings-description">Set your preferred text size. English and Yorùbá hymns appear together in one list.</p><div class="setting-row"><span><strong>Text size</strong><small id="settings-font-value">' + size + ' px</small></span><input class="setting-range" id="settings-font-size" type="range" min="17" max="32" step="1" value="' + size + '" aria-label="Text size across the app" data-testid="input-font-size"></div><p class="verse-text setting-preview" style="--hymn-size:' + size + 'px">The hymn text will use this size.</p></section>' +
    '<div class="settings-actions"><button class="button-primary settings-save" type="button" data-action="save-settings" data-testid="button-save-settings">' + icon("check") + ' Save settings</button></div>' +
    '<section class="settings-group"><h2>About</h2><div class="setting-row"><span><strong>Consolation Evangelical and Revival Church</strong><small>Digital hymnal · Version ' + APP_VERSION + '</small></span></div><p class="about-copy">The hymnal lists English and Yorùbá hymns in separate collections, numbered as printed in the book. Printed numbers are preserved, and matching numbers are not treated as translations. See data/SOURCES.md for catalog notes.</p><div class="setting-note" style="margin-top:14px"><strong>Publishing and attribution</strong><br>Hymns marked Published in the admin workspace appear in the public catalog. Confirm the source attribution and publishing permission before publishing additional material.</div><div class="setting-note" style="margin-top:14px"><strong>Privacy</strong><br>There are no member accounts. Favorites and preferences are saved only in this browser on this device; they are not sent to a server.</div></section></section>';
}

let splashChimePlayed = false;
function playSplashChime() {
  if (splashChimePlayed) return;
  const audio = new Audio("./assets/splash-chime.wav");
  audio.volume = 0.6;
  const attempt = audio.play();
  if (attempt && typeof attempt.then === "function") {
    attempt.then(function () { splashChimePlayed = true; }).catch(function () {
      // Mobile browsers block autoplay: play on the first touch or tap instead.
      const unlock = function () {
        document.removeEventListener("pointerdown", unlock);
        document.removeEventListener("touchend", unlock);
        if (!splashChimePlayed) { splashChimePlayed = true; audio.play().catch(function () {}); }
      };
      document.addEventListener("pointerdown", unlock, { once: true });
      document.addEventListener("touchend", unlock, { once: true });
    });
  } else {
    splashChimePlayed = true;
  }
}

function finishSplash() {
  playSplashChime();
  const delay = remainingSplashMs(splashStartedAt);
  window.setTimeout(function () {
    splash.classList.add("is-leaving");
    window.setTimeout(function () { splash.hidden = true; }, 370);
  }, delay);
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.remove("is-visible");
  requestAnimationFrame(function () { toast.classList.add("is-visible"); });
  state.toastTimer = window.setTimeout(function () { toast.hidden = true; }, 2800);
}

function getLiveAudioViewData() {
  const programs = state.liveAudioData.programs.slice();
  if (state.selectedLiveAudioProgramId) {
    let index = programs.findIndex(function (program) {
      return program.id === state.selectedLiveAudioProgramId;
    });
    if (index === -1) {
      const savedProgram = state.savedLiveAudioPrograms.find(function (program) {
        return program.id === state.selectedLiveAudioProgramId;
      });
      if (savedProgram) {
        programs.push(savedProgram);
        index = programs.length - 1;
      }
    }
    if (index !== -1 && state.liveAudioPlaybackUrl) {
      programs[index] = Object.assign({}, programs[index], {
        recordingUrl: state.liveAudioPlaybackUrl,
        savedOffline: true
      });
    }
  }
  return Object.assign({}, state.liveAudioData, {
    programs,
    savedPrograms: state.savedLiveAudioPrograms,
    savingProgramIds: state.savingLiveAudioIds
  });
}

function clearSavedAudioPlayback() {
  if (state.liveAudioPlaybackUrl && typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
    URL.revokeObjectURL(state.liveAudioPlaybackUrl);
  }
  state.liveAudioPlaybackUrl = "";
  state.liveAudioOfflinePlayback = false;
}

function render() {
  document.body.classList.toggle("audio-library-mode", state.view === "listen" && !state.selectedLiveAudioProgramId);
  document.body.classList.toggle("audio-listener-mode", state.view === "listen" && Boolean(state.selectedLiveAudioProgramId));
  applyPreferences();
  renderHeader();
  const isPreservingLiveAudioPlayer = state.view === "listen" && state.selectedLiveAudioProgramId &&
    (state.liveAudioConnecting || state.liveAudioListener);
  const isPreservingRecordedAudioPlayer = state.view === "listen" && state.selectedLiveAudioProgramId &&
    !state.liveAudioConnecting && !state.liveAudioListener;
  const preservedAudioPlayer = isPreservingLiveAudioPlayer
    ? main.querySelector("[data-live-audio-player]")
    : isPreservingRecordedAudioPlayer
      ? main.querySelector("[data-recorded-audio-player]")
      : null;
  const liveAudioViewData = getLiveAudioViewData();
  if (state.view === "home") main.innerHTML = renderHome();
  else if (state.view === "listen") main.innerHTML = state.selectedLiveAudioProgramId
    ? renderLiveAudioListener(
      Object.assign({}, liveAudioViewData, { error: state.liveAudioError }),
      state.selectedLiveAudioProgramId,
      {
        status: state.liveAudioConnectionStatus,
        connecting: state.liveAudioConnecting,
        connected: Boolean(state.liveAudioListener),
        offlinePlayback: state.liveAudioOfflinePlayback,
        joinError: state.liveAudioJoinError,
        loading: state.liveAudioLoading && navigator.onLine !== false && !liveAudioViewData.programs.length,
        networkError: navigator.onLine === false || Boolean(state.liveAudioError && /network|connection|reach/i.test(state.liveAudioError)),
        liveEnded: state.liveAudioStatusCode === "ended" && !state.liveAudioEnding,
        liveEnding: state.liveAudioEnding,
        opening: Boolean(state.liveAudioOpening),
        previousProgramId: liveAudioNeighbourId(-1),
        nextProgramId: liveAudioNeighbourId(1)
      }
    )
    : renderLiveAudioPage(
      Object.assign({}, liveAudioViewData, { loading: state.liveAudioLoading, error: state.liveAudioError }),
      state.liveAudioQuery,
      state.liveAudioCategory
    );
  else if (state.view === "programs") main.innerHTML = renderPublicProgramsPage();
  else if (state.view === "services") main.innerHTML = renderPublicServicePlansPage();
  else if (state.view === "favorites") main.innerHTML = renderFavorites();
  else if (state.view === "recent") main.innerHTML = renderRecentlyViewed();
  else if (state.view === "settings") main.innerHTML = renderSettings();
  else main.innerHTML = renderReader();
  if (preservedAudioPlayer && preservedAudioPlayer.dataset.audioPlayer === "recorded") {
    preserveRecordedAudioPlayer(preservedAudioPlayer, main);
  } else if (preservedAudioPlayer) {
    const nextAudioPlayer = main.querySelector("[data-live-audio-player]");
    if (nextAudioPlayer) {
      const liveSegments = nextAudioPlayer.dataset.liveAudioSegments;
      nextAudioPlayer.replaceWith(preservedAudioPlayer);
      if (liveSegments !== undefined) preservedAudioPlayer.dataset.liveAudioSegments = liveSegments;
    }
  }
  stopQuoteBanner();
  if (state.view === "home" || state.view === "listen") {
    main.insertAdjacentHTML("afterbegin", quoteBannerHtml());
    startQuoteBanner(main);
  }
  main.querySelectorAll("[data-audio-player]").forEach(function (audio) {
    mountAudioPlayer(audio, audio.closest(".audio-listener-player"));
  });
  renderNav();
  document.title = state.view === "reader" ? "Hymn " + String(state.selectedNumber).padStart(2, "0") + " · Consolation Hymnal" : state.view === "listen" ? "Listen · Consolation Hymnal" : "Consolation Hymnal";
}

function setSettings(changes, persist = true) {
  state.settings = Object.assign({}, state.settings, changes);
  const result = persist ? saveSettings(state.settings) : { settings: state.settings, persisted: true };
  state.settings = result.settings;
  render();
  if (!result.persisted) showToast("Preference changed for now, but browser storage is unavailable.");
}

function saveCurrentSettings() {
  const result = saveSettings(state.settings);
  state.settings = result.settings;
  render();
  showToast(result.persisted ? "Settings saved on this device." : "Settings changed for now, but browser storage is unavailable.");
}

window.addEventListener("popstate", function () {
  if (state.view !== "reader") return;
  state.view = state.readerReturnView;
  render();
  window.scrollTo(0, 0);
});

function openHymn(number) {
  const hymn = state.hymns.find(function (item) { return item.hymn_number === Number(number); });
  if (!hymn) return;
  state.readerReturnView = state.view === "reader" ? state.readerReturnView : state.view;
  state.selectedNumber = hymn.hymn_number;
  state.view = "reader";
  if (window.history && window.history.pushState) window.history.pushState({ hymnReader: true }, "", window.location.href);
  const persisted = addRecent(hymn.hymn_number);
  render();
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
  if (!persisted) showToast("Opened hymn. Browser storage is unavailable, so recent history may not persist.");
}

function navigate(view) {
  if (!["home", "listen", "programs", "services", "favorites", "recent", "settings"].includes(view)) return;
  if (state.view === "listen" && (view !== "listen" || state.selectedLiveAudioProgramId)) {
    state.liveAudioOpenToken += 1;
    main.querySelectorAll("[data-audio-player]").forEach(stopAudioPlayer);
    stopLiveAudioConnection();
    clearSavedAudioPlayback();
    if (view !== "listen") stopLiveAudioRefresh();
  }
  state.view = view;
  state.searchOpen = false;
  if (view === "listen") {
    state.selectedLiveAudioProgramId = null;
    state.liveAudioLoading = navigator.onLine !== false;
    state.liveAudioError = "";
  }
  if (view === "services") {
    state.serviceSelectedId = null;
    state.serviceAimId = null;
  }
  if (view === "programs") {
    state.programmeSelectedId = null;
    state.programmeCategoryFilter = "";
  }
  render();
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
  if (view === "listen") {
    if (navigator.onLine !== false) {
      void refreshLiveAudioData();
      startLiveAudioRefresh();
    } else {
      stopLiveAudioRefresh();
      state.liveAudioLoading = false;
      render();
    }
  }
}

function stopLiveAudioTimer() {
  if (state.liveAudioTimer) window.clearInterval(state.liveAudioTimer);
  state.liveAudioTimer = null;
  state.liveAudioStartedAt = null;
}

function updateLiveAudioTimer() {
  const label = main.querySelector("[data-audio-listen-timer]");
  if (!label || !state.liveAudioStartedAt) return;
  const elapsed = Math.max(0, Math.floor((Date.now() - state.liveAudioStartedAt) / 1000));
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  label.textContent = "Listening · " + minutes + ":" + seconds;
}

function beginLiveAudioTimer() {
  stopLiveAudioTimer();
  state.liveAudioStartedAt = Date.now();
  updateLiveAudioTimer();
  state.liveAudioTimer = window.setInterval(updateLiveAudioTimer, 1000);
}

async function refreshLiveAudioData() {
  const requestToken = ++state.liveAudioRequestToken;
  state.liveAudioLoading = true;
  state.liveAudioError = "";
  try {
    const data = await loadPublicLiveAudioData();
    if (requestToken !== state.liveAudioRequestToken) return;
    state.liveAudioData = data;
    ensureLiveAudioBurstSubscription();
    if (state.selectedLiveAudioProgramId && state.liveAudioListener) {
      const current = data.programs.find(program => program.id === state.selectedLiveAudioProgramId);
      if (!current || !current.onAir || current.liveSessionId !== state.liveAudioSessionId) {
        state.liveAudioConnectToken += 1;
        const listener = state.liveAudioListener;
        state.liveAudioListener = null;
        state.liveAudioConnecting = false;
        state.liveAudioStatusCode = "ended";
        state.liveAudioConnectionStatus = "This broadcast has ended.";
        beginLiveAudioEnding();
        stopLiveAudioTimer();
        stopAudioPlayer(main.querySelector("[data-live-audio-player]"));
        if (listener) listener.stop().catch(() => {});
      }
    }
  } catch (error) {
    if (requestToken !== state.liveAudioRequestToken) return;
    state.liveAudioError = error && error.message
      ? error.message
      : "Live Audio could not load. Check your connection and try again.";
  } finally {
    if (requestToken === state.liveAudioRequestToken) {
      state.liveAudioLoading = false;
      if (state.view === "listen") {
        if (state.selectedLiveAudioProgramId && state.liveAudioListener &&
            state.liveAudioStatusCode !== "ended") {
          const program = state.liveAudioData.programs.find(item =>
            item.id === state.selectedLiveAudioProgramId
          );
          const audio = main.querySelector("[data-live-audio-player]");
          if (program && audio) {
            audio.dataset.liveAudioSegments = JSON.stringify(program.liveSegments || []);
            mountAudioPlayer(audio, audio.closest(".audio-listener-player"));
          }
        } else {
          render();
        }
      }
    }
  }
}

async function refreshWaitingLiveAudioSegment() {
  if (state.liveAudioSegmentRequest || state.view !== "listen" ||
      !state.selectedLiveAudioProgramId || !state.liveAudioListener ||
      navigator.onLine === false) return;
  const audio = main.querySelector("[data-live-audio-player]");
  const segmentIndex = getNextLiveAudioSegmentIndex(audio);
  if (segmentIndex === null) return;
  const program = state.liveAudioData.programs.find(item =>
    item.id === state.selectedLiveAudioProgramId
  );
  if (!program || !program.liveSessionId) return;

  state.liveAudioSegmentRequest = true;
  const requestToken = ++state.liveAudioSegmentRequestToken;
  try {
    const segment = await loadPublicLiveAudioSegment(
      program.id,
      program.liveSessionId,
      segmentIndex
    );
    if (requestToken !== state.liveAudioSegmentRequestToken ||
        !segment || state.view !== "listen" || !state.liveAudioListener ||
        state.selectedLiveAudioProgramId !== program.id ||
        main.querySelector("[data-live-audio-player]") !== audio ||
        !isWaitingForLiveAudioSegment(audio)) return;
    const segments = JSON.parse(audio.dataset.liveAudioSegments || "[]");
    if (segments.some(item => Number(item.index) === segment.index)) return;
    segments.push(segment);
    segments.sort((left, right) => Number(left.index) - Number(right.index));
    audio.dataset.liveAudioSegments = JSON.stringify(segments);
    mountAudioPlayer(audio, audio.closest(".audio-listener-player"));
  } catch (error) {
    // Keep the waiting player alive; the next short poll retries this one segment.
  } finally {
    if (requestToken === state.liveAudioSegmentRequestToken) {
      state.liveAudioSegmentRequest = false;
    }
  }
}

function startLiveAudioRefresh() {
  stopLiveAudioRefresh();
  state.liveAudioPollTimer = window.setInterval(function () {
    if (state.view === "listen" && navigator.onLine !== false) void refreshLiveAudioData();
  }, 25000);
  ensureLiveAudioBurstSubscription();
  state.liveAudioSegmentPollTimer = window.setInterval(function () {
    void refreshWaitingLiveAudioSegment();
  }, 2500);
}

function stopLiveAudioRefresh() {
  if (state.liveAudioBurstSub) { state.liveAudioBurstSub.close(); state.liveAudioBurstSub = null; }
  state.liveAudioBurstProgramId = "";
  if (state.liveAudioPollTimer) window.clearInterval(state.liveAudioPollTimer);
  if (state.liveAudioSegmentPollTimer) window.clearInterval(state.liveAudioSegmentPollTimer);
  state.liveAudioPollTimer = null;
  state.liveAudioSegmentPollTimer = null;
  state.liveAudioSegmentRequest = false;
  state.liveAudioSegmentRequestToken += 1;
  state.liveAudioRequestToken += 1;
}

// Shows a short spinner, then the "programme has ended" banner with save/download.
function beginLiveAudioEnding() {
  state.liveAudioEnding = true;
  if (state.liveAudioEndingTimer) window.clearTimeout(state.liveAudioEndingTimer);
  state.liveAudioEndingTimer = window.setTimeout(function () {
    state.liveAudioEnding = false;
    state.liveAudioEndingTimer = null;
    if (state.view === "listen") render();
  }, 1600);
}

// Keeps one realtime burst subscription for the programme on air; polling stays as the fallback.
function ensureLiveAudioBurstSubscription() {
  const programId = state.view === "listen" ? state.selectedLiveAudioProgramId : null;
  const data = state.liveAudioData;
  const program = programId && data ? data.programs.find(item => item.id === programId) : null;
  const wanted = Boolean(program && program.onAir && program.liveSessionId);
  if (!wanted) {
    if (state.liveAudioBurstSub) { state.liveAudioBurstSub.close(); state.liveAudioBurstSub = null; }
    state.liveAudioBurstProgramId = "";
    return;
  }
  if (state.liveAudioBurstSub && state.liveAudioBurstProgramId === programId) return;
  if (state.liveAudioBurstSub) state.liveAudioBurstSub.close();
  state.liveAudioBurstProgramId = programId;
  const myVisitor = getLiveAudioVisitorId();
  state.liveAudioBurstSub = subscribeLiveAudioBursts(programId, {
    onBurst(burst) {
      // Own reactions already float locally on tap; show everyone else's.
      if (burst.visitorId === myVisitor || state.view !== "listen") return;
      spawnFloatingBurst(burst.reaction);
    }
  });
}

function spawnFloatingBurst(reaction) {
  const page = document.querySelector(".audio-listener-page") || document.body;
  const emoji = { love: "❤️", clap: "👏", fire: "🔥", like: "👍" }[reaction] || "👍";
  const float = document.createElement("span");
  float.className = "audio-float-emoji";
  float.setAttribute("aria-hidden", "true");
  float.textContent = emoji;
  float.style.left = (5 + Math.random() * 90) + "%";
  float.style.top = (10 + Math.random() * 80) + "%";
  float.style.setProperty("--drift", String(Math.round(Math.random() * 60 - 30)) + "px");
  page.appendChild(float);
  window.setTimeout(function () { float.remove(); }, 1400);
}

function stopLiveAudioConnection() {
  state.liveAudioConnectToken += 1;
  const listener = state.liveAudioListener;
  state.liveAudioListener = null;
  state.liveAudioConnecting = false;
  state.liveAudioStatusCode = "";
  state.liveAudioConnectionStatus = "";
  state.liveAudioJoinError = null;
  state.liveAudioSessionId = "";
  state.liveAudioCountRecorded = false;
  state.liveAudioListenEventId = "";
  stopLiveAudioTimer();
  if (listener) listener.stop().catch(() => {});
}

async function recordCurrentLiveAudioListen(programId, connectToken) {
  if (state.liveAudioCountRecorded || !state.liveAudioListenEventId) return;
  state.liveAudioCountRecorded = true;
  try {
    await recordPublicLiveAudioListen(programId, state.liveAudioListenEventId);
    if (connectToken === state.liveAudioConnectToken) await refreshLiveAudioData();
  } catch (error) {
    state.liveAudioCountRecorded = false;
    if (connectToken === state.liveAudioConnectToken) {
      state.liveAudioConnectionStatus = "Connected, but listener totals could not sync.";
      const status = main.querySelector("[data-live-audio-status]");
      if (status) status.textContent = state.liveAudioConnectionStatus;
    }
  }
}

function getLiveAudioNetworkInfo() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return {
    online: navigator.onLine !== false,
    effectiveType: connection && connection.effectiveType,
    rtt: connection && connection.rtt,
    downlink: connection && connection.downlink
  };
}

function retryLiveAudioProgram(programId) {
  if (state.view !== "listen" || state.selectedLiveAudioProgramId !== programId) return;
  if (navigator.onLine === false) {
    state.liveAudioJoinError = publicLiveAudioNetworkIssue(getLiveAudioNetworkInfo());
    state.liveAudioConnectionStatus = state.liveAudioJoinError.message;
    render();
    return;
  }
  const audio = main.querySelector("[data-live-audio-player]");
  if (audio) stopAudioPlayer(audio);
  stopLiveAudioConnection();
  render();
  void connectLiveAudioProgram(programId);
}

function updateLiveAudioConnectionStatus(connectToken, status) {
  if (connectToken !== state.liveAudioConnectToken) return;
  state.liveAudioStatusCode = status;
  if (status === "failed") {
    state.liveAudioJoinError = publicLiveAudioJoinError(new Error(""), getLiveAudioNetworkInfo());
  } else if (status === "reconnecting" || status === "disconnected") {
    state.liveAudioJoinError = publicLiveAudioNetworkIssue(getLiveAudioNetworkInfo());
  } else {
    state.liveAudioJoinError = null;
  }
  state.liveAudioConnectionStatus = state.liveAudioJoinError
    ? state.liveAudioJoinError.message
    : publicLiveAudioConnectionMessage(status);
  const statusNode = main.querySelector("[data-live-audio-status]");
  if (statusNode) statusNode.textContent = state.liveAudioConnectionStatus;

  if (status === "live") {
    if (!state.liveAudioStartedAt) beginLiveAudioTimer();
    if (state.liveAudioListener) void recordCurrentLiveAudioListen(state.selectedLiveAudioProgramId, connectToken);
  } else if (status === "ended" || status === "failed") {
    state.liveAudioConnectToken += 1;
    const listener = state.liveAudioListener;
    state.liveAudioListener = null;
    state.liveAudioConnecting = false;
    stopLiveAudioTimer();
    stopAudioPlayer(main.querySelector("[data-live-audio-player]"));
    if (listener) listener.stop().catch(() => {});
    if (status === "ended") beginLiveAudioEnding();
    render();
    if (status === "ended") void refreshLiveAudioData();
    return;
  }
  if (state.view === "listen") render();
}

async function connectLiveAudioProgram(programId) {
  if (state.liveAudioConnecting || state.liveAudioListener) return;
  const program = state.liveAudioData.programs.find(item => item.id === programId);
  if (!program || !program.onAir || !program.liveSessionId) {
    showToast("This programme is no longer live. Refresh Listen to see the current broadcast.");
    void refreshLiveAudioData();
    return;
  }

  const connectToken = ++state.liveAudioConnectToken;
  state.liveAudioConnecting = true;
  state.liveAudioJoinError = null;
  state.liveAudioConnectionStatus = publicLiveAudioConnectionMessage("connecting");
  state.liveAudioStatusCode = "connecting";
  state.liveAudioCountRecorded = false;
  state.liveAudioListenEventId = createLiveAudioId();
  render();
  const audioElement = main.querySelector("[data-live-audio-player]");
  if (!audioElement) {
    state.liveAudioConnecting = false;
    state.liveAudioStatusCode = "failed";
    state.liveAudioJoinError = publicLiveAudioJoinError(new Error("The live player could not be opened."), getLiveAudioNetworkInfo());
    state.liveAudioConnectionStatus = state.liveAudioJoinError.message;
    render();
    return;
  }
  void prepareAudioPlayer(audioElement);

  try {
    const listener = await startLiveAudioListener({
      programId: program.id,
      sessionId: program.liveSessionId,
      audioElement,
      onStream: stream => setLiveAudioStream(audioElement, stream),
      onStatus: status => updateLiveAudioConnectionStatus(connectToken, status)
    });
    if (connectToken !== state.liveAudioConnectToken || state.view !== "listen" ||
        state.selectedLiveAudioProgramId !== program.id || state.liveAudioStatusCode === "ended" ||
        state.liveAudioStatusCode === "failed") {
      await listener.stop();
      return;
    }
    state.liveAudioListener = listener;
    state.liveAudioSessionId = program.liveSessionId;
    state.liveAudioConnecting = false;
    if (state.liveAudioStatusCode === "live") {
      void recordCurrentLiveAudioListen(program.id, connectToken);
    }
    render();
  } catch (error) {
    if (connectToken !== state.liveAudioConnectToken) return;
    state.liveAudioConnecting = false;
    state.liveAudioStatusCode = "failed";
    state.liveAudioJoinError = publicLiveAudioJoinError(error, getLiveAudioNetworkInfo());
    state.liveAudioConnectionStatus = state.liveAudioJoinError.message;
    const statusNode = main.querySelector("[data-live-audio-status]");
    if (statusNode) statusNode.textContent = state.liveAudioConnectionStatus;
    render();
  }
}

function spawnFloatingReaction(target) {
  const page = document.querySelector(".audio-listener-page");
  if (!page || !target) return;
  const emoji = target.dataset.emoji || "👍";
  const float = document.createElement("span");
  float.className = "audio-float-emoji";
  float.setAttribute("aria-hidden", "true");
  float.textContent = emoji;
  const rect = target.getBoundingClientRect();
  const pageRect = page.getBoundingClientRect();
  float.style.left = (rect.left - pageRect.left + rect.width / 2 + (Math.random() * 40 - 20)) + "px";
  float.style.top = (rect.top - pageRect.top) + "px";
  float.style.setProperty("--drift", String(Math.round(Math.random() * 60 - 30)) + "px");
  page.appendChild(float);
  window.setTimeout(function () { float.remove(); }, 1400);
}

async function handleLiveAudioReaction(programId, reaction, target) {
  if (reaction !== "like") {
    spawnFloatingReaction(target);
    try {
      await sendPublicLiveAudioBurst(programId, reaction);
    } catch (error) {
      showToast(error && error.message ? error.message : "The reaction could not be sent.");
    }
    return;
  }
  try {
    await togglePublicLiveAudioReaction(programId, reaction);
    await refreshLiveAudioData();
  } catch (error) {
    showToast(error && error.message ? error.message : "The reaction could not be saved.");
  }
}

async function handleLiveAudioComment(form) {
  const programId = form.dataset.programId;
  const input = form.elements.comment;
  try {
    await submitPublicLiveAudioComment(programId, input.value);
    await refreshLiveAudioData();
    showToast("Comment shared with listeners.");
  } catch (error) {
    showToast(error && error.message ? error.message : "Comment could not be saved.");
  }
}

async function saveLiveAudioForOffline(programId) {
  const program = state.liveAudioData.programs.find(function (item) {
    return item.id === programId && item.status === "published";
  });
  if (!program) {
    showToast("Refresh the programme list before saving this recording.");
    return;
  }
  state.savingLiveAudioIds.add(programId);
  render();
  try {
    await saveLiveAudioRecordingOffline(program);
    state.savedLiveAudioPrograms = getSavedLiveAudioPrograms();
    showToast("Recording saved on this device for offline listening.");
  } catch (error) {
    showToast(error && error.message ? error.message : "The recording could not be saved.");
  } finally {
    state.savingLiveAudioIds.delete(programId);
    render();
  }
}

async function removeLiveAudioFromOffline(programId) {
  try {
    state.savedLiveAudioPrograms = await removeSavedLiveAudioProgram(programId);
    render();
    showToast("Recording removed from this device.");
  } catch (error) {
    showToast(error && error.message ? error.message : "The saved recording could not be removed.");
  }
}

function liveAudioNeighbourId(direction) {
  const list = state.liveAudioData && Array.isArray(state.liveAudioData.programs) ? state.liveAudioData.programs : [];
  const index = list.findIndex(function (item) { return item.id === state.selectedLiveAudioProgramId; });
  const neighbour = index >= 0 ? list[index + direction] : null;
  return neighbour ? neighbour.id : "";
}

async function openLiveAudioProgram(programId) {
  const program = state.liveAudioData.programs.find(function (item) {
    return item.id === programId;
  }) || state.savedLiveAudioPrograms.find(function (item) {
    return item.id === programId;
  });
  if (!program) return;

  const openToken = ++state.liveAudioOpenToken;
  main.querySelectorAll("[data-audio-player]").forEach(stopAudioPlayer);
  stopLiveAudioConnection();
  clearSavedAudioPlayback();
  state.selectedLiveAudioProgramId = programId;
  state.view = "listen";
  stopLiveAudioTimer();
  state.liveAudioOpening = true;
  window.setTimeout(function () {
    if (state.liveAudioOpening && state.selectedLiveAudioProgramId === programId) {
      state.liveAudioOpening = false;
      if (state.view === "listen") render();
    }
  }, 1400);
  render();
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });

  const isSaved = state.savedLiveAudioPrograms.some(function (item) {
    return item.id === programId;
  });
  if (!program.onAir && isSaved) {
    try {
      const playbackUrl = await createSavedLiveAudioPlaybackUrl(programId);
      if (openToken !== state.liveAudioOpenToken || state.view !== "listen" ||
          state.selectedLiveAudioProgramId !== programId) {
        if (playbackUrl) URL.revokeObjectURL(playbackUrl);
        return;
      }
      if (playbackUrl) {
        state.liveAudioPlaybackUrl = playbackUrl;
        state.liveAudioOfflinePlayback = true;
        render();
      } else if (!program.recordingUrl) {
        showToast("This saved audio is missing from device storage. Reconnect and save it again.");
      }
    } catch (error) {
      showToast("The saved recording could not be opened from device storage.");
    }
  }
  if (program.onAir && program.liveSessionId) {
    void connectLiveAudioProgram(programId);
  }
}

function updateSearch(value, selectionStart, selectionEnd) {
  state.query = value;
  if (state.view !== "home") state.view = "home";
  state.searchOpen = true;
  render();
  const input = document.getElementById("hymn-search");
  if (input) {
    input.focus({ preventScroll: true });
    if (typeof input.setSelectionRange === "function") input.setSelectionRange(selectionStart, selectionEnd);
  }
}

function adjustFont(delta) {
  const nextSize = Math.max(17, Math.min(32, state.settings.fontSize + delta));
  if (nextSize !== state.settings.fontSize) setSettings({ fontSize: nextSize });
}

async function performShare(number) {
  const hymn = state.hymns.find(function (item) { return item.hymn_number === Number(number); });
  if (!hymn) return;
  const result = await shareHymn(hymn, "english");
  if (result === "shared" || result === "cancelled") return;
  if (result === "copied") showToast("Hymn text copied. You can paste it into a message.");
  else {
    window.prompt("Copy this hymn text to share:", result);
  }
}

function showUpdateNotice(update) {
  updateDialog.dataset.updateKind = update.kind;
  updateDialog.dataset.releaseUrl = update.releaseUrl || "";
  updateVersion.textContent = update.version ? "Version " + update.version : "";
  updateMessage.textContent = update.message || update.kind === "android"
    ? "Download the Android update now. Android will ask you to confirm installation before replacing this app."
    : "A newer offline-ready version of the hymnal is ready to install.";
  updateInstallButton.textContent = update.kind === "android" ? "Download & install" : "Install update";
  updateInstallButton.disabled = false;
  updateStatus.hidden = true;
  updateStatus.textContent = "";
  if (!updateDialog.open) updateDialog.showModal();
}

async function installAvailableUpdate() {
  updateInstallButton.disabled = true;
  updateStatus.hidden = false;
  updateStatus.textContent = "Preparing the update…";
  try {
    const result = await applyAvailableUpdate(function (message) {
      updateStatus.textContent = message;
    });
    if (result && result.releaseUrl) {
      window.open(result.releaseUrl, "_blank", "noopener,noreferrer");
      updateDialog.close();
    } else if (result && result.reload) {
      updateStatus.textContent = "Restarting with the new version…";
    } else {
      updateStatus.textContent = "The installer is ready. Follow the Android prompts to finish.";
    }
  } catch (error) {
    updateInstallButton.disabled = false;
    updateStatus.textContent = error && error.message
      ? error.message
      : "The update could not be downloaded. Check your connection and try again.";
  }
}

// A programme share link is the site address plus ?program=<id>.
function buildProgrammeShareLink(programId) {
  const link = new URL(window.location.href);
  link.search = "";
  link.hash = "";
  link.searchParams.set("program", String(programId));
  return link.toString();
}

// When someone opens a programme link, read the id from the address bar.
function getProgrammeIdFromLink() {
  return new URLSearchParams(window.location.search).get("program");
}

async function shareLiveAudioProgram(programId) {
  const program = state.liveAudioData.programs.find(item => item.id === programId && item.status === "published");
  if (!program) return;
  // Build a link to THIS programme only, e.g. https://site/hymnals/?program=abc
  const shareData = {
    title: program.title,
    text: "Listen to " + program.title + " from Consolation Evangelical and Revival Church.",
    url: buildProgrammeShareLink(program.id)
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareData.text + " " + shareData.url);
      showToast("Programme details copied to clipboard.");
    } else {
      showToast("Sharing is not available on this device.");
    }
  } catch (error) {
    if (error && error.name === "AbortError") return;
    showToast("Could not share this programme.");
  }
}

window.addEventListener("offline", function () {
  if (state.view !== "listen" || !state.selectedLiveAudioProgramId ||
      (!state.liveAudioConnecting && !state.liveAudioListener)) return;
  state.liveAudioJoinError = publicLiveAudioNetworkIssue({ online: false });
  state.liveAudioConnectionStatus = state.liveAudioJoinError.message;
  render();
});

window.addEventListener("online", function () {
  if (state.view !== "listen" || !state.liveAudioJoinError ||
      state.liveAudioJoinError.kind !== "network") return;
  state.liveAudioJoinError = {
    kind: "network",
    message: "Your connection is back online. Tap Retry to rejoin the live broadcast."
  };
  state.liveAudioConnectionStatus = state.liveAudioJoinError.message;
  render();
});

document.addEventListener("click", function (event) {
  const target = event.target.closest("[data-action]");
  if (!target) {
    return;
  }
  const action = target.dataset.action;
  if (action === "dismiss-update") updateDialog.close();
  else if (action === "install-update") installAvailableUpdate();
  else if (action === "save-settings") saveCurrentSettings();
  else if (action === "navigate") navigate(target.dataset.view);
  else if (action === "language") setSettings({ language: target.dataset.language === "yoruba" ? "yoruba" : "english" });
  else if (action === "header-search") {
      if (state.view === "home") {
      state.searchOpen = state.query ? true : !state.searchOpen;
    } else {
      state.view = "home";
      state.searchOpen = true;
    }
    render();
    const input = document.getElementById("hymn-search");
    if (input) input.focus();
  } else if (action === "close-search" || action === "clear-home-search") {
    state.query = "";
    state.searchOpen = false;
    render();
  } else if (action === "open-hymn") openHymn(target.dataset.number);
  else if (action === "filter-live-audio") {
    state.liveAudioCategory = target.dataset.category || "";
    render();
    const selectedFilter = Array.from(main.querySelectorAll('[data-action="filter-live-audio"]')).find(function (button) { return button.dataset.category === state.liveAudioCategory; });
    if (selectedFilter) selectedFilter.focus({ preventScroll: true });
  } else if (action === "open-live-audio") {
    void openLiveAudioProgram(target.dataset.programId);
  } else if (action === "save-live-audio") {
    void saveLiveAudioForOffline(target.dataset.programId);
  } else if (action === "remove-saved-live-audio") {
    void removeLiveAudioFromOffline(target.dataset.programId);
  } else if (action === "connect-live-audio") {
    void connectLiveAudioProgram(target.dataset.programId);
  } else if (action === "retry-live-audio") {
    retryLiveAudioProgram(target.dataset.programId);
  } else if (action === "disconnect-live-audio") {
    stopLiveAudioConnection();
    state.liveAudioConnectionStatus = "Listening stopped.";
    render();
  } else if (action === "back-to-live-audio") {
    state.liveAudioOpenToken += 1;
    main.querySelectorAll("[data-audio-player]").forEach(stopAudioPlayer);
    stopLiveAudioConnection();
    stopLiveAudioTimer();
    clearSavedAudioPlayback();
    state.selectedLiveAudioProgramId = null;
    render();
    if (navigator.onLine !== false) void refreshLiveAudioData();
  } else if (action === "share-live-audio") {
    void shareLiveAudioProgram(target.dataset.programId);
  } else if (action === "toggle-audio-playback") {
    const audio = main.querySelector('[data-audio-player="' + target.dataset.playerType + '"]');
    void toggleAudioPlayback(audio).catch(function () {
      showToast("Audio could not start. Check your connection and try again.");
    });
  } else if (action === "return-to-live-audio") {
    returnToLiveAudio(main.querySelector('[data-audio-player="live"]'));
  } else if (action === "switch-audio-program") {
    const neighbourId = liveAudioNeighbourId(Number(target.dataset.direction || 0));
    if (neighbourId) void openLiveAudioProgram(neighbourId);
  } else if (action === "toggle-audio-mute") {
    toggleAudioMute(main.querySelector('[data-audio-player="' + target.dataset.playerType + '"]'));
  } else if (action === "audio-reaction") {
    void handleLiveAudioReaction(target.dataset.programId, target.dataset.reaction, target);
  }
  else if (action === "toggle-programme-description") {
    const programId = target.dataset.programId;
    state.programmeDescriptionsExpanded[programId] = !state.programmeDescriptionsExpanded[programId];
    render();
    const descriptionButtons = Array.from(main.querySelectorAll('[data-action="toggle-programme-description"]'));
    const nextButton = descriptionButtons.find(function (button) { return button.dataset.programId === programId; });
    if (nextButton) nextButton.focus();
  }
  else if (action === "open-service-aim") openServiceAim(target.dataset.planId, target.dataset.hymnId);
  else if (action === "close-service-aim") closeServiceAim();
  else if (action === "open-programme") openProgrammePost(target.dataset.programId);
  else if (action === "close-programme") closeProgrammePost();
  else if (action === "filter-programme-category") showProgrammeCategory(target.dataset.category);
  else if (action === "clear-programme-category") showProgrammeCategory("");
  else if (action === "cast-programme-vote") castPublicProgrammeVote(target.dataset.programId, target.dataset.choice);
  else if (action === "back") {
    if (state.view === "reader" && window.history && window.history.state && window.history.state.hymnReader) {
      window.history.back();
      return;
    }
    state.view = state.readerReturnView;
    render();
    window.scrollTo(0, 0);
  } else if (action === "favorite") {
    const result = toggleFavorite(target.dataset.number);
    render();
    showToast(result.isFavorite ? "Added to Favorites." : "Removed from Favorites.");
    if (!result.persisted) showToast("Favorite changed for now, but browser storage is unavailable.");
  }
  else if (action === "clear-filters") {
    state.query = "";
    render();
  } else if (action === "font-increase") adjustFont(1);
  else if (action === "font-decrease") adjustFont(-1);
  else if (action === "theme") setSettings({ theme: target.dataset.theme }, state.view !== "settings");
  else if (action === "accent") setSettings({ accent: target.dataset.accent }, state.view !== "settings");
  else if (action === "share") performShare(target.dataset.number);
});

document.addEventListener("keydown", function (event) {
});

document.addEventListener("input", function (event) {
  if (event.target.matches("[data-audio-seek]")) {
    if (event.target.dataset.audioSeek !== "live") {
      seekAudioPlayer(main.querySelector('[data-audio-player="' + event.target.dataset.audioSeek + '"]'), event.target.value);
    }
  } else if (event.target.matches("[data-audio-volume]")) {
    setAudioPlayerVolume(main.querySelector('[data-audio-player="' + event.target.dataset.audioVolume + '"]'), event.target.value);
  } else if (event.target.matches("[data-live-audio-search]")) {
    state.liveAudioQuery = event.target.value;
    render();
    const input = document.getElementById("live-audio-search");
    if (input) {
      input.focus({ preventScroll: true });
      input.setSelectionRange(input.value.length, input.value.length);
    }
  } else if (event.target.id === "hymn-search") {
    const start = event.target.selectionStart == null ? event.target.value.length : event.target.selectionStart;
    const end = event.target.selectionEnd == null ? event.target.value.length : event.target.selectionEnd;
    updateSearch(event.target.value, start, end);
  } else if (event.target.id === "settings-font-size") {
    const size = Number(event.target.value);
    state.settings = Object.assign({}, state.settings, { fontSize: size });
    applyPreferences();
    const label = document.getElementById("settings-font-value");
    const preview = main.querySelector(".setting-preview");
    if (label) label.textContent = size + " px";
    if (preview) preview.style.setProperty("--hymn-size", size + "px");
  }
});

document.addEventListener("change", function (event) {
  if (!event.target.matches("[data-live-audio-category]")) return;
  state.liveAudioCategory = event.target.value;
  render();
});

document.addEventListener("submit", function (event) {
  if (event.target.matches("[data-audio-comment-form]")) {
    event.preventDefault();
    void handleLiveAudioComment(event.target);
  } else if (event.target.matches("[data-search-form]")) {
    event.preventDefault();
    if (state.view !== "home") state.view = "home";
    render();
    window.scrollTo(0, 0);
  }
});

if (window.matchMedia) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", function () { if (state.settings.theme === "system") applyPreferences(); });
}

window.addEventListener("online", function () {
  if (state.view !== "listen") return;
  state.liveAudioError = "";
  void refreshLiveAudioData();
  startLiveAudioRefresh();
});

async function openProgrammeFromLink() {
  const programId = getProgrammeIdFromLink();
  if (!programId) return;
  // Never let the deep-link load hang: give the refresh a bounded wait, then
  // fall through to a clear message instead of an endless loading state.
  let timer = null;
  const limit = new Promise(function (resolve) {
    timer = window.setTimeout(resolve, 12000);
  });
  try {
    await Promise.race([refreshLiveAudioData(), limit]);
  } catch (error) {
    showToast("Could not load this programme. Check the connection and try again.");
    return;
  } finally {
    if (timer !== null) window.clearTimeout(timer);
  }
  const programs = (state.liveAudioData && state.liveAudioData.programs) || [];
  const exists = programs.some(function (item) { return item.id === programId; });
  if (exists) {
    void openLiveAudioProgram(programId);
  } else {
    showToast("This programme link is no longer available.");
  }
}

async function boot() {
  try {
    const results = await Promise.all([getAllHymns(), getMemberContent()]);
    state.hymns = results[0];
    state.publicContent = results[1];
    render();
    refreshProgrammeInteractions();
    shell.hidden = false;
    finishSplash();
    initializeUpdates({ onAvailable: showUpdateNotice });
    await openProgrammeFromLink();
  } catch (error) {
    shell.hidden = false;
    header.innerHTML = "";
    main.innerHTML = '<section class="page empty-state" role="alert"><h1>Hymns could not be loaded</h1><p>Refresh this page to try again.</p></section>';
    nav.innerHTML = "";
    finishSplash();
  }
}

boot();
