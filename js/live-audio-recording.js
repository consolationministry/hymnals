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

export function startLiveAudioRecording(stream, Recorder = globalThis.MediaRecorder, options) {
  const opts = options || {};
  if (typeof Recorder !== "function") {
    throw new Error("This browser cannot record the broadcast. Use a browser with audio recording support.");
  }
  if (!stream || typeof stream.getAudioTracks !== "function" || !stream.getAudioTracks().length) {
    throw new Error("The microphone audio is not available for recording.");
  }

  const mimeType = chooseMimeType(Recorder);
  const recorderOptions = { audioBitsPerSecond: 64000 };
  if (mimeType) recorderOptions.mimeType = mimeType;
  const recorder = new Recorder(stream, recorderOptions);
  const chunks = [];
  const startedAt = Date.now();
  const onSegment = typeof opts.onSegment === "function" ? opts.onSegment : null;
  const segmentDurationMs = Math.max(1, Number(opts.segmentDurationMs) || 15000);
  let segmentState = null;
  let segmentIndex = 0;
  let segmentTimer = null;
  let segmentRotation = null;
  let segmentsClosed = false;
  const segmentUploads = [];
  const segmentErrors = [];
  let resolveStopped;
  let recorderStoppedAt = null;
  const stopped = new Promise(resolve => { resolveStopped = resolve; });

  recorder.addEventListener("dataavailable", event => {
    if (event.data && event.data.size > 0) chunks.push(event.data);
  });
  recorder.addEventListener("stop", () => {
    recorderStoppedAt = Date.now();
    resolveStopped();
  }, { once: true });
  recorder.start();

  function createSegmentRecorder() {
    const segmentRecorder = new Recorder(stream, recorderOptions);
    const segmentChunks = [];
    let resolveSegmentStopped;
    const segmentStopped = new Promise(resolve => { resolveSegmentStopped = resolve; });
    const segmentStartedAt = Date.now();
    segmentRecorder.addEventListener("dataavailable", event => {
      if (event.data && event.data.size > 0) segmentChunks.push(event.data);
    });
    segmentRecorder.addEventListener("stop", resolveSegmentStopped, { once: true });
    segmentRecorder.start();
    return { recorder: segmentRecorder, chunks: segmentChunks, startedAt: segmentStartedAt, stopped: segmentStopped };
  }

  function queueSegmentUpload(segment) {
    if (!segment || !onSegment) return;
    const upload = Promise.resolve().then(() => onSegment(segment)).catch(error => {
      segmentErrors.push(error && error.message ? error.message : "A live rewind segment could not be uploaded.");
      if (typeof opts.onSegmentError === "function") opts.onSegmentError(error, segment);
    });
    segmentUploads.push(upload);
  }

  function scheduleSegmentRotation() {
    if (!onSegment || segmentsClosed) return;
    segmentTimer = globalThis.setTimeout(() => {
      segmentTimer = null;
      void rotateSegment();
    }, segmentDurationMs);
  }

  function startNextSegment() {
    if (!onSegment || segmentsClosed) return;
    try {
      segmentState = createSegmentRecorder();
      scheduleSegmentRotation();
    } catch (error) {
      segmentsClosed = true;
      segmentErrors.push(error && error.message ? error.message : "Live rewind recording could not be started.");
      if (typeof opts.onSegmentError === "function") opts.onSegmentError(error);
    }
  }

  async function finishSegment(current) {
    if (!current) return;
    if (current.recorder.state !== "inactive") current.recorder.stop();
    await current.stopped;
    const format = normalizeMimeType(current.recorder.mimeType || mimeType);
    const blob = new Blob(current.chunks, { type: format.contentType });
    if (!blob.size) return;
    queueSegmentUpload({
      blob,
      contentType: format.contentType,
      extension: format.extension,
      index: segmentIndex++,
      startedAt: new Date(current.startedAt).toISOString(),
      durationSeconds: Math.max(0.1, (Date.now() - current.startedAt) / 1000)
    });
  }

  async function rotateSegment() {
    if (segmentRotation) return segmentRotation;
    segmentRotation = (async () => {
      const current = segmentState;
      if (!current) return;
      segmentState = null;
      try {
        await finishSegment(current);
      } catch (error) {
        segmentErrors.push(error && error.message ? error.message : "A live rewind segment could not be recorded.");
        if (typeof opts.onSegmentError === "function") opts.onSegmentError(error);
      }
      startNextSegment();
    })().finally(() => { segmentRotation = null; });
    return segmentRotation;
  }

  if (onSegment) startNextSegment();

  let stopPromise = null;
  return {
    async stop() {
      if (!stopPromise) {
        stopPromise = (async () => {
          segmentsClosed = true;
          if (segmentTimer !== null) globalThis.clearTimeout(segmentTimer);
          segmentTimer = null;
          if (segmentRotation) await segmentRotation;
          if (segmentState) {
            const current = segmentState;
            segmentState = null;
            try {
              await finishSegment(current);
            } catch (error) {
              segmentErrors.push(error && error.message ? error.message : "The final live rewind segment could not be recorded.");
            }
          }
          if (recorder.state !== "inactive") recorder.stop();
          await stopped;
          await Promise.all(segmentUploads);
          const format = normalizeMimeType(recorder.mimeType || mimeType);
          const blob = new Blob(chunks, { type: format.contentType });
          if (!blob.size) throw new Error("The broadcast ended without any audio to save.");
          const completedAt = recorderStoppedAt === null ? Date.now() : recorderStoppedAt;
          return {
            blob,
            contentType: format.contentType,
            extension: format.extension,
            durationSeconds: Math.max(1, Math.round((completedAt - startedAt) / 1000)),
            segmentCount: segmentIndex,
            segmentErrors: segmentErrors.slice()
          };
        })();
      }
      return stopPromise;
    }
  };
}
