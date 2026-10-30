export const APP_VERSION = "1.1.163";
export const ANDROID_RELEASES_API = "https://api.github.com/repos/consolationministry/hymnals/releases/latest";
export const ANDROID_APK_ASSET = "consolation-hymnal-android.apk";
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

export function getAndroidApkRelease(release, installedVersion) {
  if (!release || release.draft || release.prerelease ||
      !isNewerVersion(release.tag_name, APP_VERSION) ||
      !isNewerVersion(release.tag_name, installedVersion || APP_VERSION)) {
    return null;
  }

  const apk = (release.assets || []).find(function (asset) {
    if (asset.name !== ANDROID_APK_ASSET) return false;
    try {
      const url = new URL(asset.browser_download_url);
      return url.protocol === "https:" &&
        url.hostname === "github.com" &&
        url.href.startsWith(ANDROID_RELEASE_DOWNLOAD_PREFIX);
    } catch (error) {
      return false;
    }
  });

  if (!apk) return null;
  return {
    version: release.tag_name.replace(/^v/, ""),
    apkUrl: apk.browser_download_url,
    releaseUrl: release.html_url
  };
}
