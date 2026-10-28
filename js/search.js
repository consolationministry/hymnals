function fold(value) {
  return String(value == null ? "" : value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

export function searchHymns(hymns, query) {
  const term = fold(query).trim();
  return hymns.filter(function (hymn) {
    if (!term) return true;
    const fields = [
      hymn.hymn_number,
      String(hymn.hymn_number).padStart(2, "0"),
      hymn.source_hymn_number,
      hymn.source_number_label,
      hymn.source_hymnal,
      hymn.title_en,
      hymn.title_yoruba,
      hymn.first_line_en,
      hymn.source_first_line_en,
      hymn.first_line_yoruba,
      hymn.hymnal_note,
      hymn.author_en,
      hymn.chorus_en,
      hymn.chorus_yoruba,
      ...(hymn.verses_en || []),
      ...(hymn.verses_yoruba || []),
      ...(hymn.keywords || [])
    ];
    return fields.some(function (field) { return fold(field).includes(term); });
  });
}

// Beginner-friendly ordering: an exact hymn number comes first, then numbers
// that start with the typed digits, then title matches, then everything else.
export function rankHymnResults(hymns, query) {
  const term = fold(query).trim();
  const matches = searchHymns(hymns, term);
  if (!term) return matches;
  const numberTerm = term.replace(/^0+(?=\d)/, "");
  const score = function (hymn) {
    const num = String(hymn.hymn_number).replace(/^0+(?=\d)/, "");
    if (/^\d+$/.test(numberTerm) && num === numberTerm) return 0;
    if (/^\d+$/.test(numberTerm) && num.startsWith(numberTerm)) return 1;
    if (fold(hymn.title_en).includes(term) || fold(hymn.title_yoruba).includes(term)) return 2;
    return 3;
  };
  return matches
    .sort(function (a, b) { return Number(a.hymn_number) - Number(b.hymn_number); })
    .map(function (hymn, index) { return { hymn, index, rank: score(hymn) }; })
    .sort(function (a, b) { return a.rank - b.rank || a.index - b.index; })
    .map(function (entry) { return entry.hymn; });
}
