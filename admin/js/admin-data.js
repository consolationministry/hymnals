import repositoryHymns from "../../data/uploaded-hymns.js";
import repositoryYorubaHymns from "../../data/uploaded-yoruba-hymns.js";
import { findMissingHymnsByNumber } from "./hymn-catalog-sync.js";
import { isManagedHymnSource } from "../../js/hymnal-selection.js";
import { requireAdmin } from "./admin-auth.js?v=31";
import { supabaseRequest } from "./supabase-client.js?v=31";

const GLOBAL_ROW_ID = "global";
const DAILY_QUOTE_BOOKS = ["Psalms", "Proverbs"];
const HYMNS_PAGE_SIZE = 100;
const HYMN_DB_CATEGORY = "Praise"; // NOT NULL + FK column in Supabase; never shown in the UI
const ADMIN_HYMN_LIST_COLUMNS = "id,hymn_number,title_en,title_yoruba,first_line_en,first_line_yoruba,verses_en,verses_yoruba,chorus_en,chorus_yoruba,source_hymnal,source_hymn_number,source_first_line_en,category,status,updated_at";
const HYMN_CATALOG_SYNC_VERSION = "uploaded-and-yoruba-hymn-collections-v8";
const HYMN_CATALOG_SYNC_KEY = "consolation-admin-hymn-catalog-sync";

async function adminRequest(path, options) {
  await requireAdmin();
  return supabaseRequest(path, options);
}

function asArray(value) { return Array.isArray(value) ? value : []; }
function firstRow(value) { return asArray(value)[0] || null; }
function copy(value) { return JSON.parse(JSON.stringify(value)); }
function nowIso() { return new Date().toISOString(); }

async function getAllAdminRows(path) {
  const rows = [];
  let offset = 0;
  while (true) {
    const page = await adminRequest(path + "&limit=" + HYMNS_PAGE_SIZE + "&offset=" + offset);
    if (!Array.isArray(page)) throw new Error("The admin hymn catalog returned an invalid response.");
    rows.push.apply(rows, page);
    if (page.length < HYMNS_PAGE_SIZE) break;
    offset += page.length;
  }
  return rows;
}

function isMeterTitle(title) {
  return /^(?:\d+\.)+\d*(?:\s*[d&.]+\s*(?:ref\.?|chorus)?)?$/i.test(String(title || "").trim());
}

function firstHymnLine(verses) {
  const first = asArray(verses).find(function (verse) { return typeof verse === "string" && verse.trim(); });
  return String(first || "").split(/\r?\n/)[0].trim();
}

function normalizeAdminHymn(row) {
  const hymn = Object.assign({}, row);
  if (!isMeterTitle(hymn.title_en)) return hymn;
  const verses = asArray(hymn.verses_en);
  const firstVerseLine = firstHymnLine(verses);
  const lyricLine = firstHymnLine(isMeterTitle(firstVerseLine) ? verses.slice(1) : verses);
  if (!lyricLine) return hymn;
  hymn.title_en = lyricLine;
  hymn.first_line_en = lyricLine;
  hymn.source_first_line_en = lyricLine;
  return hymn;
}

function normalizeAdminHymns(rows) {
  return asArray(rows).map(normalizeAdminHymn);
}

function getVisibleAdminHymns(rows) {
  const uploadedRows = asArray(rows).filter(function (hymn) {
    return isManagedHymnSource(String(hymn && hymn.source_hymnal || "").trim());
  });
  return normalizeAdminHymns(uploadedRows);
}

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character];
  });
}

function paragraphHtml(lines) {
  return asArray(lines).map(function (line) { return "<p>" + escapeHtml(line) + "</p>"; }).join("");
}

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T00:00:00.000Z");
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function normalizeProgramData(value) {
  const data = value || {};
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const category = typeof data.category === "string" ? data.category.trim() : "";
  const minister = typeof data.minister === "string" ? data.minister.trim() : "";
  const description = typeof data.description === "string" ? data.description.trim() : "";
  const venue = typeof data.venue === "string" ? data.venue.trim() : "";
  const startDate = typeof data.startDate === "string" ? data.startDate : "";
  const endDate = typeof data.endDate === "string" ? data.endDate : "";
  const flyerDataUrl = typeof data.flyerDataUrl === "string" ? data.flyerDataUrl : "";
  const responseQuestion = typeof data.responseQuestion === "string" ? data.responseQuestion.trim() : "";
  const yesLabel = typeof data.yesLabel === "string" ? data.yesLabel.trim() : "";
  const noLabel = typeof data.noLabel === "string" ? data.noLabel.trim() : "";
  if (!title) throw new Error("Enter the event name.");
  if (title.length > 120) throw new Error("Event names must be 120 characters or fewer.");
  if (category.length > 60) throw new Error("Programme categories must be 60 characters or fewer.");
  if (minister.length > 120) throw new Error("Minister names must be 120 characters or fewer.");
  if (description.length > 2000) throw new Error("Programme descriptions must be 2,000 characters or fewer.");
  if (!venue) throw new Error("Enter the event venue.");
  if (venue.length > 160) throw new Error("Venues must be 160 characters or fewer.");
  if (!validDate(startDate)) throw new Error("Choose a valid start date.");
  if (endDate && !validDate(endDate)) throw new Error("Choose a valid end date or leave it blank.");
  if (endDate && endDate < startDate) throw new Error("The end date cannot be before the start date.");
  if (flyerDataUrl && (!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(flyerDataUrl) || flyerDataUrl.length > 1900000)) {
    throw new Error("Use a PNG, JPEG, or WebP flyer smaller than 1.4 MB after resizing.");
  }
  if (!responseQuestion) throw new Error("Enter the availability question.");
  if (responseQuestion.length > 120) throw new Error("The availability question must be 120 characters or fewer.");
  if (!yesLabel || !noLabel) throw new Error("Enter both response button labels.");
  if (yesLabel.length > 48 || noLabel.length > 48) throw new Error("Response button labels must be 48 characters or fewer.");
  return { title, category, minister, description, venue, startDate, endDate, flyerDataUrl, responseQuestion, yesLabel, noLabel };
}

function toProgramRow(value) {
  return {
    title: value.title,
    category: value.category,
    minister: value.minister,
    description: value.description,
    venue: value.venue,
    start_date: value.startDate,
    end_date: value.endDate || null,
    flyer_data_url: value.flyerDataUrl || "",
    response_question: value.responseQuestion,
    yes_label: value.yesLabel,
    no_label: value.noLabel
  };
}

function fromProgramRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    category: row.category || "",
    minister: row.minister || "",
    description: row.description || "",
    venue: row.venue,
    startDate: row.start_date,
    endDate: row.end_date || "",
    flyerDataUrl: row.flyer_data_url || "",
    responseQuestion: row.response_question,
    yesLabel: row.yes_label,
    noLabel: row.no_label,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function normalizeServiceData(value, knownHymnIds) {
  const data = value || {};
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const date = typeof data.date === "string" ? data.date : "";
  if (!title) throw new Error("Enter a service name.");
  if (title.length > 100) throw new Error("Service names must be 100 characters or fewer.");
  if (!validDate(date)) throw new Error("Choose a valid service date.");
  const hymnIds = Array.isArray(data.hymn_ids) ? Array.from(new Set(data.hymn_ids.map(String))) : [];
  if (!hymnIds.length) throw new Error("Select at least one hymn for this service.");
  if (hymnIds.some(function (id) { return !knownHymnIds.has(id); })) {
    throw new Error("A selected hymn could not be found. Refresh the hymn list and try again.");
  }
  return { title, date, hymn_ids: hymnIds };
}

function normalizeHymnData(value, existing) {
  value = Object.assign({}, value || {});
  ["verses_en", "verses_yoruba"].forEach(function (key) {
    if (typeof value[key] === "string") value[key] = value[key].split(/\n[ \t]*\n+/).filter(function (verse) { return verse !== ""; });
  });
  const data = value || {};
  const hymnNumber = Number(data.hymn_number);
  const safeHymnNumber = Number.isInteger(hymnNumber) && hymnNumber > 0
    ? hymnNumber
    : (existing && Number.isInteger(Number(existing.hymn_number)) && Number(existing.hymn_number) > 0
      ? Number(existing.hymn_number)
      : (Number.isInteger(Number(existing && existing.source_hymn_number)) && Number(existing.source_hymn_number) > 0
        ? Number(existing.source_hymn_number)
        : 1));
  const status = data.status === "published" ? "published" : "draft";
  const record = Object.assign({}, existing || {}, copy(data), {
    hymn_number: safeHymnNumber,
    category: existing ? existing.category : HYMN_DB_CATEGORY,
    status,
    updated_at: nowIso(),
    published_at: status === "published" ? ((existing && existing.published_at) || nowIso()) : null
  });
  delete record.id;
  delete record.created_at;
  delete record._storage_mode;
  return record;
}

export async function initializeAdminData() {
  const importRows = repositoryHymns.concat(repositoryYorubaHymns).map(function (hymn) {
    const versesEn = asArray(hymn.verses_en);
    const versesYoruba = asArray(hymn.verses_yoruba);
    const row = {
      hymn_number: Number(hymn.hymn_number),
      title_en: hymn.title_en || "",
      title_yoruba: hymn.title_yoruba || "",
      first_line_en: hymn.first_line_en || "",
      first_line_yoruba: hymn.first_line_yoruba || "",
      verses_en: versesEn,
      verses_yoruba: versesYoruba,
      chorus_en: hymn.chorus_en || "",
      chorus_yoruba: hymn.chorus_yoruba || "",
      source_hymnal: hymn.source_hymnal || "Uploaded Hymn Collection",
      source_hymn_number: hymn.source_hymn_number || null,
      hymnal_note: hymn.hymnal_note || "",
      keywords: asArray(hymn.keywords),
      author_en: hymn.author_en || "",
      source_hymnal: hymn.source_hymnal || "",
      source_publication_year: hymn.source_publication_year || null,
      source_hymn_number: hymn.source_hymn_number || null,
      source_first_line_en: hymn.source_first_line_en || "",
      source_hymnary_url: hymn.source_hymnary_url || "",
      lyrics_source_url: hymn.lyrics_source_url || "",
      copyright_status: hymn.copyright_status || "",
      copyright_basis: hymn.copyright_basis || "",
      yoruba_status: hymn.yoruba_status || "",
      body_html_en: paragraphHtml(versesEn),
      body_html_yoruba: paragraphHtml(versesYoruba),
      chorus_html_en: paragraphHtml(hymn.chorus_en ? [hymn.chorus_en] : []),
      chorus_html_yoruba: paragraphHtml(hymn.chorus_yoruba ? [hymn.chorus_yoruba] : []),
      category: HYMN_DB_CATEGORY,
      status: "draft",
      published_at: null
    };
    return row;
  });
  let alreadySynced = false;
  try {
    alreadySynced = window.localStorage.getItem(HYMN_CATALOG_SYNC_KEY) === HYMN_CATALOG_SYNC_VERSION;
  } catch (error) {}

  let rowsToImport = importRows;
  if (alreadySynced) {
    const storedHymnRows = await getAllAdminRows("rest/v1/hymns?select=hymn_number,source_hymnal&order=hymn_number.asc");
    const storedManagedRows = storedHymnRows.filter(function (hymn) { return isManagedHymnSource(hymn.source_hymnal); });
    rowsToImport = findMissingHymnsByNumber(importRows, storedManagedRows);
    if (!rowsToImport.length) return { imported: 0 };
  }


  const batchSize = 200;
  const batches = [];
  for (let index = 0; index < rowsToImport.length; index += batchSize) {
    batches.push(rowsToImport.slice(index, index + batchSize));
  }
  const results = await Promise.all(batches.map(function (batch) {
    return adminRequest("rest/v1/hymns?on_conflict=hymn_number&select=hymn_number", {
      method: "POST",
      prefer: "resolution=ignore-duplicates,return=representation",
      body: batch
    });
  }));
  const imported = results.reduce(function (total, rows) {
    return total + (Array.isArray(rows) ? rows.length : 0);
  }, 0);
  try { window.localStorage.setItem(HYMN_CATALOG_SYNC_KEY, HYMN_CATALOG_SYNC_VERSION); } catch (error) {}
  return { imported };
}

export async function getHymns() {
  return getVisibleAdminHymns(await getAllAdminRows("rest/v1/hymns?select=*&order=hymn_number.asc"));
}

function adminHymnListPath(status) {
  return "rest/v1/hymns?select=" + ADMIN_HYMN_LIST_COLUMNS + (status ? "&status=eq." + encodeURIComponent(status) : "") + "&order=hymn_number.asc";
}

export async function getHymnListRows() {
  return getVisibleAdminHymns(await getAllAdminRows(adminHymnListPath()));
}

export async function getHymn(id) {
  const rows = await adminRequest("rest/v1/hymns?select=*&id=eq." + encodeURIComponent(id) + "&limit=1");
  const hymn = firstRow(rows);
  return hymn ? (getVisibleAdminHymns([hymn])[0] || null) : null;
}

export async function getDraftHymns() {
  return getVisibleAdminHymns(await getAllAdminRows(adminHymnListPath("draft")));
}

export async function getPublishedHymns() {
  return getVisibleAdminHymns(await getAllAdminRows("rest/v1/hymns?select=*&status=eq.published&order=hymn_number.asc"));
}

export async function moveAllPublishedHymnsToDrafts() {
  const published = getVisibleAdminHymns(await getAllAdminRows("rest/v1/hymns?select=id,hymn_number,source_hymnal&status=eq.published&order=hymn_number.asc"));
  const batchSize = 100;
  for (let index = 0; index < published.length; index += batchSize) {
    const ids = published.slice(index, index + batchSize).map(function (hymn) {
      return encodeURIComponent(hymn.id);
    });
    await adminRequest("rest/v1/hymns?id=in.(" + ids.join(",") + ")", {
      method: "PATCH",
      prefer: "return=minimal",
      body: { status: "draft", published_at: null }
    });
  }
  return published.length;
}

export async function getDashboardStats() {
  const results = await Promise.all([getHymnListRows(), getUpcomingServicePlans(), getCategories()]);
  const hymns = results[0];
  return {
    totalHymns: hymns.length,
    publishedHymns: hymns.filter(function (item) { return item.status === "published"; }).length,
    draftHymns: hymns.filter(function (item) { return item.status === "draft"; }).length,
    englishHymns: hymns.filter(function (item) { return Boolean(item.title_en); }).length,
    yorubaHymns: hymns.filter(function (item) { return Boolean(item.title_yoruba); }).length,
    categories: results[2].length,
    upcomingServicePlans: results[1].length
  };
}

export async function getRecentlyUpdatedHymns(limit) {
  const count = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 5;
  if (!count) return [];
  return getVisibleAdminHymns(await getAllAdminRows("rest/v1/hymns?select=*&order=updated_at.desc")).slice(0, count);
}

function getToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export async function getUpcomingServicePlans() {
  return adminRequest("rest/v1/service_plans?select=*&date=gte." + getToday() + "&order=date.asc");
}

export async function getServicePlans() {
  return adminRequest("rest/v1/service_plans?select=*&order=date.asc");
}

export async function getServicePlan(id) {
  const rows = await adminRequest("rest/v1/service_plans?select=*&id=eq." + encodeURIComponent(id) + "&limit=1");
  return firstRow(rows);
}

export async function getCategories() {
  const rows = await adminRequest("rest/v1/categories?select=name&order=name.asc");
  return rows.map(function (row) { return row.name; });
}

export async function getAdminSettings() {
  const rows = await adminRequest("rest/v1/admin_settings?select=*&id=eq." + GLOBAL_ROW_ID + "&limit=1");
  const row = firstRow(rows);
  return {
    defaultHymnCategory: row && row.default_hymn_category || "",
    defaultTheme: row && row.default_theme || "system",
  };
}

export async function updateAdminSettings(value) {
  const data = value || {};
  const current = await getAdminSettings();
  const theme = typeof data.defaultTheme === "string" ? data.defaultTheme : current.defaultTheme;
  if (!["system", "light", "dark"].includes(theme)) throw new Error("Choose light, dark, or device theme.");
  const settingsUpdate = { default_theme: theme };
  await adminRequest("rest/v1/admin_settings?id=eq." + GLOBAL_ROW_ID, {
    method: "PATCH",
    prefer: "return=representation",
    body: settingsUpdate
  });
  return "remote";
}

export async function getDailyQuoteSettings() {
  const rows = await adminRequest("rest/v1/daily_quote_settings?select=*&id=eq." + GLOBAL_ROW_ID + "&limit=1");
  const row = firstRow(rows);
  const books = row && Array.isArray(row.books) ? row.books.filter(function (book) { return DAILY_QUOTE_BOOKS.includes(book); }) : DAILY_QUOTE_BOOKS;
  return {
    enabled: row ? Boolean(row.enabled) : true,
    books: books.length ? books : DAILY_QUOTE_BOOKS.slice(),
    refreshMode: row && ["on-open", "daily"].includes(row.refresh_mode) ? row.refresh_mode : "on-open"
  };
}

export async function updateDailyQuoteSettings(value) {
  const data = value || {};
  const books = Array.isArray(data.books) ? Array.from(new Set(data.books.filter(function (book) {
    return DAILY_QUOTE_BOOKS.includes(book);
  }))) : [];
  if (!books.length) throw new Error("Choose Psalms, Proverbs, or both as quote sources.");
  if (!["on-open", "daily"].includes(data.refreshMode)) throw new Error("Choose when a new quote should be generated.");
  if (typeof data.enabled !== "boolean") throw new Error("Choose whether the daily quote feature is enabled.");
  await adminRequest("rest/v1/daily_quote_settings?id=eq." + GLOBAL_ROW_ID, {
    method: "PATCH",
    prefer: "return=representation",
    body: { enabled: data.enabled, books, refresh_mode: data.refreshMode }
  });
  return "remote";
}

export function getStorageMode() { return "remote"; }

export async function createHymn(data) {
  const value = Object.assign({}, data || {});
  if (!Number.isInteger(Number(value.hymn_number)) || Number(value.hymn_number) < 1) {
    const hymns = await getHymns();
    const numbers = new Set(hymns.map(function (hymn) { return Number(hymn.hymn_number); }).filter(function (number) { return Number.isInteger(number) && number > 0; }));
    let nextNumber = 1;
    while (numbers.has(nextNumber)) nextNumber += 1;
    value.hymn_number = nextNumber;
  }
  value.verses_en = Array.isArray(value.verses_en) ? value.verses_en : String(value.verses_en || "").split(/\n[ \t]*\n+/).filter(function (verse) { return verse !== ""; });
  value.verses_yoruba = Array.isArray(value.verses_yoruba) ? value.verses_yoruba : String(value.verses_yoruba || "").split(/\n[ \t]*\n+/).filter(function (verse) { return verse !== ""; });
  const record = normalizeHymnData(value);
  const rows = await adminRequest("rest/v1/hymns?select=*", {
    method: "POST",
    prefer: "return=representation",
    body: record
  });
  return Object.assign(firstRow(rows) || {}, { _storage_mode: "remote" });
}

export async function updateHymn(id, data) {
  const existing = await getHymn(id);
  if (!existing) throw new Error("This hymn could not be found.");
  const value = Object.assign({}, data || {});
  value.verses_en = Array.isArray(value.verses_en) ? value.verses_en : String(value.verses_en || "").split(/\n[ \t]*\n+/).filter(function (verse) { return verse !== ""; });
  value.verses_yoruba = Array.isArray(value.verses_yoruba) ? value.verses_yoruba : String(value.verses_yoruba || "").split(/\n[ \t]*\n+/).filter(function (verse) { return verse !== ""; });
  const record = normalizeHymnData(value, existing);
  const rows = await adminRequest("rest/v1/hymns?id=eq." + encodeURIComponent(id) + "&select=*", {
    method: "PATCH",
    prefer: "return=representation",
    body: record
  });
  const updated = firstRow(rows);
  if (!updated) throw new Error("This hymn could not be updated.");
  return Object.assign(updated, { _storage_mode: "remote" });
}

export async function setHymnsStatus(ids, status) {
  if (!["draft", "published"].includes(status)) throw new Error("Choose a valid hymn status.");
  const uniqueIds = Array.from(new Set(asArray(ids).map(function (id) { return String(id || ""); }).filter(Boolean)));
  const batchSize = 100;
  const updatedAt = nowIso();
  let updated = 0;
  for (let index = 0; index < uniqueIds.length; index += batchSize) {
    const batch = uniqueIds.slice(index, index + batchSize);
    const rows = await adminRequest("rest/v1/hymns?id=in.(" + batch.map(encodeURIComponent).join(",") + ")&select=id", {
      method: "PATCH",
      prefer: "return=representation",
      body: { status, published_at: status === "draft" ? null : updatedAt, updated_at: updatedAt }
    });
    updated += asArray(rows).length;
  }
  return updated;
}

export async function deleteHymns(ids) {
  const uniqueIds = Array.from(new Set(asArray(ids).map(function (id) { return String(id || ""); }).filter(Boolean)));
  const batchSize = 100;
  let deleted = 0;
  for (let index = 0; index < uniqueIds.length; index += batchSize) {
    const batch = uniqueIds.slice(index, index + batchSize);
    const rows = await adminRequest("rest/v1/hymns?id=in.(" + batch.map(encodeURIComponent).join(",") + ")&select=id", {
      method: "DELETE",
      prefer: "return=representation"
    });
    deleted += asArray(rows).length;
  }
  return deleted;
}
export async function deleteHymn(id) {
  await adminRequest("rest/v1/hymns?id=eq." + encodeURIComponent(id), { method: "DELETE" });
  return true;
}

export async function publishHymn(id) {
  const hymn = await getHymn(id);
  if (!hymn) throw new Error("This hymn could not be found.");
  return updateHymn(id, Object.assign({}, hymn, { status: "published" }));
}

export async function saveHymnAsDraft(id) {
  const hymn = await getHymn(id);
  if (!hymn) throw new Error("This hymn could not be found.");
  return updateHymn(id, Object.assign({}, hymn, { status: "draft", published_at: null }));
}

export async function createCategory(value) {
  const name = typeof value === "string" ? value.trim() : "";
  if (!name || name.length > 60) throw new Error("Category names must be between 1 and 60 characters.");
  await adminRequest("rest/v1/categories", {
    method: "POST",
    prefer: "return=representation",
    body: { name }
  });
  return "remote";
}

export async function updateCategory(currentName, value) {
  const name = typeof value === "string" ? value.trim() : "";
  if (!name || name.length > 60) throw new Error("Category names must be between 1 and 60 characters.");
  const rows = await adminRequest("rest/v1/categories?name=eq." + encodeURIComponent(currentName) + "&select=name", {
    method: "PATCH",
    prefer: "return=representation",
    body: { name }
  });
  if (!rows.length) throw new Error("This category could not be found.");
  return "remote";
}

export async function deleteCategory(value) {
  const name = typeof value === "string" ? value.trim() : "";
  try {
    await adminRequest("rest/v1/categories?name=eq." + encodeURIComponent(name), { method: "DELETE" });
    return true;
  } catch (error) {
    if (error && (error.code === "23503" || error.code === "23514")) {
      throw new Error("Reassign the hymns in this category before deleting it.");
    }
    throw error;
  }
}

export async function createService(value) {
  const hymns = await getHymns();
  const data = normalizeServiceData(value, new Set(hymns.map(function (hymn) { return hymn.id; })));
  const rows = await adminRequest("rest/v1/service_plans?select=*", {
    method: "POST",
    prefer: "return=representation",
    body: data
  });
  return firstRow(rows);
}

export async function updateService(id, value) {
  const hymns = await getHymns();
  const data = normalizeServiceData(value, new Set(hymns.map(function (hymn) { return hymn.id; })));
  const rows = await adminRequest("rest/v1/service_plans?id=eq." + encodeURIComponent(id) + "&select=*", {
    method: "PATCH",
    prefer: "return=representation",
    body: data
  });
  const updated = firstRow(rows);
  if (!updated) throw new Error("This service plan could not be found.");
  return updated;
}

export async function deleteService(id) {
  await adminRequest("rest/v1/service_plans?id=eq." + encodeURIComponent(id), { method: "DELETE" });
  return true;
}

export async function getPrograms() {
  const rows = await adminRequest("rest/v1/programs?select=*&order=start_date.asc,updated_at.desc");
  return rows.map(fromProgramRow);
}

export async function getProgram(id) {
  const rows = await adminRequest("rest/v1/programs?select=*&id=eq." + encodeURIComponent(id) + "&limit=1");
  return fromProgramRow(firstRow(rows));
}

export async function createProgram(value) {
  const data = normalizeProgramData(value);
  const rows = await adminRequest("rest/v1/programs?select=*", {
    method: "POST",
    prefer: "return=representation",
    body: toProgramRow(data)
  });
  const record = fromProgramRow(firstRow(rows));
  if (!record) throw new Error("The event could not be saved.");
  return Object.assign(record, { _storage_mode: "remote" });
}

export async function updateProgram(id, value) {
  const data = normalizeProgramData(value);
  const rows = await adminRequest("rest/v1/programs?id=eq." + encodeURIComponent(id) + "&select=*", {
    method: "PATCH",
    prefer: "return=representation",
    body: toProgramRow(data)
  });
  const record = fromProgramRow(firstRow(rows));
  if (!record) throw new Error("This event could not be found.");
  return Object.assign(record, { _storage_mode: "remote" });
}

export async function deleteProgram(id) {
  await adminRequest("rest/v1/programs?id=eq." + encodeURIComponent(id), { method: "DELETE" });
  return true;
}
