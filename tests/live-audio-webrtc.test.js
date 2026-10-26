import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  classifyLiveAudioNetworkQuality,
  createLiveAudioIceCandidateQueue,
  readLiveAudioPeerStats,
  getLiveAudioListenerStatus,
  startLiveAudioListener
} from "../js/live-audio-webrtc.js";

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

test("ICE restart pauses candidate application until the replacement SDP is installed", async () => {
  const addedCandidates = [];
  const peer = {
    remoteDescription: { type: "answer", sdp: "first answer" },
    async setRemoteDescription(description) { this.remoteDescription = description; },
    async addIceCandidate(candidate) { addedCandidates.push(candidate); }
  };
  const queue = createLiveAudioIceCandidateQueue(peer);
  queue.beginRemoteDescription();
  await queue.addRemoteCandidate({ candidate: "candidate:restart" });
  assert.deepEqual(addedCandidates, []);

  await queue.setRemoteDescription({ type: "offer", sdp: "restart offer" });
  assert.deepEqual(addedCandidates, [{ candidate: "candidate:restart" }]);
});

test("live audio network quality maps stats to five clear quality grades", () => {
  assert.deepEqual(classifyLiveAudioNetworkQuality({ lossPercent: 0.5, jitterMs: 12, rttMs: 100 }), {
    level: 5,
    label: "Excellent"
  });
  assert.equal(classifyLiveAudioNetworkQuality({ lossPercent: 1.5 }).level, 4);
  assert.equal(classifyLiveAudioNetworkQuality({ jitterMs: 70 }).level, 3);
  assert.equal(classifyLiveAudioNetworkQuality({ rttMs: 500 }).level, 2);
  assert.equal(classifyLiveAudioNetworkQuality({ lossPercent: 12 }).level, 1);
  assert.deepEqual(classifyLiveAudioNetworkQuality({}), { level: 0, label: "Checking" });
});

test("selected WebRTC route stats include quality and direct-versus-relay path", () => {
  const stats = new Map([
    ["transport", { id: "transport", type: "transport", selectedCandidatePairId: "pair" }],
    ["pair", {
      id: "pair",
      type: "candidate-pair",
      currentRoundTripTime: 0.12,
      availableOutgoingBitrate: 220000,
      localCandidateId: "local",
      remoteCandidateId: "remote"
    }],
    ["local", { id: "local", type: "local-candidate", candidateType: "relay" }],
    ["remote", { id: "remote", type: "remote-candidate", candidateType: "host" }],
    ["audio", {
      id: "audio",
      type: "remote-inbound-rtp",
      kind: "audio",
      fractionLost: 0.005,
      jitter: 0.015,
      roundTripTime: 0.1
    }]
  ]);

  assert.deepEqual(readLiveAudioPeerStats(stats), {
    level: 5,
    label: "Excellent",
    lossPercent: 0.5,
    jitterMs: 15,
    rttMs: 100,
    route: "Relay"
  });
});

test("publisher and listener trickle ICE candidates instead of waiting for gathering to finish", async () => {
  const source = await readFile(new URL("../js/live-audio-webrtc.js", import.meta.url), "utf8");

  assert.match(source, /peer\.onicecandidate/);
  assert.match(source, /type:\s*"candidate"/);
  assert.match(source, /iceRestart:\s*true/);
  assert.match(source, /scheduleReconnect/);
  assert.doesNotMatch(source, /waitForIceGatheringComplete/);
});

test("live audio status waits for playback and preserves tap-to-play failures", () => {
  assert.equal(getLiveAudioListenerStatus("connected", "connecting"), "connected");
  assert.equal(getLiveAudioListenerStatus("connected", "blocked"), "tap-to-play");
  assert.equal(getLiveAudioListenerStatus("connected", "playing"), "live");
});

test("listener retries native media playback when the remote audio track unmutes", async () => {
  let channelCallbacks;
  let peer;
  const statuses = [];
  const trackListeners = new Map();
  const track = {
    muted: true,
    addEventListener(name, handler) {
      if (!trackListeners.has(name)) trackListeners.set(name, new Set());
      trackListeners.get(name).add(handler);
    },
    removeEventListener(name, handler) {
      trackListeners.get(name)?.delete(handler);
    },
    dispatch(name) {
      (trackListeners.get(name) || []).forEach(handler => handler());
    }
  };
  const audioElement = {
    srcObject: null,
    playCalls: 0,
    play() {
      this.playCalls += 1;
      return Promise.resolve();
    },
    pause() { this.paused = true; }
  };
  const stream = { id: "remote-audio" };
  const channel = {
    connected: true,
    send(message) {
      if (message.type === "offer") {
        queueMicrotask(() => channelCallbacks.onSignal({
          type: "answer",
          sessionId: "session",
          to: message.from,
          description: { type: "answer", sdp: "answer" }
        }));
      }
      return true;
    },
    close() {}
  };

  const listener = await startLiveAudioListener({
    programId: "program",
    sessionId: "session",
    audioElement,
    onStream(nextStream) {
      audioElement.srcObject = nextStream;
      return true;
    },
    onStatus(status) { statuses.push(status); },
    async connectChannel(programId, sessionId, callbacks) {
      channelCallbacks = callbacks;
      return channel;
    },
    async createPeerConnection() {
      peer = {
        connectionState: "new",
        signalingState: "stable",
        addTransceiver() {},
        async createOffer() { return { type: "offer", sdp: "offer" }; },
        async setLocalDescription(description) {
          this.localDescription = description;
          this.signalingState = "have-local-offer";
          this.connectionState = "connected";
          this.onconnectionstatechange();
        },
        async setRemoteDescription(description) {
          this.remoteDescription = description;
          this.signalingState = "stable";
        },
        close() {}
      };
      return peer;
    }
  });

  peer.ontrack({ streams: [stream], track });
  await Promise.resolve();
  assert.equal(audioElement.playCalls, 1);
  assert.notEqual(statuses.at(-1), "live");

  track.muted = false;
  track.dispatch("unmute");
  await Promise.resolve();
  await Promise.resolve();

  assert.equal(audioElement.playCalls, 2);
  assert.equal(statuses.at(-1), "live");
  assert.strictEqual(audioElement.srcObject, stream);
  await listener.stop();
});

test("listener does not replace archive playback when a new live stream arrives", async () => {
  let channelCallbacks;
  let peer;
  let playbackCalls = 0;
  const channel = {
    connected: true,
    send(message) {
      if (message.type === "offer") {
        queueMicrotask(() => channelCallbacks.onSignal({
          type: "answer",
          sessionId: "session",
          to: message.from,
          description: { type: "answer", sdp: "answer" }
        }));
      }
      return true;
    },
    close() {}
  };
  const audioElement = {
    srcObject: null,
    play() {
      playbackCalls += 1;
      return Promise.resolve();
    },
    pause() { this.paused = true; }
  };
  const stream = { id: "reconnected-live" };
  let storedStream;

  const listener = await startLiveAudioListener({
    programId: "program",
    sessionId: "session",
    audioElement,
    onStream(nextStream) {
      storedStream = nextStream;
      return false;
    },
    async connectChannel(programId, sessionId, callbacks) {
      channelCallbacks = callbacks;
      return channel;
    },
    async createPeerConnection() {
      peer = {
        connectionState: "new",
        signalingState: "stable",
        addTransceiver() {},
        async createOffer() { return { type: "offer", sdp: "offer" }; },
        async setLocalDescription(description) {
          this.localDescription = description;
          this.signalingState = "have-local-offer";
          this.connectionState = "connected";
          this.onconnectionstatechange();
        },
        async setRemoteDescription(description) {
          this.remoteDescription = description;
          this.signalingState = "stable";
        },
        close() {}
      };
      return peer;
    }
  });

  peer.ontrack({ streams: [stream], track: { muted: false } });
  await Promise.resolve();

  assert.strictEqual(storedStream, stream);
  assert.equal(audioElement.srcObject, null);
  assert.equal(playbackCalls, 0);
  await listener.stop();
});
