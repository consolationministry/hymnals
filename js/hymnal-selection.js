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
    description: "The uploaded English hymns, including missing songs from the CAC Gospel Hymn Book."
  })
]);

const UPLOADED_HYMN_SOURCE = "Uploaded Hymn Collection";

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

function isCurrentCacEnglishHymnal(source) {
  return /\bCAC\s*GHB\b/i.test(source) || /Christ Apostolic Church Gospel Hymn Book/i.test(source);
}

function printedHymnNumber(hymn) {
  const number = Number(hymn && hymn.source_hymn_number);
  return Number.isInteger(number) && number > 0 ? number : 0;
}

function normalizeSongText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/\bfill'd\b/g, "filled")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function songTextOptions(hymn) {
  return [hymn && hymn.title_en, hymn && hymn.first_line_en, hymn && hymn.source_first_line_en]
    .map(normalizeSongText)
    .filter(Boolean);
}

function isSamePrintedSong(left, right) {
  const number = printedHymnNumber(left);
  if (!number || number !== printedHymnNumber(right)) return false;

  const rightTexts = new Set(songTextOptions(right));
  return songTextOptions(left).some(function (text) { return rightTexts.has(text); });
}

function sortByPrintedNumber(left, right) {
  const numberDifference = printedHymnNumber(left) - printedHymnNumber(right);
  if (numberDifference) return numberDifference;

  const labelDifference = String(left && left.source_number_label || "").localeCompare(
    String(right && right.source_number_label || ""),
    "en",
    { numeric: true, sensitivity: "base" }
  );
  if (labelDifference) return labelDifference;
  return Number(left && left.hymn_number || 0) - Number(right && right.hymn_number || 0);
}

export function filterHymnsForActiveHymnal(rows, activeHymnal) {
  const selected = normalizeActiveHymnal(activeHymnal);
  const sourceRows = Array.isArray(rows) ? rows : [];
  if (selected !== "uploaded") {
    return sourceRows.filter(function (hymn) {
      return isCurrentCacHymnal(String(hymn && hymn.source_hymnal || "").trim());
    });
  }

  const uploadedRows = sourceRows.filter(function (hymn) {
    return String(hymn && hymn.source_hymnal || "").trim() === UPLOADED_HYMN_SOURCE;
  });
  const missingEnglishRows = sourceRows.filter(function (hymn) {
    const source = String(hymn && hymn.source_hymnal || "").trim();
    return printedHymnNumber(hymn) > 0 && isCurrentCacEnglishHymnal(source) &&
      !uploadedRows.some(function (uploaded) { return isSamePrintedSong(hymn, uploaded); });
  });

  return uploadedRows.concat(missingEnglishRows).sort(sortByPrintedNumber);
}
