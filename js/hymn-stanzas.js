// Splits a stored hymn string into numbered verses and chorus blocks.
// DB rows store each hymn as one string in verses_en[0] (or verses_yoruba[0]):
// stanzas are "N." numbered lines or blank-line separated, and a chorus is a
// "CHORUS:" (English) or "EGBE:" (Yorùbá) marker followed by its lines.
const CHORUS_MARKER = /^\s*(CHORUS|EGBE)\s*:\s*$/i;
const VERSE_NUMBER = /^\s*(\d+)\.\s*(.*)$/;

export function splitHymnText(raw) {
  const text = String(raw || "").replace(/\r\n?/g, "\n").trim();
  if (!text) return { verses: [], chorus: "" };
  const lines = text.split("\n");
  const blocks = [];
  let current = null;
  let mode = null;
  let sawNumbered = false;

  function open(kind) {
    current = { kind, lines: [] };
    blocks.push(current);
  }

  lines.forEach(function (line) {
    if (CHORUS_MARKER.test(line)) {
      mode = "chorus";
      open("chorus");
      return;
    }
    const numbered = VERSE_NUMBER.exec(line);
    if (numbered) {
      sawNumbered = true;
      mode = "verse";
      open("verse");
      current.lines.push(numbered[2]);
      return;
    }
    if (!line.trim()) {
      // blank line ends the current stanza
      if (current) current = null;
      return;
    }
    if (!current) open(mode === "chorus" ? "chorus" : "verse");
    current.lines.push(line);
  });

  let verses = blocks.filter(function (b) { return b.kind === "verse"; })
    .map(function (b) { return b.lines.join("\n").trim(); })
    .filter(Boolean);
  // No numbered verses: fall back to blank-line stanzas (Yorùbá rows).
  if (!sawNumbered) {
    verses = text.split(/\n\s*\n/).map(function (s) { return s.trim(); }).filter(Boolean);
  }
  const chorusBlocks = blocks.filter(function (b) { return b.kind === "chorus"; })
    .map(function (b) { return b.lines.join("\n").trim(); })
    .filter(Boolean);
  return { verses, chorus: chorusBlocks[0] || "" };
}

// Normalize a hymn row's text array into verses plus a chorus. A row with a
// separate chorus column keeps it; otherwise the inline chorus is used.
export function normalizeHymnVerses(verseArray, chorusColumn) {
  const parts = (Array.isArray(verseArray) ? verseArray : []).map(splitHymnText);
  const verses = parts.flatMap(function (p) { return p.verses; });
  const inlineChorus = parts.map(function (p) { return p.chorus; }).find(Boolean) || "";
  return { verses, chorus: String(chorusColumn || "").trim() || inlineChorus };
}
