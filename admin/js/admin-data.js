// Phase 2B mock data adapter. This data is isolated to this admin preview and never changes the public hymn bundle.
// Replace the provider functions with Supabase-backed calls only after Auth and row-level authorization are configured.
const STORAGE_KEY = "consolation-hymnal-admin-demo-v1";
const CATEGORY_STORAGE_KEY = "consolation-hymnal-admin-categories-v1";
const SERVICE_STORAGE_KEY = "consolation-hymnal-admin-services-v1";
const SETTINGS_STORAGE_KEY = "consolation-hymnal-admin-settings-v1";
const PROGRAM_STORAGE_KEY = "consolation-hymnal-admin-programs-v1";
const QUOTE_SETTINGS_STORAGE_KEY = "consolation-hymnal-admin-daily-quote-v1";
const initialAdminSettings = { defaultHymnCategory: "Praise", defaultTheme: "system" };
const initialDailyQuoteSettings = { enabled: true, books: ["Psalms", "Proverbs"], refreshMode: "on-open" };
const initialDemoCategories = ["Praise", "Worship", "Thanksgiving", "Prayer", "Faith", "Hope", "Communion", "Evangelism"];
const initialDemoHymns = [
  {
    id: "demo-001", hymn_number: 1, title_en: "Hymn Demo One", title_yoruba: "Yoruba Demo Hymn One",
    first_line_en: "Sample first line for preview only", first_line_yoruba: "Yoruba demo first line",
    verses_en: ["Sample verse content for the administration preview."], verses_yoruba: ["Yoruba demo verse content."],
    chorus_en: "Sample chorus content, kept separate from verses.", chorus_yoruba: "Yoruba demo chorus content, kept separate from verses.",
    body_html_en: "<p>Sample verse content for the administration preview.</p>", body_html_yoruba: "<p>Yoruba demo verse content.</p>",
    chorus_html_en: "<p>Sample chorus content, kept separate from verses.</p>", chorus_html_yoruba: "<p>Yoruba demo chorus content, kept separate from verses.</p>",
    category: "Praise", status: "published", created_at: "2026-09-28T10:00:00.000Z", updated_at: "2026-10-06T13:30:00.000Z", published_at: "2026-10-01T09:00:00.000Z"
  },
  {
    id: "demo-002", hymn_number: 2, title_en: "Hymn Demo Two", title_yoruba: "Yoruba Demo Hymn Two",
    first_line_en: "Another sample opening line", first_line_yoruba: "Another Yoruba demo line",
    verses_en: ["Original sample verse text."], verses_yoruba: [], chorus_en: "Original sample chorus text.", chorus_yoruba: "",
    body_html_en: "<p>Original sample verse text.</p>", body_html_yoruba: "", chorus_html_en: "<p>Original sample chorus text.</p>", chorus_html_yoruba: "",
    category: "Thanksgiving", status: "draft", created_at: "2026-10-02T08:15:00.000Z", updated_at: "2026-10-05T15:45:00.000Z", published_at: null
  },
  {
    id: "demo-003", hymn_number: 3, title_en: "Hymn Demo Three", title_yoruba: "",
    first_line_en: "A third sample first line", first_line_yoruba: "",
    verses_en: ["Demo content only; no published hymn lyrics."], verses_yoruba: [], chorus_en: "", chorus_yoruba: "",
    body_html_en: "<p>Demo content only; no published hymn lyrics.</p>", body_html_yoruba: "", chorus_html_en: "", chorus_html_yoruba: "",
    category: "Worship", status: "published", created_at: "2026-09-20T12:00:00.000Z", updated_at: "2026-10-03T09:20:00.000Z", published_at: "2026-09-22T11:00:00.000Z"
  }
];
const demoServicePlans = [
  { id: "service-demo-1", title: "Sunday Service · Demo", date: "2026-10-11", hymn_ids: ["demo-001", "demo-003"] },
  { id: "service-demo-2", title: "Midweek Gathering · Demo", date: "2026-10-14", hymn_ids: ["demo-002"] }
];
let memoryRecords = null;
let memoryCategories = null;
let memoryServices = null;
let memoryAdminSettings = null;
let memoryPrograms = null;
let memoryDailyQuoteSettings = null;
let lastStorageMode = null;

function copy(value) { return JSON.parse(JSON.stringify(value)); }
function readRecords() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) { memoryRecords = parsed; return copy(parsed); }
    }
  } catch (error) {
    // Fall through to this page's in-memory copy when browser storage is blocked.
  }
  return copy(memoryRecords || initialDemoHymns);
}
function writeRecords(records) {
  memoryRecords = copy(records);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    lastStorageMode = "browser";
    return "browser";
  } catch (error) {
    lastStorageMode = "memory";
    return "memory";
  }
}
function readCategoryRecords() {
  try {
    const stored = window.localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const seen = new Set(); const clean = [];
        parsed.forEach(function (item) {
          if (typeof item !== "string") return;
          const name = item.trim(); const key = name.toLowerCase();
          if (name && !seen.has(key)) { seen.add(key); clean.push(name); }
        });
        memoryCategories = clean; return copy(clean);
      }
    }
  } catch (error) {
    // Fall through to this page's in-memory category copy when browser storage is blocked.
  }
  return copy(memoryCategories || initialDemoCategories);
}
function writeCategoryRecords(categories) {
  memoryCategories = copy(categories);
  try {
    window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
    lastStorageMode = "browser"; return "browser";
  } catch (error) { lastStorageMode = "memory"; return "memory"; }
}
function readServiceRecords() {
  try {
    const stored = window.localStorage.getItem(SERVICE_STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) { memoryServices = parsed; return copy(parsed); }
    }
  } catch (error) {
    // Fall through to this page's in-memory service plan copy when browser storage is blocked.
  }
  return copy(memoryServices || demoServicePlans);
}
function writeServiceRecords(records) {
  memoryServices = copy(records);
  try {
    window.localStorage.setItem(SERVICE_STORAGE_KEY, JSON.stringify(records));
    lastStorageMode = "browser"; return "browser";
  } catch (error) { lastStorageMode = "memory"; return "memory"; }
}
function readProgramRecords() {
  try {
    const stored = window.localStorage.getItem(PROGRAM_STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) { memoryPrograms = parsed; return copy(parsed); }
    }
  } catch (error) {
    // Fall through to the in-memory copy when browser storage is blocked.
  }
  return copy(memoryPrograms || []);
}
function writeProgramRecords(records) {
  memoryPrograms = copy(records);
  try {
    window.localStorage.setItem(PROGRAM_STORAGE_KEY, JSON.stringify(records));
    lastStorageMode = "browser"; return "browser";
  } catch (error) { lastStorageMode = "memory"; return "memory"; }
}
function readDailyQuoteSettings() {
  try {
    const stored = window.localStorage.getItem(QUOTE_SETTINGS_STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const books = Array.isArray(parsed.books) ? parsed.books.filter(function (book, index, values) {
          return ["Psalms", "Proverbs"].includes(book) && values.indexOf(book) === index;
        }) : initialDailyQuoteSettings.books;
        memoryDailyQuoteSettings = {
          enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : initialDailyQuoteSettings.enabled,
          books: books,
          refreshMode: ["on-open", "daily"].includes(parsed.refreshMode) ? parsed.refreshMode : initialDailyQuoteSettings.refreshMode
        };
        return copy(memoryDailyQuoteSettings);
      }
    }
  } catch (error) {
    // Fall through to the in-memory copy when browser storage is blocked.
  }
  return copy(memoryDailyQuoteSettings || initialDailyQuoteSettings);
}
function writeDailyQuoteSettings(settings) {
  memoryDailyQuoteSettings = copy(settings);
  try {
    window.localStorage.setItem(QUOTE_SETTINGS_STORAGE_KEY, JSON.stringify(memoryDailyQuoteSettings));
    lastStorageMode = "browser"; return "browser";
  } catch (error) { lastStorageMode = "memory"; return "memory"; }
}
function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T00:00:00.000Z");
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
function normalizeProgramData(value) {
  const data = value || {};
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const venue = typeof data.venue === "string" ? data.venue.trim() : "";
  const startDate = typeof data.startDate === "string" ? data.startDate : "";
  const endDate = typeof data.endDate === "string" ? data.endDate : "";
  const flyerDataUrl = typeof data.flyerDataUrl === "string" ? data.flyerDataUrl : "";
  const responseQuestion = typeof data.responseQuestion === "string" ? data.responseQuestion.trim() : "";
  const yesLabel = typeof data.yesLabel === "string" ? data.yesLabel.trim() : "";
  const noLabel = typeof data.noLabel === "string" ? data.noLabel.trim() : "";
  if (!title) throw new Error("Enter the program name.");
  if (title.length > 120) throw new Error("Program names must be 120 characters or fewer.");
  if (!venue) throw new Error("Enter the program venue.");
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
  return { title: title, venue: venue, startDate: startDate, endDate: endDate, flyerDataUrl: flyerDataUrl, responseQuestion: responseQuestion, yesLabel: yesLabel, noLabel: noLabel };
}
function normalizeServiceData(value) {
  const data = value || {}; const title = typeof data.title === "string" ? data.title.trim() : "";
  const date = typeof data.date === "string" ? data.date : "";
  if (!title) throw new Error("Enter a service name.");
  if (title.length > 100) throw new Error("Service names must be 100 characters or fewer.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Choose a valid service date.");
  const parsedDate = new Date(date + "T00:00:00.000Z");
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) throw new Error("Choose a valid service date.");
  const hymnIds = Array.isArray(data.hymn_ids) ? Array.from(new Set(data.hymn_ids.map(function (id) { return String(id); }))) : [];
  if (!hymnIds.length) throw new Error("Select at least one hymn for this service.");
  const knownHymnIds = new Set(readRecords().map(function (hymn) { return hymn.id; }));
  if (hymnIds.some(function (id) { return !knownHymnIds.has(id); })) throw new Error("A selected demo hymn could not be found. Refresh the hymn list and try again.");
  return { title: title, date: date, hymn_ids: hymnIds };
}
function readAdminSettings() {
  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        memoryAdminSettings = { defaultHymnCategory: typeof parsed.defaultHymnCategory === "string" ? parsed.defaultHymnCategory : initialAdminSettings.defaultHymnCategory, defaultTheme: ["system", "light", "dark"].includes(parsed.defaultTheme) ? parsed.defaultTheme : initialAdminSettings.defaultTheme };
        return copy(memoryAdminSettings);
      }
    }
  } catch (error) {
    // Fall through to this page's in-memory workspace preferences when browser storage is blocked.
  }
  return copy(memoryAdminSettings || initialAdminSettings);
}
function writeAdminSettings(settings) {
  memoryAdminSettings = { defaultHymnCategory: settings.defaultHymnCategory || "", defaultTheme: settings.defaultTheme || "system" };
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(memoryAdminSettings));
    lastStorageMode = "browser"; return "browser";
  } catch (error) { lastStorageMode = "memory"; return "memory"; }
}
function allCategoryNames() {
  const names = readCategoryRecords().concat(readRecords().map(function (item) { return typeof item.category === "string" ? item.category.trim() : ""; }).filter(Boolean));
  return Array.from(new Set(names)).sort(function (a, b) { return a.localeCompare(b); });
}
function validateCategoryName(value) {
  if (typeof value !== "string") throw new Error("Enter a category name.");
  const name = value.trim();
  if (!name) throw new Error("Enter a category name.");
  if (name.length > 60) throw new Error("Category names must be 60 characters or fewer.");
  return name;
}
function nowIso() { return new Date().toISOString(); }
function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return "demo-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
}

export async function getHymns() {
  return readRecords().sort(function (a, b) { return Number(a.hymn_number) - Number(b.hymn_number); });
}
export async function getHymn(id) {
  const record = readRecords().find(function (item) { return item.id === id; });
  return record ? copy(record) : null;
}
export async function getDraftHymns() {
  return readRecords().filter(function (item) { return item.status === "draft"; });
}
export async function getPublishedHymns() {
  return readRecords().filter(function (item) { return item.status === "published"; });
}
export async function getDashboardStats() {
  const hymns = readRecords();
  const upcomingServices = await getUpcomingServicePlans();
  return {
    totalHymns: hymns.length,
    publishedHymns: hymns.filter(function (item) { return item.status === "published"; }).length,
    draftHymns: hymns.filter(function (item) { return item.status === "draft"; }).length,
    englishHymns: hymns.filter(function (item) { return Boolean(item.title_en); }).length,
    yorubaHymns: hymns.filter(function (item) { return Boolean(item.title_yoruba); }).length,
    categories: allCategoryNames().length,
    upcomingServicePlans: upcomingServices.length
  };
}
export async function getRecentlyUpdatedHymns(limit) {
  const count = Number.isFinite(limit) ? Math.max(0, limit) : 5;
  return readRecords().sort(function (a, b) {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  }).slice(0, count);
}
export async function getUpcomingServicePlans() {
  const now = new Date(); const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  return readServiceRecords().filter(function (plan) { return typeof plan.date === "string" && plan.date >= today; }).sort(function (a, b) { return a.date.localeCompare(b.date); });
}
export async function getServicePlans() {
  return readServiceRecords().sort(function (a, b) { return String(a.date || "").localeCompare(String(b.date || "")); });
}
export async function getServicePlan(id) {
  const plan = readServiceRecords().find(function (item) { return item.id === id; });
  return plan ? copy(plan) : null;
}
export async function getCategories() {
  return allCategoryNames();
}
export async function getAdminSettings() {
  const settings = readAdminSettings(); const categories = allCategoryNames();
  if (settings.defaultHymnCategory && !categories.includes(settings.defaultHymnCategory)) settings.defaultHymnCategory = categories[0] || "";
  return settings;
}
export async function updateAdminSettings(value) {
  const current = readAdminSettings();
  const category = value && typeof value.defaultHymnCategory === "string" ? value.defaultHymnCategory.trim() : current.defaultHymnCategory;
  const theme = value && typeof value.defaultTheme === "string" ? value.defaultTheme : current.defaultTheme;
  if (category && !allCategoryNames().includes(category)) throw new Error("Choose a category that still exists.");
  if (!["system", "light", "dark"].includes(theme)) throw new Error("Choose light, dark, or device theme.");
  return writeAdminSettings({ defaultHymnCategory: category, defaultTheme: theme });
}
export async function getDailyQuoteSettings() {
  return readDailyQuoteSettings();
}
export async function updateDailyQuoteSettings(value) {
  const data = value || {};
  const books = Array.isArray(data.books) ? Array.from(new Set(data.books.filter(function (book) {
    return book === "Psalms" || book === "Proverbs";
  }))) : [];
  const refreshMode = data.refreshMode;
  if (!books.length) throw new Error("Choose Psalms, Proverbs, or both as quote sources.");
  if (!["on-open", "daily"].includes(refreshMode)) throw new Error("Choose when a new quote should be generated.");
  if (typeof data.enabled !== "boolean") throw new Error("Choose whether the daily quote feature is enabled.");
  return writeDailyQuoteSettings({ enabled: data.enabled, books: books, refreshMode: refreshMode });
}
export function getStorageMode() {
  if (lastStorageMode) return lastStorageMode;
  try { window.localStorage.getItem(STORAGE_KEY); return "browser"; }
  catch (error) { return "memory"; }
}

function saveRecord(records, record) {
  const next = records.filter(function (item) { return item.id !== record.id; });
  next.push(record);
  const mode = writeRecords(next);
  return Object.assign(copy(record), { _storage_mode: mode });
}
export async function createHymn(data) {
  const records = readRecords();
  const number = Number(data.hymn_number);
  if (records.some(function (item) { return Number(item.hymn_number) === number; })) throw new Error("Hymn number " + number + " is already in use.");
  const timestamp = nowIso();
  const record = Object.assign({}, copy(data), {
    id: makeId(), hymn_number: number, status: data.status === "published" ? "published" : "draft",
    created_at: timestamp, updated_at: timestamp, published_at: data.status === "published" ? timestamp : null
  });
  return saveRecord(records, record);
}
export async function updateHymn(id, data) {
  const records = readRecords();
  const existing = records.find(function (item) { return item.id === id; });
  if (!existing) throw new Error("This demo hymn could not be found.");
  const number = Number(data.hymn_number);
  if (records.some(function (item) { return item.id !== id && Number(item.hymn_number) === number; })) throw new Error("Hymn number " + number + " is already in use.");
  const status = data.status === "published" ? "published" : "draft";
  const timestamp = nowIso();
  const record = Object.assign({}, existing, copy(data), {
    id: existing.id, hymn_number: number, status, updated_at: timestamp,
    published_at: status === "published" ? (existing.published_at || timestamp) : null
  });
  return saveRecord(records, record);
}
export async function deleteHymn(id) {
  const records = readRecords();
  if (!records.some(function (item) { return item.id === id; })) return false;
  writeRecords(records.filter(function (item) { return item.id !== id; }));
  return true;
}
export async function publishHymn(id) {
  const hymn = await getHymn(id);
  if (!hymn) throw new Error("This demo hymn could not be found.");
  hymn.status = "published";
  return updateHymn(id, hymn);
}
export async function saveHymnAsDraft(id) {
  const hymn = await getHymn(id);
  if (!hymn) throw new Error("This demo hymn could not be found.");
  hymn.status = "draft";
  hymn.published_at = null;
  return updateHymn(id, hymn);
}

export async function createCategory(value) {
  const name = validateCategoryName(value);
  if (allCategoryNames().some(function (category) { return category.toLowerCase() === name.toLowerCase(); })) throw new Error("A category with that name already exists.");
  const categories = readCategoryRecords(); categories.push(name);
  return writeCategoryRecords(categories);
}
export async function updateCategory(currentName, value) {
  const name = validateCategoryName(value); const available = allCategoryNames();
  if (!available.includes(currentName)) throw new Error("This demo category could not be found.");
  if (available.some(function (category) { return category !== currentName && category.toLowerCase() === name.toLowerCase(); })) throw new Error("A category with that name already exists.");
  const categories = readCategoryRecords(); const index = categories.indexOf(currentName);
  if (index >= 0) categories[index] = name; else categories.push(name);
  const records = readRecords(); let changed = false; const timestamp = nowIso();
  const updated = records.map(function (item) {
    if (item.category !== currentName) return item;
    changed = true; return Object.assign({}, item, { category: name, updated_at: timestamp });
  });
  if (changed) writeRecords(updated);
  const settings = readAdminSettings();
  if (settings.defaultHymnCategory === currentName) { settings.defaultHymnCategory = name; writeAdminSettings(settings); }
  return writeCategoryRecords(categories);
}
export async function deleteCategory(value) {
  const name = validateCategoryName(value);
  if (!allCategoryNames().includes(name)) return false;
  if (readRecords().some(function (item) { return item.category === name; })) throw new Error("Reassign the hymns in this category before deleting it.");
  const categories = readCategoryRecords().filter(function (category) { return category !== name; });
  const settings = readAdminSettings();
  if (settings.defaultHymnCategory === name) { settings.defaultHymnCategory = categories.slice().sort(function (a, b) { return a.localeCompare(b); })[0] || ""; writeAdminSettings(settings); }
  return writeCategoryRecords(categories);
}
export async function createService(value) {
  const data = normalizeServiceData(value); const timestamp = nowIso();
  const plan = Object.assign({}, data, { id: makeId(), created_at: timestamp, updated_at: timestamp });
  const plans = readServiceRecords(); plans.push(plan);
  return writeServiceRecords(plans);
}
export async function updateService(id, value) {
  const plans = readServiceRecords(); const existing = plans.find(function (item) { return item.id === id; });
  if (!existing) throw new Error("This demo service plan could not be found.");
  const data = normalizeServiceData(value); const updated = Object.assign({}, existing, data, { id: existing.id, updated_at: nowIso() });
  return writeServiceRecords(plans.map(function (item) { return item.id === id ? updated : item; }));
}
export async function deleteService(id) {
  const plans = readServiceRecords();
  if (!plans.some(function (item) { return item.id === id; })) return false;
  return writeServiceRecords(plans.filter(function (item) { return item.id !== id; }));
}
export async function getPrograms() {
  return readProgramRecords().sort(function (a, b) {
    return String(a.startDate || "").localeCompare(String(b.startDate || "")) || String(b.updated_at || "").localeCompare(String(a.updated_at || ""));
  });
}
export async function getProgram(id) {
  const program = readProgramRecords().find(function (item) { return item.id === id; });
  return program ? copy(program) : null;
}
export async function createProgram(value) {
  const data = normalizeProgramData(value); const timestamp = nowIso();
  const record = Object.assign({}, data, { id: makeId(), created_at: timestamp, updated_at: timestamp });
  const programs = readProgramRecords(); programs.push(record);
  return Object.assign(copy(record), { _storage_mode: writeProgramRecords(programs) });
}
export async function updateProgram(id, value) {
  const programs = readProgramRecords(); const existing = programs.find(function (item) { return item.id === id; });
  if (!existing) throw new Error("This demo program could not be found.");
  const data = normalizeProgramData(value); const updated = Object.assign({}, existing, data, { id: existing.id, updated_at: nowIso() });
  const mode = writeProgramRecords(programs.map(function (item) { return item.id === id ? updated : item; }));
  return Object.assign(copy(updated), { _storage_mode: mode });
}
export async function deleteProgram(id) {
  const programs = readProgramRecords();
  if (!programs.some(function (item) { return item.id === id; })) return false;
  return writeProgramRecords(programs.filter(function (item) { return item.id !== id; }));
}
