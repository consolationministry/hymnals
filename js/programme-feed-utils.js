export const PROGRAMME_DESCRIPTION_COLLAPSE_LIMIT = 200;

export function excerptProgrammeDescription(value, limit) {
  const text = String(value == null ? "" : value).trim();
  const maxLength = Number.isInteger(limit) && limit > 0 ? limit : PROGRAMME_DESCRIPTION_COLLAPSE_LIMIT;
  const characters = Array.from(text);
  if (characters.length <= maxLength) return text;

  let excerpt = characters.slice(0, maxLength).join("");
  const wordBoundary = excerpt.lastIndexOf(" ");
  if (wordBoundary >= Math.floor(maxLength * 0.65)) excerpt = excerpt.slice(0, wordBoundary);
  return excerpt.trimEnd() + "…";
}
