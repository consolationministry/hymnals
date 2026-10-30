// Embedded Egbe markers are display metadata, not lyric lines. Keep the words
// and line breaks intact while extracting repeated chorus stanzas.
function splitEmbeddedEgbe(text) {
  const source = String(text || "");
  const markers = Array.from(source.matchAll(/(?:^|\r?\n)[ \t]*EGBE[ \t]*:[ \t]*(?:\r?\n|$)/gim));
  if (!markers.length) return { verses: [source], choruses: [] };

  const leading = source.slice(0, markers[0].index).replace(/(?:\r?\n)+$/g, "");
  const sections = markers.map(function (marker, index) {
    const start = marker.index + marker[0].length;
    const end = markers[index + 1] ? markers[index + 1].index : source.length;
    return source.slice(start, end).replace(/^(?:\r?\n)+|(?:\r?\n)+$/g, "");
  });
  const chorusLines = sections.map(function (section) { return section.split(/\r?\n/); });
  const common = [];
  for (let i = 0; chorusLines.length > 1 && chorusLines.every(function (lines) { return lines[i] !== undefined && lines[i] === chorusLines[0][i]; }); i += 1) common.push(chorusLines[0][i]);
  const chorus = common.length ? common.join("\n") : sections[0];
  const verses = leading ? [leading] : [];
  sections.forEach(function (section) {
    if (!section) return;
    let body = section;
    if (body === chorus) body = "";
    else if (body.startsWith(chorus + "\n")) body = body.slice(chorus.length + 1);
    if (body) verses.push(body);
  });
  return { verses: verses, choruses: chorus ? [chorus] : [] };
}

export function getReadingParts(lyrics, chorus, options) {
  const opts = options || {};
  const imported = opts.imported === true;
  const language = opts.language === "yoruba" ? "yoruba" : "english";
  const source = Array.isArray(lyrics) ? lyrics : (lyrics ? [String(lyrics)] : []);
  const embeddedChoruses = [];
  const verses = imported
    ? source.flatMap(function (entry) { return opts.extractEmbeddedEgbe ? splitEmbeddedEgbe(entry).verses : String(entry).split(/\n[ \t]*\n+/); }).filter(function (verse) { return typeof verse === "string" && verse !== ""; })
    : (opts.extractEmbeddedEgbe
      ? source.flatMap(function (entry) { return splitEmbeddedEgbe(entry).verses; }).filter(function (verse) { return verse !== ""; })
      : (source.length ? [source.join("\n\n")] : []));
  source.forEach(function (entry) {
    if (opts.extractEmbeddedEgbe) embeddedChoruses.push.apply(embeddedChoruses, splitEmbeddedEgbe(entry).choruses);
  });
  const explicitChorus = chorus ? String(chorus) : "";
  const refrain = explicitChorus || embeddedChoruses[0] || "";
  const parts = [];
  verses.forEach(function (verse, index) {
    parts.push(imported
      ? { type: "lyrics", text: verse, number: index + 1, label: (language === "yoruba" ? "Orin " : "Verse ") + (index + 1) }
      : { type: "lyrics", text: verse });
    if (refrain && index === 0) parts.push({ type: "chorus", text: refrain });
  });
  if (refrain && verses.length > 1) parts.push({ type: "chorus", text: refrain });
  if (!verses.length && refrain) parts.push({ type: "chorus", text: refrain });
  return parts;
}
