import assert from "node:assert/strict";
import { test } from "node:test";
import { formatAudioTime, getAudioWaveformHeights, seekAudioPlayer } from "../js/live-audio-player.js";

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

test("recording seek positions are clamped and synchronized to duration", () => {
  const audio = { duration: 80, currentTime: 0 };
  seekAudioPlayer(audio, 250);
  assert.equal(audio.currentTime, 20);
  seekAudioPlayer(audio, 1500);
  assert.equal(audio.currentTime, 80);
  seekAudioPlayer({ duration: Number.POSITIVE_INFINITY, currentTime: 4 }, 500);
});
