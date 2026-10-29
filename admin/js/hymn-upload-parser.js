export function splitHymnText(text) {
  return String(text || "").replace(/\r\n?/g, "\n").split(/\n[ \t]*\n+/).filter(block => block !== "");
}

export function parseHymnText(text) {
  const blocks = splitHymnText(text);
  const hymns = [];
  let current = null;
  const heading = /^(?:hymn\s*)?(?:no\.?\s*)?(\d{1,5})\s*[.)\-:]?\s+(.+)$/i;
  function finish() {
    if (current) {
      current.verses = current.verses.filter(Boolean);
      current.number = current.hymn_number;
      hymns.push(current);
    }
  }
  for (const block of blocks) {
    const lines = block.split("\n");
    const first = lines[0].trim();
    const match = first.match(heading);
    if (match) {
      finish();
      current = { hymn_number: Number(match[1]), title: match[2].trim(), verses: [], chorus: "", chorusLabel: "" };
      if (lines.length > 1) current.verses.push(lines.slice(1).join("\n"));
      continue;
    }
    if (!current) {
      current = { hymn_number: "", title: "", verses: [], chorus: "", chorusLabel: "" };
      const title = first.match(/^(?:title\s*:\s*)(.+)$/i);
      if (title) current.title = title[1].trim();
      const rest = title ? lines.slice(1) : lines;
      if (rest.length) {
        const textPart = rest.join("\n");
        const chorus = textPart.match(/^(?:egbe|chorus|refrain)\s*:?\s*([\s\S]*)$/i);
        if (chorus) { current.chorus = chorus[1]; current.chorusLabel = /^egbe/i.test(textPart) ? "yoruba" : "english"; }
        else current.verses.push(textPart);
      }
      continue;
    }
    const chorus = block.match(/^(?:egbe|chorus|refrain)\s*:?\s*([\s\S]*)$/i);
    if (chorus) { current.chorus = chorus[1]; current.chorusLabel = /^egbe/i.test(block) ? "yoruba" : "english"; }
    else current.verses.push(block);
  }
  finish();
  return hymns;
}

export async function extractHymnUploadText(file, { documentParser = globalThis.mammoth, pdfParser = globalThis.pdfjsLib } = {}) {
  const name = String(file?.name || "").toLowerCase();
  if (name.endsWith(".txt")) return file.text();
  if (name.endsWith(".docx")) {
    if (!documentParser?.extractRawText) throw new Error("DOCX parser is not loaded.");
    const result = await documentParser.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return String(result?.value || "");
  }
  if (name.endsWith(".pdf")) {
    if (!pdfParser?.getDocument) throw new Error("PDF parser is not loaded.");
    const pdf = await pdfParser.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      pages.push(content.items.map(item => item.str || "").join(" "));
    }
    return pages.join("\n\n");
  }
  throw new Error("Choose a .docx, .pdf, or .txt file.");
}

export function toHymnUploadRecord(parsed, language, index = 0) {
  const yoruba = language === "yoruba";
  const verses = Array.isArray(parsed?.verses) ? parsed.verses : [];
  return {
    hymn_number: Number(parsed?.hymn_number) || index + 1,
    title_en: yoruba ? "" : String(parsed?.title || ""),
    title_yoruba: yoruba ? String(parsed?.title || "") : "",
    first_line_en: yoruba ? "" : (verses[0] || "").split("\n")[0],
    first_line_yoruba: yoruba ? (verses[0] || "").split("\n")[0] : "",
    verses_en: yoruba ? [] : verses,
    verses_yoruba: yoruba ? verses : [],
    chorus_en: yoruba ? "" : String(parsed?.chorus || ""),
    chorus_yoruba: yoruba ? String(parsed?.chorus || "") : "",
    chorusLabel: parsed?.chorusLabel || "",
    language
  };
}
