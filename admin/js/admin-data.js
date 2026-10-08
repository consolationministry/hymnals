// Read-only, original demo records for the Phase 2A admin preview.
// Keep this contract aligned with the public hymnal's bilingual field names.
const demoHymns = [
  {
    id: "demo-001",
    hymn_number: 1,
    title_en: "Hymn Demo One",
    title_yoruba: "Yoruba Demo Hymn One",
    first_line_en: "Sample first line for preview only",
    first_line_yoruba: "Yoruba demo first line",
    verses_en: ["Sample verse content for the administration preview."],
    verses_yoruba: ["Yoruba demo verse content."],
    chorus_en: "Sample chorus content, kept separate from verses.",
    chorus_yoruba: "Yoruba demo chorus content, kept separate from verses.",
    category: "Praise",
    status: "published",
    created_at: "2026-09-28T10:00:00.000Z",
    updated_at: "2026-10-06T13:30:00.000Z",
    published_at: "2026-10-01T09:00:00.000Z"
  },
  {
    id: "demo-002",
    hymn_number: 2,
    title_en: "Hymn Demo Two",
    title_yoruba: "Yoruba Demo Hymn Two",
    first_line_en: "Another sample opening line",
    first_line_yoruba: "Another Yoruba demo line",
    verses_en: ["Original sample verse text."],
    verses_yoruba: [],
    chorus_en: "Original sample chorus text.",
    chorus_yoruba: "",
    category: "Thanksgiving",
    status: "draft",
    created_at: "2026-10-02T08:15:00.000Z",
    updated_at: "2026-10-05T15:45:00.000Z",
    published_at: null
  },
  {
    id: "demo-003",
    hymn_number: 3,
    title_en: "Hymn Demo Three",
    title_yoruba: "",
    first_line_en: "A third sample first line",
    first_line_yoruba: "",
    verses_en: ["Demo content only; no published hymn lyrics."],
    verses_yoruba: [],
    chorus_en: "",
    chorus_yoruba: "",
    category: "Worship",
    status: "published",
    created_at: "2026-09-20T12:00:00.000Z",
    updated_at: "2026-10-03T09:20:00.000Z",
    published_at: "2026-09-22T11:00:00.000Z"
  }
];

const demoCategories = ["Praise", "Worship", "Thanksgiving", "Prayer"];
const demoServicePlans = [
  { id: "service-demo-1", title: "Sunday Service · Demo", date: "2026-10-11", hymn_ids: ["demo-001", "demo-003"] },
  { id: "service-demo-2", title: "Midweek Gathering · Demo", date: "2026-10-14", hymn_ids: ["demo-002"] }
];

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

function phaseError(action) {
  return new Error(action + " is not available in Phase 2A. This preview data is read-only.");
}

export async function getHymns() {
  return copy(demoHymns).sort(function (a, b) { return a.hymn_number - b.hymn_number; });
}

export async function getHymn(id) {
  const hymn = demoHymns.find(function (item) { return item.id === id; });
  return hymn ? copy(hymn) : null;
}

export async function getDraftHymns() {
  return copy(demoHymns.filter(function (item) { return item.status === "draft"; }));
}

export async function getPublishedHymns() {
  return copy(demoHymns.filter(function (item) { return item.status === "published"; }));
}

export async function getDashboardStats() {
  return {
    totalHymns: demoHymns.length,
    publishedHymns: demoHymns.filter(function (item) { return item.status === "published"; }).length,
    draftHymns: demoHymns.filter(function (item) { return item.status === "draft"; }).length,
    englishHymns: demoHymns.filter(function (item) { return Boolean(item.title_en); }).length,
    yorubaHymns: demoHymns.filter(function (item) { return Boolean(item.title_yoruba); }).length,
    categories: demoCategories.length,
    upcomingServicePlans: demoServicePlans.length
  };
}

export async function getRecentlyUpdatedHymns(limit) {
  const count = Number.isFinite(limit) ? Math.max(0, limit) : 5;
  return copy(demoHymns.slice().sort(function (a, b) {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  }).slice(0, count));
}

export async function getUpcomingServicePlans() {
  return copy(demoServicePlans);
}

// Write methods intentionally fail closed until a real data provider and editor are implemented.
export async function createHymn() { throw phaseError("createHymn"); }
export async function updateHymn() { throw phaseError("updateHymn"); }
export async function deleteHymn() { throw phaseError("deleteHymn"); }
export async function publishHymn() { throw phaseError("publishHymn"); }
export async function saveHymnAsDraft() { throw phaseError("saveHymnAsDraft"); }
