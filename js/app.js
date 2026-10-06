import { getAllHymns } from "./hymn-service.js";
import { searchHymns } from "./search.js";
import { getFavorites, isFavorite, toggleFavorite } from "./favorites.js";
import { addRecent } from "./recent.js";
import { ACCENT_THEMES, getSettings, saveSettings } from "./settings.js";
import { shareHymn } from "./sharing.js";
import { applyAvailableUpdate, initializeUpdates } from "./updates.js";
import { APP_VERSION } from "./version.js";

const header = document.getElementById("brand-header");
const main = document.getElementById("main-content");
const nav = document.getElementById("bottom-nav");
const shell = document.getElementById("app-shell");
const splash = document.getElementById("splash");
const toast = document.getElementById("toast");
const updateDialog = document.getElementById("update-dialog");
const updateMessage = document.getElementById("update-message");
const updateVersion = document.getElementById("update-version");
const updateStatus = document.getElementById("update-status");
const updateInstallButton = document.getElementById("update-install");
const categories = ["Praise", "Worship", "Thanksgiving", "Prayer", "Faith", "Hope", "Service", "Community", "Family", "Evangelism"];
const state = { hymns: [], view: "home", readerReturnView: "home", selectedNumber: null, query: "", category: "", searchOpen: false, settings: getSettings(), toastTimer: null };

const iconPaths = {
  home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20M8 7h8M8 10h7"/>',
  heart: '<path d="M20.8 8.8c0 5.3-8.8 11-8.8 11s-8.8-5.7-8.8-11a4.8 4.8 0 0 1 8.8-2.4 4.8 4.8 0 0 1 8.8 2.4Z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1a1.7 1.7 0 1 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 1 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 1 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 1 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 1 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 1 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 1 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 1 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/>',
  arrow: '<path d="m15 18-6-6 6-6"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  sparkle: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20.7 14.4A8.8 8.8 0 0 1 9.6 3.3 8.8 8.8 0 1 0 20.7 14.4Z"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>'
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

function renderHeader() {
  header.innerHTML = '<button class="brand-lockup" type="button" data-action="navigate" data-view="home" aria-label="Go to Home" data-testid="button-brand-home"><img src="./assets/demo-church-mark.svg" alt="" width="44" height="44"><span><span class="brand-name">Consolation Evangelical<br class="brand-break"> and Revival Church</span><span class="brand-subtitle">Faith · Hope · Worship</span></span></button>';
}

function renderNav() {
  const activeView = state.view === "reader" ? state.readerReturnView : state.view;
  const items = [
    ["home", "Home", "home"],
    ["hymns", "Hymns", "book"],
    ["favorites", "Favorites", "heart"],
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
  if (!state.searchOpen && !state.query) {
    return '<div class="home-search-control"><button class="home-search-trigger" type="button" data-action="open-search" data-testid="button-open-search">' + icon("search") + '<span>Search hymns</span></button></div>';
  }
  return '<div class="home-search-control is-open">' + renderSearchBar() + '<button class="home-search-close" type="button" data-action="close-search" aria-label="Close search" data-testid="button-close-search">' + icon("close") + '</button></div>';
}

function renderLanguageArea() {
  return '<div class="section-language"><span class="sr-only">Choose hymn language</span>' + languageToggle() + '</div>';
}

function hasYorubaText(hymn) {
  return Array.isArray(hymn.verses_yoruba) && hymn.verses_yoruba.length > 0;
}

function pendingYorubaMarkup() {
  return '<span class="yoruba-pending" lang="en">Yorùbá text pending</span>';
}

function titleMarkup(hymn) {
  const hasYoruba = hasYorubaText(hymn);
  if (state.settings.language === "yoruba") {
    return hasYoruba
      ? '<span lang="yo">' + escapeHtml(hymn.title_yoruba) + '</span>'
      : '<span lang="en">' + escapeHtml(hymn.title_en) + '</span>' + pendingYorubaMarkup();
  }
  return '<span lang="en">' + escapeHtml(hymn.title_en) + '</span>';
}

function previewMarkup(hymn) {
  const hasYoruba = hasYorubaText(hymn);
  if (state.settings.language === "yoruba" && hasYoruba) return '<span lang="yo">' + escapeHtml(hymn.first_line_yoruba) + '</span>';
  return '<span lang="en">' + escapeHtml(hymn.first_line_en) + '</span>';
}

function favoriteButton(hymn) {
  const saved = isFavorite(hymn.hymn_number);
  return '<button class="icon-button favorite-toggle ' + (saved ? "is-favorite" : "") + '" type="button" data-action="favorite" data-number="' + hymn.hymn_number + '" aria-label="' + (saved ? "Remove from" : "Add to") + ' favorites: ' + escapeHtml(hymn.title_en) + '" aria-pressed="' + saved + '" data-testid="button-favorite-' + hymn.hymn_number + '">' + icon("heart") + '</button>';
}

function hymnCard(hymn) {
  const number = String(hymn.hymn_number).padStart(2, "0");
  return '<article class="hymn-card" data-testid="card-hymn-' + hymn.hymn_number + '"><button class="hymn-open" type="button" data-action="open-hymn" data-number="' + hymn.hymn_number + '" aria-label="Open hymn ' + number + ': ' + escapeHtml(hymn.title_en) + '" data-testid="button-open-hymn-' + hymn.hymn_number + '"><span class="hymn-card-top"><span class="hymn-number">' + number + '</span><span class="hymn-details"><h3>' + titleMarkup(hymn) + '</h3><span class="hymn-preview">' + previewMarkup(hymn) + '</span><span class="hymn-category">' + escapeHtml(hymn.category) + '</span></span></span></button>' + favoriteButton(hymn) + '</article>';
}

function hymnList(hymns, emptyTitle, emptyMessage) {
  if (!hymns.length) {
    return '<section class="empty-state" aria-live="polite"><span class="empty-icon">' + icon("book") + '</span><h2>' + escapeHtml(emptyTitle) + '</h2><p>' + escapeHtml(emptyMessage) + '</p>' + (state.query || state.category ? '<button class="button-secondary" type="button" data-action="clear-filters" data-testid="button-clear-filters">Clear search and filters</button>' : '') + '</section>';
  }
  return '<div class="hymn-list" aria-live="polite">' + hymns.map(hymnCard).join("") + '</div>';
}

function categoryButtons(selected) {
  const all = [""].concat(categories);
  return '<div class="category-list" role="group" aria-label="Filter hymns by theme">' + all.map(function (category) {
    const label = category || "All hymns";
    return '<button class="category-chip" type="button" data-action="category" data-category="' + escapeHtml(category) + '" aria-pressed="' + (selected === category) + '" data-testid="filter-category-' + (category ? category.toLowerCase() : "all") + '">' + escapeHtml(label) + '</button>';
  }).join("") + '</div>';
}

function pageHeading(title, subtitle) {
  return '<div class="page-heading"><h1>' + escapeHtml(title) + '</h1><p>' + escapeHtml(subtitle) + '</p></div>';
}

function renderHome() {
  const matchingHymns = searchHymns(state.hymns, state.query, "");
  const visibleHymns = state.settings.language === "yoruba"
    ? matchingHymns.filter(hasYorubaText)
    : matchingHymns;
  let collection;
  if (!visibleHymns.length && state.settings.language === "yoruba") {
    collection = '<section class="empty-state home-empty" aria-live="polite"><h2>Yorùbá hymns are not available yet</h2><p>This collection does not contain verified Yorùbá translations yet. Switch to English to read the available hymns.</p><button class="button-secondary" type="button" data-action="language" data-language="english" data-testid="button-switch-to-english">Show English hymns</button></section>';
  } else if (!visibleHymns.length) {
    collection = '<section class="empty-state home-empty" aria-live="polite"><h2>No matching hymns</h2><p>Try another number, title, word, or first line.</p><button class="button-secondary" type="button" data-action="clear-home-search" data-testid="button-clear-home-search">Clear search</button></section>';
  } else {
    collection = '<div class="home-hymn-list" aria-live="polite">' + visibleHymns.map(homeHymn).join("") + '</div>';
  }
  return '<section class="page home-page">' + renderHomeSearch() + '<div class="home-language">' + languageToggle() + '</div>' + collection + '</section>';
}
function renderHymnLibrary() {
  const results = searchHymns(state.hymns, state.query, state.category).filter(function (hymn) {
    return state.settings.language !== "yoruba" || hasYorubaText(hymn);
  });
  const caption = state.category ? state.category : (state.query ? "Search results" : "All hymns");
  const emptyTitle = state.settings.language === "yoruba" ? "No verified Yorùbá hymns" : "No matching hymns";
  const emptyMessage = state.settings.language === "yoruba"
    ? "Verified Yorùbá translations are not available in this collection yet. Switch to English to browse the available hymns."
    : (state.query ? "Try another number, title, word, or first line." : "No hymns are available.");
  return '<section class="page">' + pageHeading("Hymn library", "Browse by number, title, keyword, or first line.") + renderSearchBar() + renderLanguageArea() + '<section class="library-tools"><div class="section-title-row"><div><h2>Browse by theme</h2></div></div>' + categoryButtons(state.category) + '</section><div class="results-meta"><span>' + escapeHtml(caption) + '</span><span>' + results.length + (results.length === 1 ? " hymn" : " hymns") + '</span></div>' + hymnList(results, emptyTitle, emptyMessage) + '</section>';
}

function renderFavorites() {
  const ids = new Set(getFavorites());
  const saved = state.hymns.filter(function (hymn) {
    return ids.has(String(hymn.hymn_number)) && (state.settings.language !== "yoruba" || hasYorubaText(hymn));
  });
  const emptyTitle = state.settings.language === "yoruba" ? "No Yorùbá favorites" : "No favorites yet";
  const emptyMessage = state.settings.language === "yoruba"
    ? "No saved hymn has a verified Yorùbá translation yet."
    : "Tap the heart beside a hymn to keep it here for quick access.";
  return '<section class="page">' + pageHeading("Favorites", "Your saved hymns stay on this device.") + renderLanguageArea() + hymnList(saved, emptyTitle, emptyMessage) + '</section>';
}

function poemSection(label, verses, chorus, languageCode) {
  const verseMarkup = verses.map(function (verse, index) {
    return '<div class="verse-block"><span class="verse-label">Verse ' + (index + 1) + '</span><p class="verse-text" lang="' + languageCode + '">' + escapeHtml(verse) + '</p></div>';
  }).join("");
  const chorusMarkup = chorus ? '<div class="chorus-block"><span class="verse-label">Refrain</span><p class="verse-text" lang="' + languageCode + '">' + escapeHtml(chorus) + '</p></div>' : "";
  return '<section class="language-reading" lang="' + languageCode + '"><h2>' + label + '</h2>' + verseMarkup + chorusMarkup + '</section>';
}

function homeHymn(hymn) {
  const number = String(hymn.hymn_number).padStart(2, "0");
  const yoruba = state.settings.language === "yoruba" && hasYorubaText(hymn);
  const title = yoruba ? hymn.title_yoruba : hymn.title_en;
  const firstLine = yoruba ? hymn.first_line_yoruba : hymn.first_line_en;
  const verses = yoruba ? hymn.verses_yoruba : hymn.verses_en;
  const chorus = yoruba ? hymn.chorus_yoruba : hymn.chorus_en;
  const languageName = yoruba ? "Yorùbá" : "English";
  const languageCode = yoruba ? "yo" : "en";
  return '<article class="home-hymn" data-testid="home-hymn-' + hymn.hymn_number + '"><header class="home-hymn-heading"><button class="home-hymn-open" type="button" data-action="open-hymn" data-number="' + hymn.hymn_number + '" aria-label="Open hymn ' + number + ': ' + escapeHtml(title) + '"><span class="hymn-number">' + number + '</span><span class="home-hymn-title">' + escapeHtml(title) + '</span></button>' + favoriteButton(hymn) + '</header><p class="home-hymn-first-line" lang="' + languageCode + '">' + escapeHtml(firstLine) + '</p>' + poemSection(languageName, verses, chorus, languageCode) + '</article>';
}

function renderReader() {
  const hymn = state.hymns.find(function (item) { return item.hymn_number === Number(state.selectedNumber); });
  if (!hymn) return '<section class="page">' + pageHeading("Hymn not found", "This number is not in the current collection.") + '<button class="button-secondary" type="button" data-action="back" data-testid="button-reader-back">' + icon("arrow") + ' Back to hymns</button></section>';
  const number = String(hymn.hymn_number).padStart(2, "0");
  let title = '<span lang="en">' + escapeHtml(hymn.title_en) + '</span>';
  let firstLine = '<span lang="en">' + escapeHtml(hymn.first_line_en) + '</span>';
  let sections = poemSection("English", hymn.verses_en, hymn.chorus_en, "en");
  let translationNote = "";
  const hasYoruba = hasYorubaText(hymn);
  if (state.settings.language === "yoruba") {
    if (hasYoruba) {
      title = '<span lang="yo">' + escapeHtml(hymn.title_yoruba) + '</span>';
      firstLine = '<span lang="yo">' + escapeHtml(hymn.first_line_yoruba) + '</span>';
      sections = poemSection("Yorùbá", hymn.verses_yoruba, hymn.chorus_yoruba, "yo");
    } else {
      title = '<span lang="en">' + escapeHtml(hymn.title_en) + '</span>';
      firstLine = "";
      sections = "";
      translationNote = '<p class="translation-note" role="note">A verified Yorùbá text is not available for this hymn yet. The English lyrics are hidden while Yorùbá is selected.</p>';
    }
  } else {
    title += pendingYorubaMarkup();
  }
  return '<section class="page reader-page"><div class="reader-topbar"><button class="reader-back" type="button" data-action="back" data-testid="button-reader-back">' + icon("arrow") + ' Back</button><div class="reader-actions">' + favoriteButton(hymn) + '<button class="icon-button" type="button" data-action="share" data-number="' + hymn.hymn_number + '" aria-label="Share hymn ' + number + '" data-testid="button-share-hymn">' + icon("share") + '</button></div></div><header class="reader-heading"><div class="reader-edition"><span class="hymn-number">' + number + '</span><span>Pentecostal Hymns No. 1</span></div><h1>' + title + '</h1><p class="reader-first-line">' + firstLine + '</p><span class="hymn-category">' + escapeHtml(hymn.category) + '</span></header><div class="reader-meta">' + languageToggle() + '<div class="reading-size" role="group" aria-label="Change hymn text size"><button type="button" data-action="font-decrease" aria-label="Decrease hymn text size" data-testid="button-font-decrease">A−</button><output id="reader-font-size">' + state.settings.fontSize + ' px</output><button type="button" data-action="font-increase" aria-label="Increase hymn text size" data-testid="button-font-increase">A+</button></div></div><div class="hymn-reading">' + translationNote + sections + '</div><footer class="reader-footer"><a class="source-link" href="' + escapeHtml(hymn.lyrics_source_url) + '" target="_blank" rel="noopener noreferrer">Lyrics source: Hymnary</a><button class="text-link" type="button" data-action="share" data-number="' + hymn.hymn_number + '">' + icon("share") + ' Share hymn</button></footer></section>';
}

function themeChoice(theme, label, iconName) {
  return '<button class="preference-choice" type="button" data-action="theme" data-theme="' + theme + '" aria-pressed="' + (state.settings.theme === theme) + '" data-testid="button-theme-' + theme + '">' + icon(iconName) + label + '</button>';
}

function renderSettings() {
  const size = state.settings.fontSize;
  const accentLabels = {
    ruby: "Red", blue: "Blue", purple: "Purple", berry: "Berry", teal: "Teal",
    emerald: "Emerald", green: "Green", lime: "Lime", amber: "Amber",
    orange: "Orange", coral: "Coral", rose: "Rose", indigo: "Indigo",
    sky: "Sky", slate: "Slate"
  };
  return '<section class="page">' + pageHeading("Settings", "Make the hymn book comfortable for you.") + '<section class="settings-group"><h2>Appearance</h2><p class="settings-description">Choose how the app looks on this device.</p><div class="preference-choices">' + themeChoice("light", "Light", "sun") + themeChoice("dark", "Dark", "moon") + themeChoice("system", "System", "settings") + '</div></section><section class="settings-group"><h2>Accent colour</h2><p class="settings-description">Choose from 15 colours. Your choice works with light and dark mode.</p><div class="accent-grid">' + ACCENT_THEMES.map(function (accent) {
    return '<button class="preference-choice accent-choice" type="button" data-action="accent" data-accent="' + accent + '" aria-pressed="' + (state.settings.accent === accent) + '" data-testid="button-accent-' + accent + '"><span class="color-dot" aria-hidden="true"></span><span>' + accentLabels[accent] + '</span></button>';
    }).join("") + '</div></section><section class="settings-group"><h2>Reading</h2><p class="settings-description">Set your preferred hymn language and text size. Yorùbá text is still being sourced.</p><div class="setting-row"><span><strong>Language</strong><small>Choose which hymn text to show.</small></span>' + languageToggle() + '</div><div class="setting-row"><span><strong>Text size</strong><small id="settings-font-value">' + size + ' px</small></span><input class="setting-range" id="settings-font-size" type="range" min="17" max="32" step="1" value="' + size + '" aria-label="Hymn text size" data-testid="input-font-size"></div><p class="verse-text setting-preview" style="--hymn-size:' + size + 'px">The hymn text will use this size.</p></section><section class="settings-group"><h2>About</h2><div class="setting-row"><span><strong>Consolation Evangelical and Revival Church</strong><small>Digital hymnal · Version ' + APP_VERSION + '</small></span></div><p class="about-copy">The current collection contains 197 English texts associated with <em>Pentecostal Hymns No. 1</em> (1894). Each included text is marked Public Domain on its Hymnary text authority page. Yorùbá versions are pending sourcing and review.</p><div class="setting-note" style="margin-top:14px"><strong>Rights scope</strong><br>The source’s Public Domain designation and the 1894 publication date do not establish status in every country. Verify local rights before use outside the United States.</div><div class="setting-note" style="margin-top:14px"><strong>Privacy</strong><br>There are no member accounts. Favorites and preferences are saved only in this browser on this device; they are not sent to a server.</div></section></section>';
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.remove("is-visible");
  requestAnimationFrame(function () { toast.classList.add("is-visible"); });
  state.toastTimer = window.setTimeout(function () { toast.hidden = true; }, 2800);
}

function render() {
  applyPreferences();
  renderHeader();
  if (state.view === "home") main.innerHTML = renderHome();
  else if (state.view === "hymns") main.innerHTML = renderHymnLibrary();
  else if (state.view === "favorites") main.innerHTML = renderFavorites();
  else if (state.view === "settings") main.innerHTML = renderSettings();
  else main.innerHTML = renderReader();
  renderNav();
  document.title = state.view === "reader" ? "Hymn " + String(state.selectedNumber).padStart(2, "0") + " · Consolation Hymnal" : "Consolation Hymnal";
}

function setSettings(changes) {
  const result = saveSettings(changes);
  state.settings = result.settings;
  render();
  if (!result.persisted) showToast("Preference changed for now, but browser storage is unavailable.");
}

function openHymn(number) {
  const hymn = state.hymns.find(function (item) { return item.hymn_number === Number(number); });
  if (!hymn) return;
  state.readerReturnView = state.view === "reader" ? state.readerReturnView : state.view;
  state.selectedNumber = hymn.hymn_number;
  state.view = "reader";
  const persisted = addRecent(hymn.hymn_number);
  render();
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
  if (!persisted) showToast("Opened hymn. Browser storage is unavailable, so recent history may not persist.");
}

function navigate(view) {
  if (!["home", "hymns", "favorites", "settings"].includes(view)) return;
  state.view = view;
  state.searchOpen = false;
  if (view !== "hymns") state.category = "";
  render();
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
}

function updateSearch(value, selectionStart, selectionEnd) {
  state.query = value;
  if (state.view === "home") {
    state.searchOpen = true;
  } else {
    state.view = "hymns";
    state.category = "";
  }
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
  const result = await shareHymn(hymn, state.settings.language);
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
  updateMessage.textContent = update.kind === "android"
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

document.addEventListener("click", function (event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "dismiss-update") updateDialog.close();
  else if (action === "install-update") installAvailableUpdate();
  else if (action === "navigate") navigate(target.dataset.view);
  else if (action === "open-search") {
    state.searchOpen = true;
    render();
    const input = document.getElementById("hymn-search");
    if (input) input.focus();
  } else if (action === "close-search" || action === "clear-home-search") {
    state.query = "";
    state.searchOpen = false;
    render();
  } else if (action === "open-hymn") openHymn(target.dataset.number);
  else if (action === "back") {
    state.view = state.readerReturnView;
    render();
    window.scrollTo(0, 0);
  } else if (action === "favorite") {
    const result = toggleFavorite(target.dataset.number);
    render();
    showToast(result.isFavorite ? "Added to Favorites." : "Removed from Favorites.");
    if (!result.persisted) showToast("Favorite changed for now, but browser storage is unavailable.");
  } else if (action === "language") setSettings({ language: target.dataset.language });
  else if (action === "category") {
    state.category = target.dataset.category || "";
    state.view = "hymns";
    state.query = "";
    render();
    window.scrollTo(0, 0);
  } else if (action === "clear-filters") {
    state.query = "";
    state.category = "";
    render();
  } else if (action === "font-increase") adjustFont(1);
  else if (action === "font-decrease") adjustFont(-1);
  else if (action === "theme") setSettings({ theme: target.dataset.theme });
  else if (action === "accent") setSettings({ accent: target.dataset.accent });
  else if (action === "share") performShare(target.dataset.number);
});

document.addEventListener("input", function (event) {
  if (event.target.id === "hymn-search") {
    const start = event.target.selectionStart == null ? event.target.value.length : event.target.selectionStart;
    const end = event.target.selectionEnd == null ? event.target.value.length : event.target.selectionEnd;
    updateSearch(event.target.value, start, end);
  } else if (event.target.id === "settings-font-size") {
    const size = Number(event.target.value);
    const result = saveSettings({ fontSize: size });
    state.settings = result.settings;
    applyPreferences();
    const label = document.getElementById("settings-font-value");
    const preview = main.querySelector(".setting-preview");
    if (label) label.textContent = size + " px";
    if (preview) preview.style.setProperty("--hymn-size", size + "px");
    if (!result.persisted) showToast("Text size changed for now, but browser storage is unavailable.");
  }
});

document.addEventListener("submit", function (event) {
  if (event.target.matches("[data-search-form]")) {
    event.preventDefault();
    if (state.view !== "home") {
      state.view = "hymns";
      state.category = "";
    }
    render();
    window.scrollTo(0, 0);
  }
});

if (window.matchMedia) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", function () { if (state.settings.theme === "system") applyPreferences(); });
}

async function boot() {
  try {
    state.hymns = await getAllHymns();
    render();
    shell.hidden = false;
    window.setTimeout(function () {
      splash.classList.add("is-leaving");
      window.setTimeout(function () { splash.hidden = true; }, 370);
    }, 950);
    initializeUpdates({ onAvailable: showUpdateNotice });
  } catch (error) {
    shell.hidden = false;
    header.innerHTML = "";
    main.innerHTML = '<section class="page empty-state" role="alert"><h1>Hymns could not be loaded</h1><p>Refresh this page to try again.</p></section>';
    nav.innerHTML = "";
    window.setTimeout(function () { splash.classList.add("is-leaving"); }, 950);
  }
}

boot();
