import { UPLOADED_HYMN_SOURCE, UPLOADED_YORUBA_HYMN_SOURCE } from "../../js/hymnal-selection.js";

export function filterAdminHymnsByLanguage(hymns, language) {
  const rows = Array.isArray(hymns) ? hymns : [];
  if (language !== "english" && language !== "yoruba") return rows;
  const source = language === "yoruba" ? UPLOADED_YORUBA_HYMN_SOURCE : UPLOADED_HYMN_SOURCE;
  return rows.filter(function (hymn) { return hymn && hymn.source_hymnal === source; });
}

export function adminHymnNumberLabel(hymn) {
  const record = hymn || {};
  const internalNumber = String(record.hymn_number == null ? "" : record.hymn_number);
  const sourceNumber = Number(record.source_hymn_number);
  if (Number.isInteger(sourceNumber) && sourceNumber > 0) {
    const printedNumber = record.source_hymnal === UPLOADED_YORUBA_HYMN_SOURCE ? String(sourceNumber).padStart(3, "0") : String(sourceNumber);
    return "Book #" + printedNumber + " · record ID " + internalNumber;
  }
  return "Hymn #" + internalNumber;
}

export function adminHymnTitle(hymn) {
  const record = hymn || {};
  return record.title_en || record.title_yoruba || "Untitled hymn";
}

export function hasAdminHymnTitle(hymn) {
  const record = hymn || {};
  return Boolean(String(record.title_en || "").trim() || String(record.title_yoruba || "").trim());
}
