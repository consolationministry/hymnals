// Keep lyric text as one untouched field. Array entries represent paragraphs
// saved by the editor, while newlines inside an entry remain ordinary line breaks.
export function getReadingParts(lyrics, chorus) {
  const text = Array.isArray(lyrics) ? lyrics.join("\n\n") : String(lyrics || "");
  const parts = text ? [{ type: "lyrics", text }] : [];
  if (chorus) parts.push({ type: "chorus", text: String(chorus) });
  return parts;
}
