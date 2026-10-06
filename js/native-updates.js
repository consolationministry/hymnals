import { App } from "@capacitor/app";
import { FileTransfer } from "@capacitor/file-transfer";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { FileOpener } from "@capawesome-team/capacitor-file-opener";
import { APP_VERSION, ANDROID_RELEASES_API, isNewerVersion } from "./version.js";

let availableUpdate = null;
let onUpdateAvailable = null;

async function checkAndroidRelease() {
  if (!navigator.onLine) return;
  try {
    const response = await fetch(ANDROID_RELEASES_API, {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store"
    });
    if (!response.ok) return;
    const release = await response.json();
    if (release.draft || release.prerelease || !isNewerVersion(release.tag_name, APP_VERSION)) return;

    const apk = (release.assets || []).find(function (asset) {
      return asset.name === "consolation-hymnal-android.apk" &&
        /^https:\/\/github\.com\/consolationministry\/hymnals\/releases\/download\//.test(asset.browser_download_url || "");
    });
    if (!apk) return;

    const appInfo = await App.getInfo();
    if (!isNewerVersion(release.tag_name, appInfo.version || APP_VERSION)) return;
    availableUpdate = {
      version: release.tag_name.replace(/^v/, ""),
      apkUrl: apk.browser_download_url,
      releaseUrl: release.html_url
    };
    if (onUpdateAvailable) {
      onUpdateAvailable({ kind: "android", version: availableUpdate.version, releaseUrl: availableUpdate.releaseUrl });
    }
  } catch (error) {
    // Offline launches are expected. A later online event retries the check.
  }
}

export async function initializeNativeUpdates(onAvailable) {
  onUpdateAvailable = onAvailable;
  checkAndroidRelease();
  window.addEventListener("online", checkAndroidRelease);
}

export async function applyNativeUpdate(onProgress) {
  if (!availableUpdate) throw new Error("There is no update ready to install.");
  const filename = "consolation-hymnal-update-" + availableUpdate.version + ".apk";
  const destination = await Filesystem.getUri({ directory: Directory.Cache, path: filename });
  const progressListener = await FileTransfer.addListener("progress", function (progress) {
    if (onProgress && progress.contentLength > 0) {
      const percent = Math.min(100, Math.round((progress.bytes / progress.contentLength) * 100));
      onProgress("Downloading update… " + percent + "%");
    } else if (onProgress) {
      onProgress("Downloading the update…");
    }
  });

  try {
    await FileTransfer.downloadFile({
      url: availableUpdate.apkUrl,
      path: destination.uri,
      progress: true,
      connectTimeout: 30000,
      readTimeout: 120000
    });
  } finally {
    await progressListener.remove();
  }

  if (onProgress) onProgress("Opening Android's installer…");
  await FileOpener.openFile({
    path: destination.uri,
    mimeType: "application/vnd.android.package-archive"
  });
  return { installerOpened: true };
}
