function isMeterHeading(text) {
  const firstLine = String(text || "").split(/\r?\n/)[0].trim().replace(/\.{2,}/g, ".");
  return /^(?:\d+\.)+\d*(?:\s*[d&.]+\s*(?:ref\.?|chorus)?)?$/i.test(firstLine);
}

export function getReadingParts(verses, chorus, options) {
  const sourceVerses = Array.isArray(verses) ? verses : [];
  const hasMeterPreface = Boolean(options && options.hasMeterPreface) && sourceVerses.length > 0 && isMeterHeading(sourceVerses[0]);
  const lyricVerses = hasMeterPreface ? sourceVerses.slice(1) : sourceVerses;
  const parts = hasMeterPreface ? [{ type: "heading", text: sourceVerses[0] }] : [];

  lyricVerses.forEach(function (text, index) {
    parts.push({ type: "verse", number: index + 1, text });
  });

  if (chorus) {
    const firstVerseIndex = parts.findIndex(function (part) { return part.type === "verse"; });
    const chorusIndex = firstVerseIndex >= 0 ? firstVerseIndex + 1 : parts.length;
    parts.splice(chorusIndex, 0, { type: "chorus", text: chorus });
  }

  return parts;
}