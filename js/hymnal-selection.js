export const DEFAULT_ACTIVE_HYMNAL = "uploaded";

export const ACTIVE_HYMNALS = Object.freeze([
  Object.freeze({
    id: "uploaded",
    label: "Original Consolation Hymn",
    description: "The uploaded English hymn collection."
  })
]);

const UPLOADED_HYMN_SOURCE = "Uploaded Hymn Collection";

export function isActiveHymnalId(value) {
  return ACTIVE_HYMNALS.some(function (hymnal) { return hymnal.id === value; });
}

export function normalizeActiveHymnal(value) {
  return isActiveHymnalId(value) ? value : DEFAULT_ACTIVE_HYMNAL;
}

export function filterHymnsForActiveHymnal(rows) {
  return (Array.isArray(rows) ? rows : []).filter(function (hymn) {
    return String(hymn && hymn.source_hymnal || "").trim() === UPLOADED_HYMN_SOURCE;
  });
}
