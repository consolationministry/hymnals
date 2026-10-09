import ghb from "./cac-ghb.js";
import yhb from "./cac-yhb.js";

function firstLine(verses) {
  const first = Array.isArray(verses) ? verses.find(function (line) { return typeof line === "string" && line.trim(); }) : "";
  return String(first || "").split(/\r?\n/)[0].trim();
}

function convertCollection(sourceRows, firstId, language) {
  const english = language === "english";
  const sourceAbbr = english ? "CAC GHB" : "CAC YHB";
  const sourceHymnal = english
    ? "Christ Apostolic Church Gospel Hymn Book"
    : "Christ Apostolic Church Yoruba Hymn Book (Iwe Orin CAC)";
  const fileName = english ? "cac-ghb.js" : "cac-yhb.js";
  return sourceRows
    .map(function (record, index) {
      return { record: record, index: index, sourceNumber: Number(record.metadata && record.metadata.number), isVarious: Boolean(record.metadata && record.metadata.isVarious) };
    })
    .filter(function (item) { return Number.isInteger(item.sourceNumber) && item.sourceNumber > 0; })
    .sort(function (a, b) { return a.sourceNumber - b.sourceNumber || Number(a.isVarious) - Number(b.isVarious) || a.index - b.index; })
    .map(function (item, index) {
      const verses = Array.isArray(item.record.verses) ? item.record.verses.filter(function (line) { return typeof line === "string" && line.trim(); }) : [];
      const title = typeof item.record.title === "string" ? item.record.title.trim() : "";
      const first = firstLine(verses);
      const numberLabel = String(item.sourceNumber) + (item.isVarious ? "V" : "");
      return {
        hymn_number: firstId + index,
        title_en: english ? title : "",
        title_yoruba: english ? "" : title,
        first_line_en: english ? first : "",
        first_line_yoruba: english ? "" : first,
        category: sourceAbbr,
        verses_en: english ? verses : [],
        verses_yoruba: english ? [] : verses,
        chorus_en: english && typeof item.record.chorus === "string" ? item.record.chorus : "",
        chorus_yoruba: !english && typeof item.record.chorus === "string" ? item.record.chorus : "",
        keywords: [sourceAbbr, numberLabel, title].filter(Boolean),
        author_en: typeof item.record.author === "string" ? item.record.author : "Christ Apostolic Church (CAC) Worldwide",
        source_hymnal: sourceHymnal,
        source_publication_year: null,
        source_hymn_number: item.sourceNumber,
        source_number_label: numberLabel,
        source_first_line_en: english ? first : "",
        source_hymnary_url: "",
        lyrics_source_url: "https://github.com/ebena107/HymnFlow/blob/master/hymn-bundle/" + fileName,
        copyright_status: "Permission confirmed by app maintainer",
        copyright_basis: "The app maintainer confirmed permission to republish these lyrics from the CAC collection in HymnFlow.",
        yoruba_status: english ? "not-in-this-collection" : "source-collection"
      };
    });
}

export const hymns = [
  ...convertCollection(ghb, 1, "english"),
  ...convertCollection(yhb, ghb.length + 1, "yoruba")
];
