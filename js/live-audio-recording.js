const RECORDING_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/ogg;codecs=opus",
  "audio/mp4",
  "audio/webm",
  "audio/ogg"
];

function chooseMimeType(Recorder) {
  if (typeof Recorder.isTypeSupported !== "function") return "";
  return RECORDING_MIME_TYPES.find(type => {
    try {
      return Recorder.isTypeSupported(type);
    } catch (error) {
      return false;
    }
  }) || "";
}

function normalizeMimeType(value) {
  const mimeType = String(value || "audio/webm").split(";")[0].trim().toLowerCase();
  if (mimeType === "audio/ogg") return { contentType: mimeType, extension: "ogg" };
  if (mimeType === "audio/mp4") return { contentType: mimeType, extension: "m4a" };
  if (mimeType === "audio/webm") return { contentType: mimeType, extension: "webm" };
  throw new Error("This browser chose an unsupported audio recording format.");
}

export function startLiveAudioRecording(stream, Recorder = globalThis.MediaRecorder) {
  if (typeof Recorder !== "function") {
    throw new Error("This browser cannot record the broadcast. Use a browser with audio recording support.");
  }
  if (!stream || typeof stream.getAudioTracks !== "function" || !stream.getAudioTracks().length) {
    throw new Error("The microphone audio is not available for recording.");
  }

  const mimeType = chooseMimeType(Recorder);
  const options = { audioBitsPerSecond: 64000 };
  if (mimeType) options.mimeType = mimeType;
  const recorder = new Recorder(stream, options);
  const chunks = [];
  const startedAt = Date.now();
  let resolveStopped;
  const stopped = new Promise(resolve => { resolveStopped = resolve; });

  recorder.addEventListener("dataavailable", event => {
    if (event.data && event.data.size > 0) chunks.push(event.data);
  });
  recorder.addEventListener("stop", resolveStopped, { once: true });
  recorder.start(10000);

  let stopPromise = null;
  return {
    async stop() {
      if (!stopPromise) {
        stopPromise = (async () => {
          if (recorder.state !== "inactive") recorder.stop();
          await stopped;
          const format = normalizeMimeType(recorder.mimeType || mimeType);
          const blob = new Blob(chunks, { type: format.contentType });
          if (!blob.size) throw new Error("The broadcast ended without any audio to save.");
          return {
            blob,
            contentType: format.contentType,
            extension: format.extension,
            durationSeconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000))
          };
        })();
      }
      return stopPromise;
    }
  };
}
