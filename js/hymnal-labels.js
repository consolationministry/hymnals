const CONSOLATION_HYMN_SOURCE = /Uploaded Hymn Collection|Consolation Hymn/i;
const ORIGINAL_CONSOLATION_HYMN_SOURCE = /^(?:Uploaded Hymn Collection|Original Consolation Hymn)$/i;

export function displayHymnalName(hymn) {
  const source = String(hymn && hymn.source_hymnal || "").trim();
  if (ORIGINAL_CONSOLATION_HYMN_SOURCE.test(source)) return "Original Consolation Hymn";
  if (CONSOLATION_HYMN_SOURCE.test(source)) return "Consolation Hymn";
  return source || "Hymn Book";
}
