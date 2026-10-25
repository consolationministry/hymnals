export function findMissingHymnsByNumber(candidateRows, existingRows) {
  const existingNumbers = new Set((Array.isArray(existingRows) ? existingRows : [])
    .map(function (hymn) { return Number(hymn && hymn.hymn_number); })
    .filter(function (number) { return Number.isInteger(number) && number > 0; }));

  return (Array.isArray(candidateRows) ? candidateRows : []).filter(function (hymn) {
    const number = Number(hymn && hymn.hymn_number);
    return Number.isInteger(number) && number > 0 && !existingNumbers.has(number);
  });
}
