import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  formatAudioTime,
  mountAudioPlayer,
  preserveRecordedAudioPlayer,
  prepareAudioPlayer,
  getAudioPlayerDuration,
  getAudioWaveformHeights,
  getAudioWaveformPosition,
  getLiveAudioSeekTarget,
  getLiveAudioTimelinePosition,
  getRecordedAudioTimeState,
  getNextLiveAudioSegmentIndex,
  isWaitingForLiveAudioSegment,
  returnToLiveAudio,
  seekAudioPlayer,
  setLiveAudioStream
} from "../js/live-audio-player.js";

test("audio timestamps are formatted as minutes or hours", () => {
  assert.equal(formatAudioTime(0), "0:00");
  assert.equal(formatAudioTime(65.9), "1:05");
  assert.equal(formatAudioTime(3661), "1:01:01");
  assert.equal(formatAudioTime(Number.NaN), "0:00");
});

test("waveform heights reflect the audio samples in each bar", () => {
  assert.deepEqual(
    getAudioWaveformHeights(new Uint8Array([128, 255, 128, 128]), 2),
    [100, 8]
  );
  assert.deepEqual(getAudioWaveformHeights(new Uint8Array(), 3), [5, 5, 5]);
});

test("waveform pointer positions map to the full seek range", () => {
  assert.equal(getAudioWaveformPosition(50, 50, 200), 0);
  assert.equal(getAudioWaveformPosition(150, 50, 200), 500);
  assert.equal(getAudioWaveformPosition(300, 50, 200), 1000);
  assert.equal(getAudioWaveformPosition(400, 50, 200), 1000);
  assert.equal(getAudioWaveformPosition(150, 50, 0), 0);
});

test("live rewind positions map to the matching segment and timeline time", () => {
  const segments = [
    { url: "first", durationSeconds: 10 },
    { url: "second", durationSeconds: 20 }
  ];
  assert.deepEqual(getLiveAudioSeekTarget(segments, 0), {
    index: 0,
    offsetSeconds: 0,
    totalDuration: 30,
    targetTime: 0
  });
  assert.deepEqual(getLiveAudioSeekTarget(segments, 500), {
    index: 1,
    offsetSeconds: 5,
    totalDuration: 30,
    targetTime: 15
  });
  assert.equal(getLiveAudioTimelinePosition(segments, 1, 5), 15);
  assert.equal(getLiveAudioSeekTarget([], 500), null);
});

test("recording seek positions are clamped and synchronized to duration", () => {
  const audio = { duration: 80, currentTime: 0 };
  seekAudioPlayer(audio, 250);
  assert.equal(audio.currentTime, 20);
  seekAudioPlayer(audio, 1500);
  assert.equal(audio.currentTime, 80);
  seekAudioPlayer({ duration: Number.POSITIVE_INFINITY, currentTime: 4 }, 500);
});

test("recorded players use the saved duration when browser metadata is missing", () => {
  const audio = {
    duration: Number.POSITIVE_INFINITY,
    currentTime: 12,
    ended: false,
    dataset: { recordingDurationSeconds: "42" }
  };

  assert.equal(getAudioPlayerDuration(audio), 42);
  assert.deepEqual(getRecordedAudioTimeState(audio), {
    duration: 42,
    hasDuration: true,
    currentTime: 12,
    progress: 12 / 42
  });

  seekAudioPlayer(audio, 500);
  assert.equal(audio.currentTime, 21);

  audio.ended = true;
  assert.deepEqual(getRecordedAudioTimeState(audio), {
    duration: 42,
    hasDuration: true,
    currentTime: 42,
    progress: 1
  });
});

test("browser media duration takes precedence over the saved fallback", () => {
  assert.equal(getAudioPlayerDuration({
    duration: 40,
    dataset: { recordingDurationSeconds: "42" }
  }), 40);
});


function fakeRecordedAudio(src, currentTime = 0) {
  return {
    dataset: { audioPlayer: "recorded" },
    currentTime,
    getAttribute(name) { return name === "src" ? src : null; },
    replaceWith(replacement) { this.replacedWith = replacement; }
  };
}

test("same-source recorded audio element is reused across a Listen rerender", () => {
  const currentAudio = fakeRecordedAudio("https://audio.example.org/recording.webm", 27);
  const nextAudio = fakeRecordedAudio("https://audio.example.org/recording.webm");
  const nextRoot = {
    querySelector(selector) {
      assert.equal(selector, "[data-recorded-audio-player]");
      return nextAudio;
    }
  };

  assert.equal(preserveRecordedAudioPlayer(currentAudio, nextRoot), true);
  assert.strictEqual(nextAudio.replacedWith, currentAudio);
  assert.equal(currentAudio.currentTime, 27);
});

test("recorded audio is not reused when a rerender changes its source", () => {
  const currentAudio = fakeRecordedAudio("https://audio.example.org/old.webm", 27);
  const nextAudio = fakeRecordedAudio("https://audio.example.org/new.webm");
  const nextRoot = { querySelector() { return nextAudio; } };

  assert.equal(preserveRecordedAudioPlayer(currentAudio, nextRoot), false);
  assert.equal(nextAudio.replacedWith, undefined);
});

test("Listen rerenders use the recorded-player preservation helper", async () => {
  const source = await readFile(new URL("../js/app.js", import.meta.url), "utf8");
  assert.ok(source.includes('main.querySelector("[data-recorded-audio-player]")'));
  assert.ok(source.includes("preserveRecordedAudioPlayer(preservedAudioPlayer, main)"));
});

test("Android live audio uses the native media output path", async () => {
  const originalWindow = globalThis.window;
  let contextsCreated = 0;
  class FakeAudioContext { constructor() { contextsCreated += 1; } }
  globalThis.window = {
    AudioContext: FakeAudioContext,
    Capacitor: { isNativePlatform() { return true; }, getPlatform() { return "android"; } }
  };
  try {
    const audio = { paused: true, dataset: { audioPlayer: "live" } };
    assert.equal(await prepareAudioPlayer(audio), false);
    assert.equal(contextsCreated, 0);
  } finally {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
});

function createLiveAudioReturnFixture(stream) {
  const status = { textContent: "" };
  const listeners = new Map();
  const audio = {
    dataset: {
      audioPlayer: "live",
      liveAudioSegments: JSON.stringify([
        { index: 0, durationSeconds: 10, url: "https://audio.example.org/live-buffer.webm" }
      ])
    },
    srcObject: stream,
    paused: false,
    ended: false,
    readyState: 1,
    currentTime: 0,
    duration: 10,
    volume: 1,
    muted: false,
    addEventListener(name, handler) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(handler);
    },
    dispatch(name) {
      (listeners.get(name) || []).forEach(handler => handler());
    },
    pause() {
      this.paused = true;
      this.dispatch("pause");
    },
    load() {},
    removeAttribute(name) { if (name === "src") this.src = ""; },
    play() {
      this.paused = false;
      this.lastPlayedStream = this.srcObject;
      this.dispatch("play");
      return Promise.resolve();
    }
  };
  const root = {
    isConnected: true,
    style: { setProperty() {} },
    querySelector(selector) {
      return selector === "[data-live-audio-status]" ? status : null;
    },
    querySelectorAll() { return []; }
  };
  mountAudioPlayer(audio, root);
  return { audio, status };
}

test("returning from live rewind uses the newest attached live stream", () => {
  const originalStream = { active: true };
  const reconnectedStream = { active: true };
  const { audio } = createLiveAudioReturnFixture(originalStream);

  seekAudioPlayer(audio, 500);
  audio.srcObject = reconnectedStream;

  assert.equal(returnToLiveAudio(audio), true);
  assert.strictEqual(audio.srcObject, reconnectedStream);
  assert.strictEqual(audio.lastPlayedStream, reconnectedStream);
});

test("a new live stream is held off the rewind source and resumes at the live edge", () => {
  const originalStream = { active: true };
  const reconnectedStream = { active: true };
  const { audio } = createLiveAudioReturnFixture(originalStream);

  seekAudioPlayer(audio, 500);

  assert.equal(setLiveAudioStream(audio, reconnectedStream), false);
  assert.equal(audio.srcObject, null);
  assert.equal(audio.src, "https://audio.example.org/live-buffer.webm");

  audio.ended = true;
  audio.dispatch("ended");

  assert.strictEqual(audio.srcObject, reconnectedStream);
  assert.strictEqual(audio.lastPlayedStream, reconnectedStream);
});

test("archive playback waits on the exact next segment when its live stream is unavailable", () => {
  const { audio } = createLiveAudioReturnFixture({ active: false });

  seekAudioPlayer(audio, 500);
  audio.ended = true;
  audio.dispatch("ended");

  assert.equal(isWaitingForLiveAudioSegment(audio), true);
  assert.equal(getNextLiveAudioSegmentIndex(audio), 1);
});

test("failed return-to-live playback shows a live-only tap-to-play message", async () => {
  const { audio, status } = createLiveAudioReturnFixture({ active: true });
  seekAudioPlayer(audio, 500);
  audio.play = () => Promise.reject(new Error("NotAllowedError"));

  assert.equal(returnToLiveAudio(audio), true);
  await Promise.resolve();

  assert.equal(status.textContent, "Tap play on the audio player to hear the broadcast.");
});
