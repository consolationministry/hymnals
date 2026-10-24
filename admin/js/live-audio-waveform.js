export function buildWaveformPeaks(samples, columnCount) {
  const sampleCount = samples && Number.isFinite(samples.length) ? samples.length : 0;
  if (!sampleCount) return [];

  const requestedColumns = Math.floor(Number(columnCount));
  if (!Number.isFinite(requestedColumns) || requestedColumns < 1) return [];
  const columns = Math.min(sampleCount, requestedColumns);

  return Array.from({ length: columns }, (_, column) => {
    const start = Math.floor((column * sampleCount) / columns);
    const end = Math.floor(((column + 1) * sampleCount) / columns);
    let minimum = 0;
    let maximum = 0;

    for (let index = start; index < end; index += 1) {
      const sample = Number(samples[index]);
      const amplitude = Number.isFinite(sample)
        ? Math.max(-1, Math.min(1, (sample - 128) / 128))
        : 0;
      if (index === start) {
        minimum = amplitude;
        maximum = amplitude;
      } else {
        minimum = Math.min(minimum, amplitude);
        maximum = Math.max(maximum, amplitude);
      }
    }

    return { min: minimum, max: maximum };
  });
}

export function buildWaveformBars(samples, columnCount) {
  return buildWaveformPeaks(samples, columnCount).map(peak =>
    Math.max(Math.abs(peak.min), Math.abs(peak.max))
  );
}
