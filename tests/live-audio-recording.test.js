import assert from "node:assert/strict";
import { test } from "node:test";
import { startLiveAudioRecording } from "../js/live-audio-recording.js";

test("broadcast recording captures audio chunks and returns a web-ready recording", async () => {
  class FakeMediaRecorder {
    static isTypeSupported(type) {
      return type === "audio/webm;codecs=opus";
    }

    constructor(stream, options) {
      this.stream = stream;
      this.mimeType = options.mimeType;
      this.state = "inactive";
      this.listeners = {};
      this.timeslice = 0;
      FakeMediaRecorder.latest = this;
    }

    addEventListener(type, listener) {
      this.listeners[type] = listener;
    }

    start(timeslice) {
      this.state = "recording";
      this.timeslice = timeslice;
    }

    stop() {
      this.state = "inactive";
      this.listeners.dataavailable({ data: new Blob(["captured audio"], { type: this.mimeType }) });
      this.listeners.stop();
    }
  }

  const stream = { getAudioTracks: () => [{}] };
  const recording = startLiveAudioRecording(stream, FakeMediaRecorder);
  const saved = await recording.stop();

  assert.equal(saved.contentType, "audio/webm");
  assert.equal(saved.extension, "webm");
  assert.equal(saved.blob.type, "audio/webm");
  assert.equal(saved.blob.size, "captured audio".length);
  assert.ok(saved.durationSeconds >= 1);
  assert.equal(FakeMediaRecorder.latest.timeslice, undefined);
});

test("broadcast recording fails clearly when the browser lacks MediaRecorder", () => {
  assert.throws(
    () => startLiveAudioRecording({ getAudioTracks: () => [{}] }, null),
    /cannot record the broadcast/i
  );
});

test("live recording uploads playable rewind segments while keeping the full archive", async () => {
  class FakeSegmentRecorder {
    static isTypeSupported(type) {
      return type === "audio/webm;codecs=opus";
    }

    constructor(stream, options) {
      this.stream = stream;
      this.mimeType = options.mimeType;
      this.state = "inactive";
      this.listeners = {};
      this.id = FakeSegmentRecorder.nextId++;
    }

    addEventListener(type, listener) {
      this.listeners[type] = listener;
    }

    start() {
      this.state = "recording";
    }

    stop() {
      this.state = "inactive";
      this.listeners.dataavailable({ data: new Blob(["segment " + this.id], { type: this.mimeType }) });
      this.listeners.stop();
    }
  }
  FakeSegmentRecorder.nextId = 0;

  const uploaded = [];
  const recording = startLiveAudioRecording(
    { getAudioTracks: () => [{}] },
    FakeSegmentRecorder,
    {
      segmentDurationMs: 5,
      onSegment: async segment => { uploaded.push(segment); }
    }
  );
  await new Promise(resolve => setTimeout(resolve, 18));
  const saved = await recording.stop();

  assert.ok(saved.blob.size > 0);
  assert.ok(uploaded.length >= 1);
  assert.deepEqual(uploaded.map(segment => segment.index), uploaded.map((_, index) => index));
  assert.ok(uploaded.every(segment =>
    segment.blob.size > 0 && segment.contentType === "audio/webm" &&
    segment.extension === "webm" && segment.durationSeconds > 0 && segment.startedAt
  ));
  assert.equal(saved.segmentCount, uploaded.length);
  assert.deepEqual(saved.segmentErrors, []);
});

test("archive duration stops at recorder completion instead of waiting for segment uploads", async () => {
  class DelayedUploadRecorder {
    static isTypeSupported(type) {
      return type === "audio/webm;codecs=opus";
    }

    constructor(stream, options) {
      this.stream = stream;
      this.mimeType = options.mimeType;
      this.state = "inactive";
      this.listeners = {};
    }

    addEventListener(type, listener) {
      this.listeners[type] = listener;
    }

    start() {
      this.state = "recording";
    }

    stop() {
      this.state = "inactive";
      this.listeners.dataavailable({ data: new Blob(["captured audio"], { type: this.mimeType }) });
      this.listeners.stop();
    }
  }

  const recording = startLiveAudioRecording(
    { getAudioTracks: () => [{}] },
    DelayedUploadRecorder,
    {
      segmentDurationMs: 5,
      onSegment: () => new Promise(resolve => setTimeout(resolve, 1600))
    }
  );
  await new Promise(resolve => setTimeout(resolve, 20));

  const saved = await recording.stop();

  assert.equal(saved.durationSeconds, 1);
});
