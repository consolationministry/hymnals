function hymnText(hymn, language) {
  const parts = [];
  parts.push("Hymn " + String(hymn.hymn_number).padStart(2, "0"));
  const hasYoruba = Array.isArray(hymn.verses_yoruba) && hymn.verses_yoruba.length > 0;
  const showEnglish = language === "english" || language === "both" || (language === "yoruba" && !hasYoruba);
  if (showEnglish) {
    parts.push(hymn.title_en);
    parts.push("");
    parts.push(...hymn.verses_en);
    if (hymn.chorus_en) {
      parts.push("Refrain:");
      parts.push(hymn.chorus_en);
    }
  }
  if ((language === "both" || language === "yoruba") && hasYoruba) {
    if (showEnglish) parts.push("");
    parts.push(hymn.title_yoruba);
    parts.push("");
    parts.push(...hymn.verses_yoruba);
    if (hymn.chorus_yoruba) {
      parts.push("Ìdáhùn:");
      parts.push(hymn.chorus_yoruba);
    }
  } else if (language === "both" || language === "yoruba") {
    parts.push("");
    parts.push("Yorùbá translation not yet sourced; English text shown.");
  }
  if (hymn.lyrics_source_url) parts.push("", "Text source: " + hymn.lyrics_source_url);
  return parts.join("\n");
}

export async function shareHymn(hymn, language) {
  const text = hymnText(hymn, language);
  const title = "Hymn " + String(hymn.hymn_number).padStart(2, "0") + " — " + hymn.title_en;
  if (navigator.share) {
    try {
      await navigator.share({ title: title, text: text, url: window.location.href });
      return "shared";
    } catch (error) {
      if (error && error.name === "AbortError") return "cancelled";
    }
  }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return "copied";
    }
  } catch (error) {
    // Continue to the selection fallback below.
  }
  try {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    if (copied) return "copied";
  } catch (error) {
    // Return an explicit unavailable state so the app can display the text for manual copying.
  }
  return text;
}
