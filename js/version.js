export const APP_VERSION = "1.1.0";
export const ANDROID_RELEASES_API = "https://api.github.com/repos/consolationministry/hymnals/releases/latest";
export const ANDROID_WEB_BUNDLE_ASSET = "consolation-hymnal-android-web.zip";
const ANDROID_RELEASE_DOWNLOAD_PREFIX = "https://github.com/consolationministry/hymnals/releases/download/";

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

export function getAndroidWebBundle(release) {
  if (!release || release.draft || release.prerelease || !isNewerVersion(release.tag_name, APP_VERSION)) {
    return null;
  }
  const asset = (release.assets || []).find(function (item) {
    if (item.name !== ANDROID_WEB_BUNDLE_ASSET) return false;
    try {
      const url = new URL(item.browser_download_url);
      return url.protocol === "https:" &&
        url.hostname === "github.com" &&
        url.href.startsWith(ANDROID_RELEASE_DOWNLOAD_PREFIX);
    } catch (error) {
      return false;
    }
  });
  if (!asset) return null;
  return {
    version: release.tag_name.replace(/^v/, ""),
    bundleUrl: asset.browser_download_url,
    releaseUrl: release.html_url
  };
}
