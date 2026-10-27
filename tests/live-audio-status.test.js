import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  publicLiveAudioConnectionMessage,
  publicLiveAudioJoinError,
  publicLiveAudioNetworkIssue
} from "../js/live-audio-status.js";

test("public live audio failure message gives listeners a simple next step", () => {
  const message = publicLiveAudioConnectionMessage("failed");

  assert.equal(
    message,
    "The live audio source did not respond. Try again shortly."
  );
  assert.doesNotMatch(message, /TURN|relay|WebRTC/i);
});

test("public live audio status messages match the current listener copy", () => {
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
    "Connection interrupted. Reconnecting to the live source…"
  );
  assert.equal(
    publicLiveAudioConnectionMessage("unknown"),
    "Connecting to live audio…"
  );
});

test("listener join messages distinguish source waits from reconnection", () => {
  assert.equal(publicLiveAudioConnectionMessage("connecting"), "Connecting to the live broadcast…");
  assert.equal(publicLiveAudioConnectionMessage("connected"), "Connected. Waiting for audio from the live source…");
  assert.equal(publicLiveAudioConnectionMessage("reconnecting"), "Connection interrupted. Reconnecting to the live source…");
});

test("listener network problems are reported only with observable weak-network hints", () => {
  assert.deepEqual(publicLiveAudioNetworkIssue({ online: false }), {
    kind: "network",
    message: "You appear to be offline. Reconnect, then tap Retry."
  });
  assert.equal(publicLiveAudioNetworkIssue({ online: true, effectiveType: "2g" }).kind, "network");
  assert.equal(publicLiveAudioNetworkIssue({ online: true, effectiveType: "4g", rtt: 80, downlink: 12 }), null);
});

test("join failures offer a retry and distinguish network from source issues", () => {
  assert.equal(publicLiveAudioJoinError(new Error("Live audio could not reconnect"), { online: true }).kind, "network");
  assert.equal(publicLiveAudioJoinError(new Error("The broadcast has reached its listener limit"), { online: true }).kind, "source");
  assert.match(publicLiveAudioJoinError(new Error("No response"), { online: true }).message, /live audio source/i);
});

test("live listener keeps its page visible and exposes a retry action", async () => {
  const [view, app] = await Promise.all([
    readFile(new URL("../js/live-audio-views.js", import.meta.url), "utf8"),
    readFile(new URL("../js/app.js", import.meta.url), "utf8")
  ]);
  assert.match(view, /audio-live-join-overlay/);
  assert.match(view, /data-action="retry-live-audio"/);
  assert.match(app, /action === "retry-live-audio"/);
});
