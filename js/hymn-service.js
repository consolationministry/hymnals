import { hymns } from "../data/cac-hymns.js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "../admin/config.js";
import { readLocal, writeLocal } from "./local-store.js";

const PUBLISHED_HYMNS_CACHE_KEY = "cerc-published-hymns-cac-v2";
const PUBLIC_HYMN_COLUMNS = [
  "id",
  "hymn_number",
  "title_en",
  "title_yoruba",
  "first_line_en",
  "first_line_yoruba",
  "category",
  "verses_en",
  "verses_yoruba",
  "chorus_en",
  "chorus_yoruba",
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

const BUNDLED_SOURCE_LABELS = new Map(hymns.map(function (hymn) {
  return [Number(hymn.hymn_number), hymn.source_number_label];
}));

function asString(value) {
  return typeof value === "string" ? value : "";
}

function asStringArray(value) {
  return Array.isArray(value) ? value.filter(function (item) {
    return typeof item === "string";
  }) : [];
}

function normalizePublishedRows(rows) {
  if (!Array.isArray(rows)) return null;
  return rows
    .filter(function (row) {
      return row && row.status === "published" && Number.isInteger(Number(row.hymn_number)) && Number(row.hymn_number) > 0;
    })
    .map(function (row) {
      return {
        id: asString(row.id),
        hymn_number: Number(row.hymn_number),
        title_en: asString(row.title_en),
        title_yoruba: asString(row.title_yoruba),
        first_line_en: asString(row.first_line_en),
        first_line_yoruba: asString(row.first_line_yoruba),
        category: asString(row.category),
        verses_en: asStringArray(row.verses_en),
        verses_yoruba: asStringArray(row.verses_yoruba),
        chorus_en: asString(row.chorus_en),
        chorus_yoruba: asString(row.chorus_yoruba),
        keywords: asStringArray(row.keywords),
        author_en: asString(row.author_en),
        source_hymnal: asString(row.source_hymnal),
        source_number_label: asString(row.source_number_label) || BUNDLED_SOURCE_LABELS.get(Number(row.hymn_number)) || String(row.source_hymn_number || row.hymn_number),
        source_publication_year: row.source_publication_year || null,
        source_hymn_number: row.source_hymn_number || null,
        source_first_line_en: asString(row.source_first_line_en),
        source_hymnary_url: asString(row.source_hymnary_url),
        lyrics_source_url: asString(row.lyrics_source_url),
        status: "published"
      };
    })
    .sort(function (a, b) { return a.hymn_number - b.hymn_number; });
}

async function fetchPublishedHymns() {
  if (typeof fetch !== "function" || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;
  const query = new URLSearchParams({
    select: PUBLIC_HYMN_COLUMNS,
    status: "eq.published",
    order: "hymn_number.asc"
  });

  try {
    const response = await fetch(
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
    );
    if (!response.ok) return null;
    const rows = normalizePublishedRows(await response.json());
    if (rows === null) return null;
    if (rows.length && rows.some(function (row) { return !/\bCAC\b/i.test(row.source_hymnal); })) return null;
    writeLocal(PUBLISHED_HYMNS_CACHE_KEY, rows);
    return rows;
  } catch (error) {
    return null;
  }
}

export async function getAllHymns() {
  const published = await fetchPublishedHymns();
  if (published !== null) return published;

  const cached = normalizePublishedRows(readLocal(PUBLISHED_HYMNS_CACHE_KEY, null));
  if (cached !== null) return cached;
  return hymns.slice().sort(function (a, b) { return a.hymn_number - b.hymn_number; });
}

export async function getHymnByNumber(number) {
  const allHymns = await getAllHymns();
  return allHymns.find(function (hymn) { return hymn.hymn_number === Number(number); }) || null;
}
