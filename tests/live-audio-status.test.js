import assert from "node:assert/strict";
import { test } from "node:test";
import { publicLiveAudioConnectionMessage } from "../js/live-audio-status.js";

test("public live audio failure message gives listeners a simple next step", () => {
  const message = publicLiveAudioConnectionMessage("failed");

  assert.equal(
    message,
    "We couldn't connect to the live broadcast. Please try again or switch networks."
  );
  assert.doesNotMatch(message, /TURN|relay|WebRTC/i);
});

test("public live audio status messages preserve the connected and ended states", () => {
  assert.equal(
    publicLiveAudioConnectionMessage("live"),
    "Live audio is connected."
  );
  assert.equal(
    publicLiveAudioConnectionMessage("ended"),
    "This broadcast has ended."
  );
  assert.equal(
    publicLiveAudioConnectionMessage("reconnecting"),
    "The connection dropped briefly. Reconnecting to live audio…"
  );
  assert.equal(
    publicLiveAudioConnectionMessage("unknown"),
    "Connecting to live audio…"
  );
});
