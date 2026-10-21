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
});

test("broadcast recording fails clearly when the browser lacks MediaRecorder", () => {
  assert.throws(
    () => startLiveAudioRecording({ getAudioTracks: () => [{}] }, null),
    /cannot record the broadcast/i
  );
});
