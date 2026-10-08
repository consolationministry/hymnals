// Phase 2B mock data adapter. This data is isolated to this admin preview and never changes the public hymn bundle.
// Replace the provider functions with Supabase-backed calls only after Auth and row-level authorization are configured.
const STORAGE_KEY = "consolation-hymnal-admin-demo-v1";
const CATEGORY_STORAGE_KEY = "consolation-hymnal-admin-categories-v1";
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
function phaseError(action) {
  return new Error(action + " is reserved for a later phase. The Phase 2C preview includes hymn and category management only.");
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
  return {
    totalHymns: hymns.length,
    publishedHymns: hymns.filter(function (item) { return item.status === "published"; }).length,
    draftHymns: hymns.filter(function (item) { return item.status === "draft"; }).length,
    englishHymns: hymns.filter(function (item) { return Boolean(item.title_en); }).length,
    yorubaHymns: hymns.filter(function (item) { return Boolean(item.title_yoruba); }).length,
    categories: allCategoryNames().length,
    upcomingServicePlans: demoServicePlans.length
  };
}
export async function getRecentlyUpdatedHymns(limit) {
  const count = Number.isFinite(limit) ? Math.max(0, limit) : 5;
  return readRecords().sort(function (a, b) {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  }).slice(0, count);
}
export async function getUpcomingServicePlans() { return copy(demoServicePlans); }
export async function getCategories() {
  return allCategoryNames();
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
  return writeCategoryRecords(categories);
}
export async function deleteCategory(value) {
  const name = validateCategoryName(value);
  if (!allCategoryNames().includes(name)) return false;
  if (readRecords().some(function (item) { return item.category === name; })) throw new Error("Reassign the hymns in this category before deleting it.");
  const categories = readCategoryRecords().filter(function (category) { return category !== name; });
  return writeCategoryRecords(categories);
}
export async function createService() { throw phaseError("createService"); }
export async function updateService() { throw phaseError("updateService"); }
export async function deleteService() { throw phaseError("deleteService"); }
