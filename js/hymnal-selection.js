export const UPLOADED_HYMN_SOURCE = "Uploaded Hymn Collection";
export const UPLOADED_YORUBA_HYMN_SOURCE = "Uploaded Yorùbá Hymn Collection";

export function isManagedHymnSource(source) {
  return source === UPLOADED_HYMN_SOURCE || source === UPLOADED_YORUBA_HYMN_SOURCE;
}
