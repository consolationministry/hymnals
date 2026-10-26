const audioPlayerControllers = new WeakMap();

export function formatAudioTime(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const wholeSeconds = Math.floor(seconds);
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const remainder = wholeSeconds % 60;
  return hours
    ? hours + ":" + String(minutes).padStart(2, "0") + ":" + String(remainder).padStart(2, "0")
    : minutes + ":" + String(remainder).padStart(2, "0");
}

export function preserveRecordedAudioPlayer(currentAudio, nextRoot) {
  if (!currentAudio || !nextRoot || currentAudio.dataset?.audioPlayer !== "recorded" ||
      typeof nextRoot.querySelector !== "function") return false;
  const nextAudio = nextRoot.querySelector("[data-recorded-audio-player]");
  if (!nextAudio || nextAudio.dataset?.audioPlayer !== "recorded" ||
      typeof currentAudio.getAttribute !== "function" ||
      typeof nextAudio.getAttribute !== "function" ||
      typeof nextAudio.replaceWith !== "function") return false;
  const currentSource = currentAudio.getAttribute("src");
  if (!currentSource || currentSource !== nextAudio.getAttribute("src")) return false;
  nextAudio.replaceWith(currentAudio);
  return true;
}

export function getAudioPlayerDuration(audio) {
  const mediaDuration = Number(audio && audio.duration);
  if (Number.isFinite(mediaDuration) && mediaDuration > 0) return mediaDuration;
  const recordingDuration = Number(audio && audio.dataset && audio.dataset.recordingDurationSeconds);
  return Number.isFinite(recordingDuration) && recordingDuration > 0
    ? recordingDuration
    : mediaDuration;
}

export function getRecordedAudioTimeState(audio) {
  const duration = getAudioPlayerDuration(audio);
  const hasDuration = Number.isFinite(duration) && duration > 0;
  const currentTime = audio && audio.ended && hasDuration
    ? duration
    : Number.isFinite(Number(audio && audio.currentTime))
      ? Number(audio.currentTime)
      : 0;
  return {
    duration,
    hasDuration,
    currentTime,
    progress: hasDuration ? Math.max(0, Math.min(1, currentTime / duration)) : 0
  };
}

export function getAudioWaveformPosition(clientX, left, width) {
  const x = Number(clientX);
  const start = Number(left);
  const span = Number(width);
  if (![x, start, span].every(Number.isFinite) || span <= 0) return 0;
  return Math.round(Math.max(0, Math.min(1, (x - start) / span)) * 1000);
}

export function getLiveAudioSeekTarget(segments, value) {
  const available = (Array.isArray(segments) ? segments : []).filter(segment =>
    segment && Number.isFinite(Number(segment.durationSeconds)) &&
    Number(segment.durationSeconds) > 0 && String(segment.url || "")
  );
  const totalDuration = available.reduce((sum, segment) => sum + Number(segment.durationSeconds), 0);
  if (!available.length || !Number.isFinite(totalDuration) || totalDuration <= 0) return null;

  const position = Math.max(0, Math.min(1000, Number(value) || 0));
  const targetTime = totalDuration * position / 1000;
  let elapsed = 0;
  for (let index = 0; index < available.length; index += 1) {
    const duration = Number(available[index].durationSeconds);
    if (targetTime < elapsed + duration || index === available.length - 1) {
      return {
        index,
        offsetSeconds: Math.max(0, Math.min(duration, targetTime - elapsed)),
        totalDuration,
        targetTime
      };
    }
    elapsed += duration;
  }
  return null;
}

export function getLiveAudioTimelinePosition(segments, segmentIndex, currentTime) {
  const available = Array.isArray(segments) ? segments : [];
  if (!available.length) return 0;
  const index = Math.max(0, Math.min(available.length - 1, Math.floor(Number(segmentIndex) || 0)));
  const elapsed = available.slice(0, index).reduce((sum, segment) =>
    sum + Math.max(0, Number(segment && segment.durationSeconds) || 0), 0);
  const duration = Number(available[index] && available[index].durationSeconds) || 0;
  return elapsed + Math.max(0, Math.min(duration, Number(currentTime) || 0));
}

export function getAudioWaveformHeights(samples, barCount = 40) {
  const count = Math.max(1, Math.floor(Number(barCount) || 40));
  const length = samples && Number(samples.length) || 0;
  if (!length) return Array.from({ length: count }, () => 5);

  return Array.from({ length: count }, (_, barIndex) => {
    const start = Math.floor(barIndex * length / count);
    const end = Math.max(start + 1, Math.floor((barIndex + 1) * length / count));
    let peak = 0;
    for (let index = start; index < Math.min(end, length); index += 1) {
      const sample = Number(samples[index]);
      const amplitude = samples instanceof Uint8Array
        ? Math.abs(sample - 128) / 128
        : Math.abs(sample);
      peak = Math.max(peak, amplitude);
    }
    return Math.max(5, Math.min(100, Math.round(peak * 100)));
  });
}

function getController(audio) {
  let controller = audioPlayerControllers.get(audio);
  if (controller) return controller;

  controller = {
    root: null,
    context: null,
    analyser: null,
    source: null,
    samples: null,
    frame: 0,
    waveformElement: null,
    handlersAttached: false,
    preparing: null,
    liveSegments: [],
    liveStream: null,
    livePlayback: false,
    currentSegmentIndex: -1,
    waitingForLiveSegment: false,
    archiveAutoplay: false,
    segmentLoadToken: 0,
    timelineElement: null,
    liveSeekPreview: null
  };
  audioPlayerControllers.set(audio, controller);
  return controller;
}

function updatePlayerControls(audio, controller) {
  const root = controller.root;
  if (!root || !root.isConnected) return;

  const playerType = audio.dataset.audioPlayer;
  const isLive = playerType === "live";
  const liveDuration = isLive
    ? controller.liveSegments.reduce((sum, segment) => sum + Math.max(0, Number(segment.durationSeconds) || 0), 0)
    : 0;
  const isLiveArchive = isLive && controller.livePlayback;
  const recordedTime = isLive ? null : getRecordedAudioTimeState(audio);
  const duration = isLive ? Number(audio.duration) : recordedTime.duration;
  const hasDuration = isLive
    ? Number.isFinite(liveDuration) && liveDuration > 0
    : recordedTime.hasDuration;
  const displayDuration = isLive ? liveDuration : duration;
  const currentTime = isLive
    ? isLiveArchive
      ? getLiveAudioTimelinePosition(controller.liveSegments, controller.currentSegmentIndex, audio.currentTime)
      : liveDuration
    : recordedTime.currentTime;
  const ratio = hasDuration ? Math.max(0, Math.min(1, currentTime / displayDuration)) : 0;
  const playButton = root.querySelector('[data-action="toggle-audio-playback"]');
  const playIcon = playButton && playButton.querySelector("[data-audio-control-icon]");
  const muteButton = root.querySelector('[data-action="toggle-audio-mute"]');
  const muteIcon = muteButton && muteButton.querySelector("[data-audio-control-icon]");
  const seek = root.querySelector("[data-audio-seek]");
  const volume = root.querySelector("[data-audio-volume]");
  const currentOutput = root.querySelector("[data-audio-current-time]");
  const durationOutput = root.querySelector("[data-audio-duration]");
  const waveform = root.querySelector("[data-audio-waveform-seek]");
  const returnLive = root.querySelector('[data-action="return-to-live-audio"]');
  const bars = root.querySelectorAll("[data-audio-waveform] span");

  if (playButton) {
    const playing = !audio.paused && !audio.ended;
    playButton.setAttribute("aria-label", (playing ? "Pause " : "Play ") + (isLive ? "live audio" : "recording"));
    if (playIcon) playIcon.textContent = playing ? "Ⅱ" : "▶";
    playButton.classList.toggle("is-playing", playing);
  }
  if (muteButton) {
    const muted = audio.muted || audio.volume === 0;
    muteButton.setAttribute("aria-label", muted ? "Unmute audio" : "Mute audio");
    if (muteIcon) muteIcon.textContent = muted ? "◖×" : "◖))";
  }
  if (seek) {
    seek.disabled = !hasDuration;
    const displayPosition = isLive && controller.liveSeekPreview !== null
      ? Math.max(0, Math.min(1000, Number(controller.liveSeekPreview) || 0))
      : Math.round(ratio * 1000);
    seek.value = String(displayPosition);
    seek.setAttribute("aria-valuetext", formatAudioTime(currentTime) + " of " + (hasDuration ? formatAudioTime(displayDuration) : "unknown duration"));
  }
  if (waveform) {
    waveform.setAttribute("role", "slider");
    waveform.setAttribute("aria-label", isLive ? "Seek through live broadcast audio" : "Seek through recording waveform");
    waveform.setAttribute("aria-valuemin", "0");
    waveform.setAttribute("aria-valuemax", "1000");
    waveform.setAttribute("aria-valuenow", String(Math.round(ratio * 1000)));
    waveform.setAttribute("aria-valuetext", formatAudioTime(currentTime) + " of " +
      (hasDuration ? formatAudioTime(displayDuration) : "unknown duration") +
      (isLive && !isLiveArchive && hasDuration ? " · live" : ""));
    waveform.setAttribute("aria-disabled", String(!hasDuration));
    waveform.tabIndex = hasDuration ? 0 : -1;
    waveform.style.cursor = hasDuration ? "pointer" : "default";
    waveform.style.touchAction = "none";
    waveform.classList.toggle("is-disabled", !hasDuration);
  }
  if (volume) volume.value = String(Math.round((audio.muted ? 0 : audio.volume) * 100));
  if (currentOutput) currentOutput.textContent = formatAudioTime(currentTime);
  if (durationOutput) durationOutput.textContent = hasDuration ? formatAudioTime(displayDuration) : "--:--";
  if (returnLive) returnLive.hidden = !isLiveArchive;

  root.style.setProperty("--audio-progress", (ratio * 100) + "%");
  bars.forEach((bar, index) => {
    bar.classList.toggle("is-played", hasDuration && index / bars.length < ratio);
  });
}

function drawWaveform(audio, controller) {
  if (!controller.analyser || !controller.samples) return;
  const root = controller.root;
  if (!root || !root.isConnected) return;

  controller.analyser.getByteTimeDomainData(controller.samples);
  const bars = root.querySelectorAll("[data-audio-waveform] span");
  const heights = getAudioWaveformHeights(controller.samples, bars.length);
  bars.forEach((bar, index) => {
    bar.style.height = heights[index] + "%";
    if (audio.dataset.audioPlayer === "live") {
      bar.classList.toggle("is-active", heights[index] > 8);
    }
  });
  updatePlayerControls(audio, controller);
}

function stopWaveformAnimation(controller) {
  if (controller.frame) {
    window.cancelAnimationFrame(controller.frame);
    controller.frame = 0;
  }
}

function animateWaveform(audio, controller) {
  stopWaveformAnimation(controller);
  const draw = () => {
    drawWaveform(audio, controller);
    if (!audio.paused && !audio.ended && controller.analyser) {
      controller.frame = window.requestAnimationFrame(draw);
    } else {
      controller.frame = 0;
    }
  };
  controller.frame = window.requestAnimationFrame(draw);
}

function loadLiveAudioSegment(audio, controller, index, offsetSeconds, shouldPlay) {
  const segment = controller.liveSegments[index];
  if (!segment || !segment.url) return;
  if (audio.srcObject) controller.liveStream = audio.srcObject;
  controller.livePlayback = true;
  controller.currentSegmentIndex = index;
  controller.waitingForLiveSegment = false;
  const loadToken = ++controller.segmentLoadToken;
  audio.pause();
  audio.srcObject = null;
  audio.src = segment.url;
  audio.load();

  const setPosition = () => {
    if (loadToken !== controller.segmentLoadToken) return;
    const duration = Number(audio.duration);
    const target = Math.max(0, Number(offsetSeconds) || 0);
    audio.currentTime = Number.isFinite(duration) && duration > 0
      ? Math.min(target, Math.max(0, duration - 0.01))
      : target;
    updatePlayerControls(audio, controller);
    if (shouldPlay) void audio.play().catch(() => {});
  };
  if (audio.readyState >= 1) setPosition();
  else audio.addEventListener("loadedmetadata", setPosition, { once: true });
  updatePlayerControls(audio, controller);
}

export function setLiveAudioStream(audio, stream) {
  if (!audio || !stream) return false;
  const controller = getController(audio);
  controller.liveStream = stream;
  if (controller.livePlayback) {
    if (audio.srcObject === stream) audio.srcObject = null;
    return false;
  }
  audio.srcObject = stream;
  return true;
}

export function isWaitingForLiveAudioSegment(audio) {
  const controller = audio && audioPlayerControllers.get(audio);
  return Boolean(controller && controller.livePlayback &&
    controller.waitingForLiveSegment && controller.archiveAutoplay);
}

export function getNextLiveAudioSegmentIndex(audio) {
  const controller = audio && audioPlayerControllers.get(audio);
  if (!controller || !isWaitingForLiveAudioSegment(audio)) return null;
  const current = controller.liveSegments[controller.currentSegmentIndex];
  const currentIndex = Number(current && current.index);
  return Number.isInteger(currentIndex) && currentIndex >= 0 ? currentIndex + 1 : null;
}

function advanceLiveAudioSegment(audio, controller) {
  if (!controller.livePlayback || !controller.archiveAutoplay) return;
  const nextIndex = controller.currentSegmentIndex + 1;
  if (nextIndex < controller.liveSegments.length) {
    loadLiveAudioSegment(audio, controller, nextIndex, 0, true);
    return;
  }
  const attachedStream = audio.srcObject;
  const hasActiveLiveStream = stream => Boolean(stream && stream.active !== false);
  if (hasActiveLiveStream(attachedStream) || hasActiveLiveStream(controller.liveStream)) {
    returnToLiveAudio(audio);
    return;
  }
  controller.waitingForLiveSegment = true;
  updatePlayerControls(audio, controller);
}

function readLiveAudioSegments(audio) {
  try {
    const segments = JSON.parse(audio.dataset.liveAudioSegments || "[]");
    if (!Array.isArray(segments)) return [];
    return segments.filter(segment =>
      segment && Number.isInteger(Number(segment.index)) &&
      Number.isFinite(Number(segment.durationSeconds)) &&
      Number(segment.durationSeconds) > 0 && typeof segment.url === "string" && segment.url
    ).sort((left, right) => Number(left.index) - Number(right.index));
  } catch (error) {
    return [];
  }
}

function updateLiveAudioSegments(audio, controller) {
  controller.liveSegments = readLiveAudioSegments(audio);
  if (controller.livePlayback && controller.waitingForLiveSegment &&
      controller.archiveAutoplay &&
      controller.currentSegmentIndex + 1 < controller.liveSegments.length) {
    loadLiveAudioSegment(audio, controller, controller.currentSegmentIndex + 1, 0, true);
  }
}

function attachLiveTimelineSeek(audio, controller) {
  const seek = controller.root && controller.root.querySelector('[data-audio-seek="live"]');
  if (!seek || controller.timelineElement === seek) return;
  controller.timelineElement = seek;
  seek.addEventListener("input", () => {
    controller.liveSeekPreview = Number(seek.value);
    updatePlayerControls(audio, controller);
  });
  seek.addEventListener("change", () => {
    const position = seek.value;
    controller.liveSeekPreview = null;
    seekAudioPlayer(audio, position);
    updatePlayerControls(audio, controller);
  });
}

function attachAudioEvents(audio, controller) {
  if (controller.handlersAttached) return;
  controller.handlersAttached = true;

  ["loadedmetadata", "durationchange", "timeupdate", "seeking", "seeked", "volumechange"].forEach(eventName => {
    audio.addEventListener(eventName, () => updatePlayerControls(audio, controller));
  });
  audio.addEventListener("ended", () => {
    updatePlayerControls(audio, controller);
    advanceLiveAudioSegment(audio, controller);
  });
  audio.addEventListener("play", () => {
    if (controller.livePlayback) controller.archiveAutoplay = true;
    updatePlayerControls(audio, controller);
    if (controller.analyser) animateWaveform(audio, controller);
  });
  audio.addEventListener("pause", () => {
    if (controller.livePlayback && !audio.ended) controller.archiveAutoplay = false;
    stopWaveformAnimation(controller);
    updatePlayerControls(audio, controller);
  });
  audio.addEventListener("error", () => {
    const status = controller.root && controller.root.querySelector("[data-audio-player-status]");
    if (status) status.textContent = "This recording could not be loaded. Check your connection and try again.";
  });
}

function attachWaveformSeek(audio, controller) {
  const waveform = controller.root && controller.root.querySelector("[data-audio-waveform-seek]");
  if (!waveform || controller.waveformElement === waveform) return;
  controller.waveformElement = waveform;
  let activePointerId = null;

  const seekFromPointer = event => {
    const bounds = waveform.getBoundingClientRect();
    seekAudioPlayer(audio, getAudioWaveformPosition(event.clientX, bounds.left, bounds.width));
  };
  waveform.addEventListener("pointerdown", event => {
    if (event.button !== undefined && event.button !== 0) return;
    const canSeek = audio.dataset.audioPlayer === "live"
      ? controller.liveSegments.length > 0
      : getRecordedAudioTimeState(audio).hasDuration;
    if (!canSeek) return;
    activePointerId = event.pointerId;
    if (typeof waveform.setPointerCapture === "function" && event.pointerId !== undefined) {
      try { waveform.setPointerCapture(event.pointerId); } catch (error) {}
    }
    event.preventDefault();
  });
  waveform.addEventListener("pointermove", event => {
    if (activePointerId === null || event.pointerId !== activePointerId) return;
    event.preventDefault();
  });
  waveform.addEventListener("pointerup", event => {
    if (activePointerId !== event.pointerId) return;
    seekFromPointer(event);
    activePointerId = null;
  });
  ["pointercancel", "lostpointercapture"].forEach(eventName => {
    waveform.addEventListener(eventName, event => {
      if (activePointerId === event.pointerId) activePointerId = null;
    });
  });
  waveform.addEventListener("keydown", event => {
    const isLive = audio.dataset.audioPlayer === "live";
    const duration = isLive
      ? controller.liveSegments.reduce((sum, segment) => sum + Number(segment.durationSeconds), 0)
      : getAudioPlayerDuration(audio);
    if (!Number.isFinite(duration) || duration <= 0) return;
    const currentTime = isLive && !controller.livePlayback
      ? duration
      : isLive
        ? getLiveAudioTimelinePosition(controller.liveSegments, controller.currentSegmentIndex, audio.currentTime)
        : getRecordedAudioTimeState(audio).currentTime;
    const step = Math.max(1, duration * 0.01);
    let nextTime = currentTime;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") nextTime -= step;
    else if (event.key === "ArrowRight" || event.key === "ArrowUp") nextTime += step;
    else if (event.key === "PageDown") nextTime -= 10;
    else if (event.key === "PageUp") nextTime += 10;
    else if (event.key === "Home") nextTime = 0;
    else if (event.key === "End") nextTime = duration;
    else return;
    seekAudioPlayer(audio, Math.round(Math.max(0, Math.min(duration, nextTime)) / duration * 1000));
    event.preventDefault();
  });
}

export function mountAudioPlayer(audio, root) {
  if (!audio || !root) return;
  const controller = getController(audio);
  controller.root = root;
  updateLiveAudioSegments(audio, controller);
  attachAudioEvents(audio, controller);
  attachLiveTimelineSeek(audio, controller);
  attachWaveformSeek(audio, controller);
  updatePlayerControls(audio, controller);
  if (controller.analyser && !audio.paused) animateWaveform(audio, controller);
}

function usesNativeAndroidLiveAudio(audio) {
  if (!audio || !audio.dataset || audio.dataset.audioPlayer !== "live" ||
      typeof window === "undefined" || !window.Capacitor) return false;
  try {
    return typeof window.Capacitor.isNativePlatform === "function" &&
      window.Capacitor.isNativePlatform() &&
      typeof window.Capacitor.getPlatform === "function" &&
      window.Capacitor.getPlatform() === "android";
  } catch (error) {
    return false;
  }
}
export async function prepareAudioPlayer(audio) {
  if (!audio) return false;
  if (usesNativeAndroidLiveAudio(audio)) return false;
  const controller = getController(audio);
  if (!controller.preparing) {
    controller.preparing = (async () => {
      const AudioContextClass = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
      if (!AudioContextClass) return false;

      try {
        controller.context = new AudioContextClass();
        controller.analyser = controller.context.createAnalyser();
        controller.analyser.fftSize = 512;
        controller.analyser.smoothingTimeConstant = 0.48;
        controller.samples = new Uint8Array(controller.analyser.fftSize);
        controller.source = controller.context.createMediaElementSource(audio);
        controller.source.connect(controller.analyser);
        controller.analyser.connect(controller.context.destination);
        return true;
      } catch (error) {
        controller.analyser = null;
        controller.samples = null;
        return false;
      }
    })();
  }

  const available = await controller.preparing;
  if (controller.context && controller.context.state === "suspended") {
    try {
      await controller.context.resume();
    } catch (error) {
      return false;
    }
  }
  if (available && !audio.paused) animateWaveform(audio, controller);
  return available;
}

export async function toggleAudioPlayback(audio) {
  if (!audio) return;
  if (audio.paused || audio.ended) {
    await prepareAudioPlayer(audio);
    await audio.play();
  } else {
    audio.pause();
  }
}

export function toggleAudioMute(audio) {
  if (!audio) return;
  if (audio.muted || audio.volume === 0) {
    audio.muted = false;
    if (audio.volume === 0) audio.volume = 0.8;
  } else {
    audio.muted = true;
  }
  const controller = getController(audio);
  updatePlayerControls(audio, controller);
}

export function seekAudioPlayer(audio, value) {
  if (!audio) return;
  if (audio.dataset && audio.dataset.audioPlayer === "live") {
    const controller = getController(audio);
    const target = getLiveAudioSeekTarget(controller.liveSegments, value);
    if (!target) return;
    const shouldPlay = !audio.paused && !audio.ended;
    if (audio.srcObject) controller.liveStream = audio.srcObject;
    controller.archiveAutoplay = shouldPlay;
    loadLiveAudioSegment(audio, controller, target.index, target.offsetSeconds, shouldPlay);
    return;
  }
  const duration = getAudioPlayerDuration(audio);
  if (!Number.isFinite(duration) || duration <= 0) return;
  const position = Math.max(0, Math.min(1000, Number(value) || 0));
  audio.currentTime = duration * position / 1000;
}

export function returnToLiveAudio(audio) {
  if (!audio) return false;
  const controller = audioPlayerControllers.get(audio);
  if (!controller || !controller.livePlayback) return false;
  const attachedStream = audio.srcObject;
  const isActiveStream = stream => Boolean(stream && stream.active !== false);
  const stream = isActiveStream(attachedStream)
    ? attachedStream
    : isActiveStream(controller.liveStream)
      ? controller.liveStream
      : attachedStream || controller.liveStream;
  controller.segmentLoadToken += 1;
  controller.waitingForLiveSegment = false;
  controller.archiveAutoplay = false;
  controller.livePlayback = false;
  controller.currentSegmentIndex = -1;
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  if (stream) {
    controller.liveStream = stream;
    audio.srcObject = stream;
    const showTapToPlay = () => {
      const status = controller.root && controller.root.querySelector("[data-live-audio-status]");
      if (status) status.textContent = "Tap play on the audio player to hear the broadcast.";
    };
    try {
      const playback = audio.play();
      if (playback && typeof playback.catch === "function") {
        void playback.catch(showTapToPlay);
      }
    } catch (error) {
      showTapToPlay();
    }
  }
  updatePlayerControls(audio, controller);
  return Boolean(stream);
}

export function setAudioPlayerVolume(audio, value) {
  if (!audio) return;
  const volume = Math.max(0, Math.min(100, Number(value) || 0)) / 100;
  audio.volume = volume;
  audio.muted = volume === 0;
  const controller = getController(audio);
  updatePlayerControls(audio, controller);
}

export function stopAudioPlayer(audio) {
  if (!audio) return;
  const controller = audioPlayerControllers.get(audio);
  audio.pause();
  if (audio.srcObject) audio.srcObject = null;
  if (!controller) return;

  stopWaveformAnimation(controller);
  controller.segmentLoadToken += 1;
  if (controller.livePlayback) {
    audio.removeAttribute("src");
    audio.load();
  }
  const context = controller.context;
  controller.context = null;
  controller.analyser = null;
  controller.source = null;
  controller.samples = null;
  controller.preparing = null;
  controller.liveSegments = [];
  controller.liveStream = null;
  controller.livePlayback = false;
  controller.waitingForLiveSegment = false;
  controller.archiveAutoplay = false;
  controller.currentSegmentIndex = -1;
  controller.waveformElement = null;
  controller.timelineElement = null;
  controller.liveSeekPreview = null;
  if (context && context.state !== "closed") void context.close().catch(() => {});
}
