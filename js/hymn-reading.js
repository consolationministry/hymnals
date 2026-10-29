// Stored lyric text remains untouched. Only imported collection records are
// split at existing blank-line boundaries for display labels.
export function getReadingParts(lyrics, chorus, options) {
  const text = Array.isArray(lyrics) ? lyrics.join("\n\n") : String(lyrics || "");
  const opts = options || {};
  if (!text) return chorus ? [{ type: "chorus", text: String(chorus) }] : [];
  const imported = opts.imported === true;
  const language = opts.language === "yoruba" ? "yoruba" : "english";
  const verses = imported
    ? (Array.isArray(lyrics)
      ? lyrics.filter(function (verse) { return typeof verse === "string" && verse !== ""; })
      : text.split(/\n[ \t]*\n+/).filter(function (verse) { return verse !== ""; }))
    : [text];
  const parts = [];
  verses.forEach(function (verse, index) {
    parts.push(imported
      ? { type: "lyrics", text: verse, number: index + 1, label: (language === "yoruba" ? "Orin " : "Verse ") + (index + 1) }
      : { type: "lyrics", text: verse });
    if (chorus && index === 0) parts.push({ type: "chorus", text: String(chorus) });
  });
  if (chorus && verses.length > 1) parts.push({ type: "chorus", text: String(chorus) });
  return parts;
}
