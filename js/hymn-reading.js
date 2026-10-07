export function getReadingParts(verses, chorus) {
  const parts = (Array.isArray(verses) ? verses : []).map(function (text, index) {
    return { type: "verse", number: index + 1, text };
  });

  if (chorus) {
    parts.splice(Math.min(1, parts.length), 0, { type: "chorus", text: chorus });
  }

  return parts;
}
