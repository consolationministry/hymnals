function fold(value) {
  return String(value == null ? "" : value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

export function searchHymns(hymns, query, category) {
  const term = fold(query).trim();
  return hymns.filter(function (hymn) {
    const inCategory = !category || hymn.category === category;
    if (!inCategory) return false;
    if (!term) return true;
    const fields = [
      hymn.hymn_number,
      String(hymn.hymn_number).padStart(2, "0"),
      hymn.title_en,
      hymn.title_yoruba,
      hymn.first_line_en,
      hymn.first_line_yoruba,
      hymn.category,
      hymn.chorus_en,
      hymn.chorus_yoruba,
      ...(hymn.verses_en || []),
      ...(hymn.verses_yoruba || []),
      ...(hymn.keywords || [])
    ];
    return fields.some(function (field) { return fold(field).includes(term); });
  });
}
