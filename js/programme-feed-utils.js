export const PROGRAMME_DESCRIPTION_COLLAPSE_LIMIT = 200;

const MOJIBAKE_SEQUENCE = /(?:\u00c2[\u0080-\u00ff]|\u00c3[\u0080-\u00ff]|\u00e2[\u0080-\u00ff]{2})/g;

export function repairMojibake(value) {
  const text = String(value == null ? "" : value);
  return text.replace(MOJIBAKE_SEQUENCE, function (sequence) {
    const encoded = Array.from(sequence, function (character) {
      return "%" + character.charCodeAt(0).toString(16).padStart(2, "0");
    }).join("");
    try { return decodeURIComponent(encoded); } catch (error) { return sequence; }
  });
}

export function excerptProgrammeDescription(value, limit) {
  const text = repairMojibake(value).trim();
  const maxLength = Number.isInteger(limit) && limit > 0 ? limit : PROGRAMME_DESCRIPTION_COLLAPSE_LIMIT;
  const characters = Array.from(text);
  if (characters.length <= maxLength) return text;

  let excerpt = characters.slice(0, maxLength).join("");
  const wordBoundary = excerpt.lastIndexOf(" ");
  if (wordBoundary >= Math.floor(maxLength * 0.65)) excerpt = excerpt.slice(0, wordBoundary);
  return excerpt.trimEnd() + "…";
}
