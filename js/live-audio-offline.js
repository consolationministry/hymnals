const CACHE_NAME = "cerc-hymnal-offline-recordings-v1";
const STORAGE_KEY = "cerc-hymnal-offline-recordings-v1";

function getStorage() {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch (error) {
    return null;
  }
}

function getCacheStorage() {
  return typeof caches !== "undefined" ? caches : null;
}

function cleanMetadata(program) {
  const id = String(program && program.id || "").trim();
  const title = String(program && program.title || "").trim().slice(0, 120);
  if (!id || !title) return null;
  const savedAt = String(program.savedAt || "").trim() || new Date().toISOString();
  return {
    id,
    title,
    description: String(program.description || "").trim().slice(0, 2000),
    speaker: String(program.speaker || "").trim().slice(0, 100),
    category: String(program.category || "Other").trim().slice(0, 48) || "Other",
    venue: String(program.venue || "").trim().slice(0, 140),
    date: String(program.date || "").trim().slice(0, 32),
    status: "published",
    onAir: false,
    liveSessionId: "",
    recordingPath: String(program.recordingPath || "").trim(),
    recordingDurationSeconds: Math.max(0, Number(program.recordingDurationSeconds) || 0),
    recordingUrl: "",
    imageUrl: "",
    savedOffline: true,
    savedAt
  };
}

function offlineCacheRequest(programId) {
  const url = new URL("https://offline-audio.consolation-hymnal.invalid/recordings/" + encodeURIComponent(String(programId)));
  return typeof Request === "function" ? new Request(url.href) : url.href;
}

function readSavedPrograms(storage) {
  if (!storage) return [];
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.map(cleanMetadata).filter(Boolean);
  } catch (error) {
    return [];
  }
}

function writeSavedPrograms(storage, programs) {
  if (!storage) throw new Error("Device storage is unavailable. This recording could not be saved.");
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(programs));
  } catch (error) {
    throw new Error("Device storage is full or unavailable. Free up space and try again.");
  }
}

export function getSavedLiveAudioPrograms(options) {
  const storage = options && options.storage ? options.storage : getStorage();
  return readSavedPrograms(storage).sort(function (left, right) {
    return String(right.savedAt || "").localeCompare(String(left.savedAt || ""));
  });
}

export function isLiveAudioRecordingSaved(programId, options) {
  return getSavedLiveAudioPrograms(options).some(function (program) {
    return program.id === String(programId || "");
  });
}

export async function saveLiveAudioRecordingOffline(program, options) {
  const opts = options || {};
  const metadata = cleanMetadata(program);
  if (!metadata || !program.recordingPath) {
    throw new Error("This programme does not have a published recording to save yet.");
  }

  let recordingUrl;
  try {
    recordingUrl = new URL(String(program.recordingUrl || ""));
  } catch (error) {
    throw new Error("The recording is not ready to download. Refresh the programme and try again.");
  }
  if (recordingUrl.protocol !== "https:") {
    throw new Error("Only secure recording links can be saved.");
  }

  const cacheStorage = opts.cacheStorage || getCacheStorage();
  const fetcher = opts.fetcher || globalThis.fetch;
  const storage = opts.storage || getStorage();
  if (!cacheStorage || typeof cacheStorage.open !== "function" || typeof fetcher !== "function") {
    throw new Error("Offline audio saving is not supported by this browser.");
  }

  const request = offlineCacheRequest(metadata.id);
  const cache = await cacheStorage.open(CACHE_NAME);
  try {
    const response = await fetcher(recordingUrl.href, { mode: "cors" });
    if (!response || !response.ok) {
      throw new Error("The recording could not be downloaded. Check your connection and try again.");
    }
    const blob = await response.blob();
    if (!blob || !blob.size) throw new Error("The recording file is empty and could not be saved.");

    const storedResponse = new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": blob.type || response.headers && response.headers.get("content-type") || "application/octet-stream",
        "Content-Length": String(blob.size)
      }
    });
    await cache.put(request, storedResponse);

    const savedPrograms = readSavedPrograms(storage).filter(function (saved) {
      return saved.id !== metadata.id;
    });
    savedPrograms.push(metadata);
    try {
      writeSavedPrograms(storage, savedPrograms);
    } catch (error) {
      await cache.delete(request);
      throw error;
    }

    const storageManager = typeof navigator !== "undefined" && navigator.storage;
    if (storageManager && typeof storageManager.persist === "function") {
      try {
        void Promise.resolve(storageManager.persist()).catch(function () {});
      } catch (error) {
        // Keep the saved recording even if the browser cannot request persistent storage.
      }
    }
    return metadata;
  } catch (error) {
    if (error instanceof TypeError || error.name === "QuotaExceededError") {
      throw new Error("The recording could not be saved. Check your connection and device storage, then try again.");
    }
    throw error;
  }
}

export async function removeSavedLiveAudioProgram(programId, options) {
  const opts = options || {};
  const id = String(programId || "");
  const cacheStorage = opts.cacheStorage || getCacheStorage();
  const storage = opts.storage || getStorage();
  if (!id) return getSavedLiveAudioPrograms({ storage });

  if (cacheStorage && typeof cacheStorage.open === "function") {
    const cache = await cacheStorage.open(CACHE_NAME);
    await cache.delete(offlineCacheRequest(id));
  }
  const savedPrograms = readSavedPrograms(storage).filter(function (program) {
    return program.id !== id;
  });
  writeSavedPrograms(storage, savedPrograms);
  return getSavedLiveAudioPrograms({ storage });
}

export async function createSavedLiveAudioPlaybackUrl(programId, options) {
  const opts = options || {};
  const cacheStorage = opts.cacheStorage || getCacheStorage();
  const createObjectUrl = opts.createObjectUrl ||
    (typeof URL !== "undefined" && typeof URL.createObjectURL === "function"
      ? URL.createObjectURL.bind(URL)
      : null);
  if (!cacheStorage || typeof cacheStorage.open !== "function" || !createObjectUrl) return "";
  const cache = await cacheStorage.open(CACHE_NAME);
  const response = await cache.match(offlineCacheRequest(programId));
  if (!response) return "";
  const blob = await response.blob();
  if (!blob || !blob.size) return "";
  return createObjectUrl(blob);
}
