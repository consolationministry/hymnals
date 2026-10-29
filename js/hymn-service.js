import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "../admin/config.js";
import { readLocal, writeLocal } from "./local-store.js";
import { isManagedHymnSource, UPLOADED_HYMN_SOURCE, UPLOADED_YORUBA_HYMN_SOURCE } from "./hymnal-selection.js";

const PUBLISHED_HYMNS_CACHE_KEY = "cerc-published-hymns-unified-v11";
const PUBLIC_HYMN_COLUMNS = [
  "id",
  "hymn_number",
  "title_en",
  "title_yoruba",
  "first_line_en",
  "first_line_yoruba",
  "verses_en",
  "verses_yoruba",
  "chorus_en",
  "chorus_yoruba",
  "hymnal_note",
  "keywords",
  "author_en",
  "source_hymnal",
  "source_publication_year",
  "source_hymn_number",
  "source_first_line_en",
  "source_hymnary_url",
  "lyrics_source_url",
  "status"
].join(",");

// Preserve printed "Various" labels without bundling hymn text in the member app.
const VARIOUS_SOURCE_LABEL_HYMN_NUMBERS = new Set([
  3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 28,
  1003, 1005, 1007, 1009, 1010, 1012, 1014, 1016, 1018, 1020, 1022, 1024, 10038, 10040, 10058, 10084, 10107
]);

function asString(value) {
  return typeof value === "string" ? value : "";
}

function asStringArray(value) {
  return Array.isArray(value) ? value.filter(function (item) {
    return typeof item === "string";
  }) : [];
}

function firstLine(verses) {
  const first = Array.isArray(verses) ? verses.find(function (line) { return typeof line === "string"; }) : "";
  return String(first || "").split(/\r?\n/)[0];
}

function normalizePublishedRows(rows) {
  if (!Array.isArray(rows)) return null;
  const normalized = rows
    .filter(function (row) {
      if (!row || row.status !== "published" || !Number.isInteger(Number(row.hymn_number)) || Number(row.hymn_number) <= 0) return false;
      return isManagedHymnSource(asString(row.source_hymnal).trim());
    })
    .map(function (row) {
      const versesEn = asStringArray(row.verses_en);
      const versesYoruba = asStringArray(row.verses_yoruba);
      const chorusEn = asString(row.chorus_en);
      const chorusYoruba = asString(row.chorus_yoruba);
      const titleEn = asString(row.title_en);
      const sourceHymnal = asString(row.source_hymnal).trim();
      const isUploadedCollection = sourceHymnal === UPLOADED_HYMN_SOURCE;
      const isYorubaCollection = sourceHymnal === UPLOADED_YORUBA_HYMN_SOURCE;
      const lyricLine = firstLine(versesEn);
      return {
        id: asString(row.id),
        hymn_number: Number(row.hymn_number),
        title_en: titleEn,
        title_yoruba: asString(row.title_yoruba),
        first_line_en: asString(row.first_line_en) || lyricLine,
        first_line_yoruba: asString(row.first_line_yoruba),
        verses_en: versesEn,
        verses_yoruba: versesYoruba,
        chorus_en: chorusEn,
        chorus_yoruba: chorusYoruba,
        description_en: asString(row.description_en),
        description_yoruba: asString(row.description_yoruba),
        hymnal_note: asString(row.hymnal_note),
        keywords: asStringArray(row.keywords),
        author_en: asString(row.author_en),
        source_hymnal: sourceHymnal,
        source_number_label: asString(row.source_number_label) || (isYorubaCollection
          ? String(row.source_hymn_number || row.hymn_number).padStart(3, "0")
          : String(row.source_hymn_number || row.hymn_number) + (isUploadedCollection && VARIOUS_SOURCE_LABEL_HYMN_NUMBERS.has(Number(row.hymn_number)) ? "V" : "")),
        source_publication_year: row.source_publication_year || null,
        source_hymn_number: row.source_hymn_number ? Number(row.source_hymn_number) : null,
        source_first_line_en: asString(row.source_first_line_en) || lyricLine,
        source_hymnary_url: asString(row.source_hymnary_url),
        lyrics_source_url: asString(row.lyrics_source_url),
        language: asString(row.language) === "yoruba" || (!asString(row.language) && isYorubaCollection) ? "yoruba" : "english",
        status: "published"
      };
    })
    .sort(function (a, b) { return Number(a.source_hymn_number || a.hymn_number) - Number(b.source_hymn_number || b.hymn_number) || a.hymn_number - b.hymn_number; });

  return normalized;
}

async function fetchPublishedHymns() {
  if (typeof fetch !== "function" || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;
  const query = new URLSearchParams({
    select: PUBLIC_HYMN_COLUMNS,
    status: "eq.published",
    order: "hymn_number.asc"
  });

  try {
    const response = await (
      fetch(
        SUPABASE_URL.replace(/\/+$/, "") + "/rest/v1/hymns?" + query.toString(),
        {
          method: "GET",
          cache: "no-store",
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            authorization: "Bearer " + SUPABASE_PUBLISHABLE_KEY,
            accept: "application/json"
          }
        }
      )
    );
    if (!response.ok) return null;
    const rows = normalizePublishedRows(await response.json());
    if (rows === null) return null;
    // Never overwrite a non-empty cache with an empty result.
    const previous = normalizePublishedRows(readLocal(PUBLISHED_HYMNS_CACHE_KEY, null)) || [];
    if (rows.length > 0 || previous.length === 0) writeLocal(PUBLISHED_HYMNS_CACHE_KEY, rows);
    return rows;
  } catch (error) {
    return null;
  }
}
export async function getAllHymns() {
  const published = await fetchPublishedHymns();
  if (published !== null) return published;

  const cached = normalizePublishedRows(readLocal(PUBLISHED_HYMNS_CACHE_KEY, null));
  return cached === null ? [] : cached;
}

export async function getHymnByNumber(number) {
  const allHymns = await getAllHymns();
  return allHymns.find(function (hymn) { return hymn.hymn_number === Number(number); }) || null;
}
