import assert from "node:assert/strict";
import { test } from "node:test";
import {
  formatAudioTime,
  getAudioWaveformHeights,
  getAudioWaveformPosition,
  getLiveAudioSeekTarget,
  getLiveAudioTimelinePosition,
  seekAudioPlayer
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
    [99, 5]
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
