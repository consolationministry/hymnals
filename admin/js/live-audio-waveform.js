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


const WAVEFORM_NOISE_FLOOR = 2 / 128;
const WAVEFORM_TARGET_PEAK = 0.72;
const WAVEFORM_MAX_DISPLAY_GAIN = 8;

export function getWaveformDisplayGain(bars) {
  const peak = Array.from(bars || []).reduce((maximum, value) => {
    const amplitude = Number(value);
    return Number.isFinite(amplitude)
      ? Math.max(maximum, Math.max(0, Math.min(1, amplitude)))
      : maximum;
  }, 0);
  if (peak <= WAVEFORM_NOISE_FLOOR) return 1;
  return Math.min(WAVEFORM_MAX_DISPLAY_GAIN, Math.max(1, WAVEFORM_TARGET_PEAK / peak));
}

export function scaleWaveformBars(bars, gain) {
  const value = Number(gain);
  const safeGain = Number.isFinite(value)
    ? Math.max(1, Math.min(WAVEFORM_MAX_DISPLAY_GAIN, value))
    : 1;
  return Array.from(bars || [], bar => {
    const amplitude = Number(bar);
    if (!Number.isFinite(amplitude)) return 0;
    const bounded = Math.max(0, Math.min(1, amplitude));
    if (bounded <= WAVEFORM_NOISE_FLOOR) return 0;
    return Math.min(1, bounded * safeGain);
  });
}
