export const APP_VERSION = "1.1.16";
export const ANDROID_RELEASES_API = "https://api.github.com/repos/consolationministry/hymnals/releases/latest";

export function isNewerVersion(candidate, current) {
  const parse = function (value) {
    const match = String(value || "").match(/(\d+)\.(\d+)\.(\d+)/);
    return match ? match.slice(1).map(Number) : null;
  };
  const next = parse(candidate);
  const installed = parse(current);
  if (!next || !installed) return false;
  for (let index = 0; index < 3; index += 1) {
    if (next[index] !== installed[index]) return next[index] > installed[index];
  }
  return false;
}
