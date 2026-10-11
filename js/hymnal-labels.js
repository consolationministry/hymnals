const CHURCH_NAME = "Consolation Evangelical and Revival Church";
const LEGACY_CHURCH_LABEL = /\bCAC\b|\bGAC\b|Christ Apostolic Church|Iwe Orin CAC/i;

export function displayHymnalName(hymn) {
  const source = String(hymn && hymn.source_hymnal || "").trim();
  const category = String(hymn && hymn.category || "").trim();
  const combined = source + " " + category;
  if (!LEGACY_CHURCH_LABEL.test(combined)) return source || "Hymn Book";

  const isYoruba = /\bYHB\b|Yor[uù]b[aá]|Iwe Orin/i.test(combined);
  return CHURCH_NAME + (isYoruba ? " Yorùbá Hymn Book" : " Gospel Hymn Book");
}

export function displayCollectionLabel(category, source) {
  const label = String(category || "").trim();
  const combined = label + " " + String(source || "");
  if (!LEGACY_CHURCH_LABEL.test(combined)) return label;

  if (/\bYHB\b|Yor[uù]b[aá]|Iwe Orin/i.test(combined)) return "Yorùbá Hymn Book";
  if (/\bGHB\b|Gospel Hymn Book/i.test(combined)) return "Gospel Hymn Book";
  return "Hymn Book";
}
