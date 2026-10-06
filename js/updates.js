import { APP_VERSION } from "./version.js";

let availableUpdate = null;
let serviceWorkerRegistration = null;
let nativeUpdateManager = null;
let hasScheduledReload = false;

function announce(onAvailable, update) {
  availableUpdate = update;
  if (onAvailable) onAvailable(update);
}

function watchServiceWorker(registration, onAvailable) {
  serviceWorkerRegistration = registration;
  const showIfWaiting = function () {
    if (registration.waiting && navigator.serviceWorker.controller) {
      announce(onAvailable, { kind: "web", version: APP_VERSION });
    }
  };

  showIfWaiting();
  registration.addEventListener("updatefound", function () {
    const installing = registration.installing;
    if (!installing) return;
    installing.addEventListener("statechange", function () {
      if (installing.state === "installed" && navigator.serviceWorker.controller) showIfWaiting();
    });
  });

  window.addEventListener("online", function () {
    registration.update().catch(function () {});
  });
  window.setInterval(function () {
    if (navigator.onLine) registration.update().catch(function () {});
  }, 60 * 60 * 1000);
}

export async function initializeUpdates(options) {
  const onAvailable = options && options.onAvailable;
  const bridge = window.Capacitor;
  const platform = bridge && typeof bridge.getPlatform === "function" ? bridge.getPlatform() : "web";
  if (bridge && typeof bridge.isNativePlatform === "function" && bridge.isNativePlatform()) {
    if (platform !== "android") return;
    try {
      nativeUpdateManager = await import("./native-updates.js");
      await nativeUpdateManager.initializeNativeUpdates(onAvailable);
    } catch (error) {
      // A native update check is optional; bundled hymns continue to work offline.
    }
    return;
  }

  if (!("serviceWorker" in navigator) || !window.isSecureContext) return;
  try {
    const registration = await navigator.serviceWorker.register(new URL("./service-worker.js", document.baseURI));
    watchServiceWorker(registration, onAvailable);
  } catch (error) {
    // Offline reading still works from the browser cache if a prior worker was installed.
  }
}

export async function applyAvailableUpdate(onProgress) {
  if (availableUpdate && availableUpdate.kind === "web") {
    if (!serviceWorkerRegistration || !serviceWorkerRegistration.waiting) {
      throw new Error("The web update is no longer waiting. Reload the app to check again.");
    }
    if (!hasScheduledReload) {
      hasScheduledReload = true;
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        window.location.reload();
      }, { once: true });
    }
    serviceWorkerRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
    return { reload: true };
  }
  if (nativeUpdateManager) return nativeUpdateManager.applyNativeUpdate(onProgress);
  throw new Error("There is no update ready to install.");
}
