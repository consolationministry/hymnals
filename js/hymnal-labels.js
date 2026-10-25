const CONSOLATION_HYMN_SOURCE = /Uploaded Hymn Collection|Consolation Hymn/i;
const ORIGINAL_CONSOLATION_HYMN_SOURCE = /^(?:Uploaded Hymn Collection|Original Consolation Hymn)$/i;

export function displayHymnalName(hymn) {
  const source = String(hymn && hymn.source_hymnal || "").trim();
  const category = String(hymn && hymn.category || "").trim();
  if (ORIGINAL_CONSOLATION_HYMN_SOURCE.test(source)) return "Original Consolation Hymn";
  if (CONSOLATION_HYMN_SOURCE.test(source + " " + category)) return "Consolation Hymn";
  return source || category || "Hymn Book";
}

export function displayCollectionLabel(category, source) {
  const label = String(category || "").trim();
  if (CONSOLATION_HYMN_SOURCE.test(label + " " + String(source || ""))) return "Consolation Hymn";
  return label;
}
