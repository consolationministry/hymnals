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
    handlersAttached: false,
    preparing: null
  };
  audioPlayerControllers.set(audio, controller);
  return controller;
}

function updatePlayerControls(audio, controller) {
  const root = controller.root;
  if (!root || !root.isConnected) return;

  const playerType = audio.dataset.audioPlayer;
  const isLive = playerType === "live";
  const duration = Number(audio.duration);
  const hasDuration = !isLive && Number.isFinite(duration) && duration > 0;
  const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
  const ratio = hasDuration ? Math.max(0, Math.min(1, currentTime / duration)) : 0;
  const playButton = root.querySelector('[data-action="toggle-audio-playback"]');
  const playIcon = playButton && playButton.querySelector("[data-audio-control-icon]");
  const muteButton = root.querySelector('[data-action="toggle-audio-mute"]');
  const muteIcon = muteButton && muteButton.querySelector("[data-audio-control-icon]");
  const seek = root.querySelector("[data-audio-seek]");
  const volume = root.querySelector("[data-audio-volume]");
  const currentOutput = root.querySelector("[data-audio-current-time]");
  const durationOutput = root.querySelector("[data-audio-duration]");
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
    seek.value = String(Math.round(ratio * 1000));
    seek.setAttribute("aria-valuetext", formatAudioTime(currentTime) + " of " + (hasDuration ? formatAudioTime(duration) : "unknown duration"));
  }
  if (volume) volume.value = String(Math.round((audio.muted ? 0 : audio.volume) * 100));
  if (currentOutput) currentOutput.textContent = formatAudioTime(currentTime);
  if (durationOutput) durationOutput.textContent = hasDuration ? formatAudioTime(duration) : "--:--";

  root.style.setProperty("--audio-progress", (ratio * 100) + "%");
  bars.forEach((bar, index) => {
    bar.classList.toggle("is-played", !isLive && hasDuration && index / bars.length < ratio);
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

function attachAudioEvents(audio, controller) {
  if (controller.handlersAttached) return;
  controller.handlersAttached = true;

  ["loadedmetadata", "durationchange", "timeupdate", "seeking", "seeked", "volumechange", "ended"].forEach(eventName => {
    audio.addEventListener(eventName, () => updatePlayerControls(audio, controller));
  });
  audio.addEventListener("play", () => {
    updatePlayerControls(audio, controller);
    if (controller.analyser) animateWaveform(audio, controller);
  });
  audio.addEventListener("pause", () => {
    stopWaveformAnimation(controller);
    updatePlayerControls(audio, controller);
  });
  audio.addEventListener("error", () => {
    const status = controller.root && controller.root.querySelector("[data-audio-player-status]");
    if (status) status.textContent = "This recording could not be loaded. Check your connection and try again.";
  });
}

export function mountAudioPlayer(audio, root) {
  if (!audio || !root) return;
  const controller = getController(audio);
  controller.root = root;
  attachAudioEvents(audio, controller);
  updatePlayerControls(audio, controller);
  if (controller.analyser && !audio.paused) animateWaveform(audio, controller);
}

export async function prepareAudioPlayer(audio) {
  if (!audio) return false;
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
  const duration = Number(audio.duration);
  if (!Number.isFinite(duration) || duration <= 0) return;
  const position = Math.max(0, Math.min(1000, Number(value) || 0));
  audio.currentTime = duration * position / 1000;
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
  const context = controller.context;
  controller.context = null;
  controller.analyser = null;
  controller.source = null;
  controller.samples = null;
  controller.preparing = null;
  if (context && context.state !== "closed") void context.close().catch(() => {});
}
