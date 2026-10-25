export const DEFAULT_ACTIVE_HYMNAL = "both";

export const UPLOADED_HYMN_SOURCE = "Uploaded Hymn Collection";
export const UPLOADED_YORUBA_HYMN_SOURCE = "Uploaded Yorùbá Hymn Collection";

export const ACTIVE_HYMNALS = Object.freeze([
  Object.freeze({
    id: "both",
    label: "English and Yorùbá",
    description: "Make both collections available to members; their printed numbers are not assumed to be translations."
  }),
  Object.freeze({
    id: "uploaded",
    label: "Original Consolation Hymn",
    description: "The uploaded English hymn collection."
  }),
  Object.freeze({
    id: "yoruba",
    label: "Uploaded Yorùbá Hymn Collection",
    description: "The separate user-provided Yorùbá hymnal."
  })
]);

export function isManagedHymnSource(source) {
  return source === UPLOADED_HYMN_SOURCE || source === UPLOADED_YORUBA_HYMN_SOURCE;
}

export function isActiveHymnalId(value) {
  return ACTIVE_HYMNALS.some(function (hymnal) { return hymnal.id === value; });
}

export function normalizeActiveHymnal(value) {
  return isActiveHymnalId(value) ? value : DEFAULT_ACTIVE_HYMNAL;
}

export function filterHymnsForActiveHymnal(rows, value) {
  const activeHymnal = normalizeActiveHymnal(value);
  return (Array.isArray(rows) ? rows : []).filter(function (hymn) {
    const source = String(hymn && hymn.source_hymnal || "").trim();
    if (activeHymnal === "uploaded") return source === UPLOADED_HYMN_SOURCE;
    if (activeHymnal === "yoruba") return source === UPLOADED_YORUBA_HYMN_SOURCE;
    return isManagedHymnSource(source);
  });
}
