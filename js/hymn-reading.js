// Stored lyric text remains untouched. Only imported collection records are
// split at existing blank-line boundaries for display labels.
export function getReadingParts(lyrics, chorus, options) {
  const text = Array.isArray(lyrics) ? lyrics.join("\n\n") : String(lyrics || "");
  const opts = options || {};
  if (!text) return chorus ? [{ type: "chorus", text: String(chorus) }] : [];
  const imported = opts.imported === true;
  const language = opts.language === "yoruba" ? "yoruba" : "english";
  const verses = imported
    ? text.split(/\n[ \t]*\n+/).filter(function (verse) { return verse !== ""; })
    : [text];
  const parts = [];
  verses.forEach(function (verse, index) {
    if (index === 1 && chorus) parts.push({ type: "chorus", text: String(chorus) });
    parts.push(imported
      ? { type: "lyrics", text: verse, number: index + 1, label: (language === "yoruba" ? "Orin " : "Verse ") + (index + 1) }
      : { type: "lyrics", text: verse });
  });
  if (chorus && verses.length === 0) parts.push({ type: "chorus", text: String(chorus) });
  if (chorus && verses.length > 1) parts.push({ type: "chorus", text: String(chorus) });
  else if (chorus && verses.length === 1 && parts.filter(function (part) { return part.type === "chorus"; }).length === 0) {
    parts.push({ type: "chorus", text: String(chorus) });
  }
  return parts;
}
