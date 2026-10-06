import { App } from "@capacitor/app";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { ANDROID_RELEASES_API, APP_VERSION, getAndroidWebBundle, isNewerVersion } from "./version.js";

let availableUpdate = null;
let onUpdateAvailable = null;
let checkInProgress = false;

async function checkAndroidRelease() {
  if (!navigator.onLine || checkInProgress) return;
  checkInProgress = true;
  try {
    const response = await fetch(ANDROID_RELEASES_API, {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store"
    });
    if (!response.ok) return;
    const release = await response.json();
    const appInfo = await App.getInfo();
    const active = await CapacitorUpdater.current();
    const activeVersion = active.bundle.id !== "builtin" && active.bundle.version
      ? active.bundle.version
      : active.native || appInfo.version || APP_VERSION;
    const update = getAndroidWebBundle(release);
    if (!update || !isNewerVersion(update.version, activeVersion)) return;
    availableUpdate = update;
    if (onUpdateAvailable) {
      onUpdateAvailable({ kind: "android", version: availableUpdate.version, releaseUrl: availableUpdate.releaseUrl });
    }
  } catch (error) {
    // Offline launches are expected. A later online or foreground event retries.
  } finally {
    checkInProgress = false;
  }
}

export function confirmNativeAppReady() {
  return CapacitorUpdater.notifyAppReady();
}

export async function initializeNativeUpdates(onAvailable) {
  onUpdateAvailable = onAvailable;
  await checkAndroidRelease();
  window.addEventListener("online", checkAndroidRelease);
  App.addListener("appStateChange", function (state) {
    if (state.isActive) checkAndroidRelease();
  }).catch(function () {});
}

export async function applyNativeUpdate(onProgress) {
  if (!availableUpdate) throw new Error("There is no update ready to install.");
  const update = availableUpdate;
  availableUpdate = null;
  let progressListener;

  try {
    progressListener = await CapacitorUpdater.addListener("download", function (progress) {
      if (onProgress) {
        onProgress("Downloading the in-app update… " + Math.round(progress.percent) + "%");
      }
    });
    const bundle = await CapacitorUpdater.download({
      url: update.bundleUrl,
      version: update.version
    });
    await CapacitorUpdater.next({ id: bundle.id });
    if (onProgress) onProgress("Applying the update inside the app…");
    await CapacitorUpdater.reload();
    return { reload: true };
  } catch (error) {
    availableUpdate = update;
    throw error;
  } finally {
    if (progressListener) {
      await progressListener.remove().catch(function () {});
    }
  }
}
