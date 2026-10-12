export function adminHymnNumberLabel(hymn) {
  const record = hymn || {};
  const internalNumber = String(record.hymn_number == null ? "" : record.hymn_number);
  const sourceNumber = Number(record.source_hymn_number);
  if (Number.isInteger(sourceNumber) && sourceNumber > 0) {
    return "Book #" + sourceNumber + " · record ID " + internalNumber;
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
