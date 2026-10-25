import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { createLiveAudioIceCandidateQueue } from "../js/live-audio-webrtc.js";

test("trickle ICE buffers remote candidates until the SDP description is installed", async () => {
  let finishRemoteDescription;
  const remoteDescriptionReady = new Promise(resolve => {
    finishRemoteDescription = resolve;
  });
  const addedCandidates = [];
  const peer = {
    remoteDescription: null,
    async setRemoteDescription(description) {
      await remoteDescriptionReady;
      this.remoteDescription = description;
    },
    async addIceCandidate(candidate) {
      addedCandidates.push(candidate);
    }
  };
  const queue = createLiveAudioIceCandidateQueue(peer);
  const firstCandidate = { candidate: "candidate:first" };
  const secondCandidate = { candidate: "candidate:second" };

  const settingDescription = queue.setRemoteDescription({ type: "offer", sdp: "offer" });
  await queue.addRemoteCandidate(firstCandidate);
  assert.deepEqual(addedCandidates, []);

  finishRemoteDescription();
  await settingDescription;
  assert.deepEqual(addedCandidates, [firstCandidate]);

  await queue.addRemoteCandidate(secondCandidate);
  assert.deepEqual(addedCandidates, [firstCandidate, secondCandidate]);
});

test("a stale ICE candidate does not stop later queued candidates from being applied", async () => {
  const addedCandidates = [];
  const peer = {
    remoteDescription: null,
    async setRemoteDescription(description) {
      this.remoteDescription = description;
    },
    async addIceCandidate(candidate) {
      if (candidate.stale) throw new Error("stale candidate");
      addedCandidates.push(candidate);
    }
  };
  const queue = createLiveAudioIceCandidateQueue(peer);

  await queue.addRemoteCandidate({ stale: true });
  await queue.addRemoteCandidate({ candidate: "candidate:usable" });
  await queue.setRemoteDescription({ type: "answer", sdp: "answer" });

  assert.deepEqual(addedCandidates, [{ candidate: "candidate:usable" }]);
});

test("publisher and listener trickle ICE candidates instead of waiting for gathering to finish", async () => {
  const source = await readFile(new URL("../js/live-audio-webrtc.js", import.meta.url), "utf8");

  assert.match(source, /peer\.onicecandidate/);
  assert.match(source, /type:\s*"candidate"/);
  assert.doesNotMatch(source, /waitForIceGatheringComplete/);
});
