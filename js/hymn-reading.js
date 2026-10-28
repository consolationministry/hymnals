function isMeterHeading(text) {
  const firstLine = String(text || "").split(/\r?\n/)[0].trim().replace(/\.{2,}/g, ".");
  return /^(?:\d+\.)+\d*(?:\s*[d&.]+\s*(?:ref\.?|chorus)?)?$/i.test(firstLine);
}

// Layout rules: chorus is never merged into a verse.
// - after verse 1
// - again after verse 5 when the hymn has more than 5 verses
// - once at the end
export function getReadingParts(verses, chorus, options) {
  const sourceVerses = Array.isArray(verses) ? verses : [];
  const hasMeterPreface = Boolean(options && options.hasMeterPreface) && sourceVerses.length > 0 && isMeterHeading(sourceVerses[0]);
  const lyricVerses = hasMeterPreface ? sourceVerses.slice(1) : sourceVerses;
  const parts = hasMeterPreface ? [{ type: "heading", text: sourceVerses[0] }] : [];
  const chorusPart = chorus ? { type: "chorus", text: chorus } : null;

  lyricVerses.forEach(function (text, index) {
    const number = index + 1;
    parts.push({ type: "verse", number, text });
    if (chorusPart && number === 1) parts.push(chorusPart);
    if (chorusPart && number === 5 && lyricVerses.length > 5) parts.push(chorusPart);
  });

  // Closing chorus. Skipped for a one-verse hymn, where it already follows verse 1.
  if (chorusPart && lyricVerses.length !== 1) parts.push(chorusPart);

  return parts;
}
