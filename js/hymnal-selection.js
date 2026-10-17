export const DEFAULT_ACTIVE_HYMNAL = "cac";

export const ACTIVE_HYMNALS = Object.freeze([
  Object.freeze({
    id: "cac",
    label: "Current CAC collection",
    description: "The existing English and Yorùbá CAC hymn books."
  }),
  Object.freeze({
    id: "uploaded",
    label: "Original Consolation Hymn",
    description: "The original English hymn collection from your DOCX."
  })
]);

export function isActiveHymnalId(value) {
  return ACTIVE_HYMNALS.some(function (hymnal) { return hymnal.id === value; });
}

export function normalizeActiveHymnal(value) {
  return isActiveHymnalId(value) ? value : DEFAULT_ACTIVE_HYMNAL;
}

function isCurrentCacHymnal(source) {
  return /\bCAC\s*(?:GHB|YHB)\b/i.test(source) ||
    /Christ Apostolic Church (?:Gospel Hymn Book|Yoruba Hymn Book(?: \(Iwe Orin CAC\))?)/i.test(source);
}

export function filterHymnsForActiveHymnal(rows, activeHymnal) {
  const selected = normalizeActiveHymnal(activeHymnal);
  return (Array.isArray(rows) ? rows : []).filter(function (hymn) {
    const source = String(hymn && hymn.source_hymnal || "").trim();
    if (selected === "uploaded") return source === "Uploaded Hymn Collection";
    return isCurrentCacHymnal(source);
  });
}
