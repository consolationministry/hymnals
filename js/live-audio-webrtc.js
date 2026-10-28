import { connectLiveAudioChannel, createLiveAudioId, makeAudioPeerConnection } from "./live-audio-realtime.js";

export const AUDIO_EQ_BANDS = Object.freeze([40, 60, 90, 125, 180, 250, 355, 500, 710, 1000, 1400, 2000, 2800, 4000, 5600, 8000]);

// Every adjustable audio control. Each one drives a real Web Audio node in the
// microphone chain (see createLiveAudioMicEngine). Keep keys in sync with the engine.
export const AUDIO_CONTROL_SPECS = Object.freeze([
  ...AUDIO_EQ_BANDS.map(freq => Object.freeze({
    key: "eq" + freq,
    label: freq >= 1000 ? (freq / 1000) + "kHz" : freq + "Hz",
    group: "eq", min: -12, max: 12, step: 1, unit: " dB", default: 0
  })),
  { key: "bass", label: "Bass shelf", group: "tone", min: -12, max: 12, step: 1, unit: " dB", default: 0 },
  { key: "mid", label: "Mid boost", group: "tone", min: -12, max: 12, step: 1, unit: " dB", default: 0 },
  { key: "midFreq", label: "Mid frequency", group: "tone", min: 200, max: 5000, step: 50, unit: " Hz", default: 1100 },
  { key: "midQ", label: "Mid width (Q)", group: "tone", min: 0.3, max: 4, step: 0.05, unit: "", default: 0.85 },
  { key: "treble", label: "Treble shelf", group: "tone", min: -12, max: 12, step: 1, unit: " dB", default: 0 },
  { key: "highpass", label: "Low cut", group: "tone", min: 20, max: 300, step: 5, unit: " Hz", default: 75 },
  { key: "balance", label: "Balance (L/R)", group: "output", min: -1, max: 1, step: 0.05, unit: "", default: 0 },
  { key: "pitch", label: "Pitch", group: "output", min: -4, max: 4, step: 1, unit: " st", default: 0 },
  { key: "gain", label: "Mic level", group: "output", min: -12, max: 6, step: 1, unit: " dB", default: 0 },
  { key: "volume", label: "Output volume", group: "output", min: 0, max: 100, step: 1, unit: "%", default: 100 },
  { key: "threshold", label: "Compressor threshold", group: "dynamics", min: -60, max: 0, step: 1, unit: " dB", default: -18 },
  { key: "ratio", label: "Compressor ratio", group: "dynamics", min: 1, max: 20, step: 1, unit: ":1", default: 3 },
  { key: "knee", label: "Compressor knee", group: "dynamics", min: 0, max: 40, step: 1, unit: " dB", default: 12 },
  { key: "attack", label: "Attack", group: "dynamics", min: 0, max: 100, step: 1, unit: " ms", default: 4 },
  { key: "release", label: "Release", group: "dynamics", min: 20, max: 1000, step: 10, unit: " ms", default: 160 }
]);

export const DEFAULT_AUDIO_SETTINGS = Object.freeze(
  Object.fromEntries(AUDIO_CONTROL_SPECS.map(spec => [spec.key, spec.default]))
);

export const AUDIO_PRESETS = Object.freeze({
  flat: { label: "Flat (default)", values: {} },
  voice: { label: "Clear voice", values: { highpass: 90, eq250: -3, eq500: -2, eq2000: 3, eq4000: 4, mid: 2, midFreq: 2800 } },
  choir: { label: "Warm choir", values: { bass: 3, eq125: 2, eq250: 1, eq4000: -2, eq8000: -3, treble: -1 } },
  bass: { label: "Bass boost", values: { bass: 8, eq60: 5, eq90: 4, eq125: 2, highpass: 40 } },
  bright: { label: "Bright", values: { treble: 5, eq4000: 3, eq5600: 2, eq8000: 4 } }
});

export function getLiveAudioListenerStatus(connectionState, playbackStatus) {
  if (playbackStatus === "blocked") return "tap-to-play";
  if (connectionState !== "connected") return "connecting";
  return playbackStatus === "playing" ? "live" : "connected";
}
export function createLiveAudioIceCandidateQueue(peer) {
  let remoteDescriptionReady = Boolean(peer && peer.remoteDescription);
  const pendingCandidates = [];

  const flushPendingCandidates = async () => {
    if (!remoteDescriptionReady) return;
    const candidates = pendingCandidates.splice(0);
    for (const candidate of candidates) {
      try {
        await peer.addIceCandidate(candidate);
      } catch (error) {
        // An obsolete or incompatible candidate should not block the remaining route candidates.
      }
    }
  };

  return {
    async setRemoteDescription(description) {
      await peer.setRemoteDescription(description);
      remoteDescriptionReady = true;
      await flushPendingCandidates();
    },
    beginRemoteDescription() {
      remoteDescriptionReady = false;
    },
    async restoreRemoteDescription() {
      remoteDescriptionReady = Boolean(peer && peer.remoteDescription);
      await flushPendingCandidates();
    },
    async addRemoteCandidate(candidate) {
      if (!candidate) return;
      if (!remoteDescriptionReady) {
        pendingCandidates.push(candidate);
        return;
      }
      await peer.addIceCandidate(candidate);
    }
  };
}

function serializeIceCandidate(candidate) {
  return candidate && typeof candidate.toJSON === "function"
    ? candidate.toJSON()
    : candidate;
}

function clamp(value, min, max) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : 0;
}

const NETWORK_QUALITY_LABELS = Object.freeze({
  1: "Very poor",
  2: "Poor",
  3: "Good",
  4: "Better",
  5: "Excellent"
});

export function classifyLiveAudioNetworkQuality(metrics) {
  const values = metrics || {};
  const metric = key => values[key] === null || values[key] === undefined
    ? NaN
    : Number(values[key]);
  const loss = metric("lossPercent");
  const jitter = metric("jitterMs");
  const rtt = metric("rttMs");
  const bitrate = metric("availableOutgoingBitrate");
  const known = [
    Number.isFinite(loss),
    Number.isFinite(jitter),
    Number.isFinite(rtt),
    Number.isFinite(bitrate)
  ].some(Boolean);
  if (!known) return { level: 0, label: "Checking" };

  let level = 5;
  if ((Number.isFinite(loss) && loss > 10) ||
      (Number.isFinite(jitter) && jitter > 180) ||
      (Number.isFinite(rtt) && rtt > 700) ||
      (Number.isFinite(bitrate) && bitrate > 0 && bitrate < 48000)) {
    level = 1;
  } else if ((Number.isFinite(loss) && loss > 5) ||
      (Number.isFinite(jitter) && jitter > 100) ||
      (Number.isFinite(rtt) && rtt > 450) ||
      (Number.isFinite(bitrate) && bitrate > 0 && bitrate < 64000)) {
    level = 2;
  } else if ((Number.isFinite(loss) && loss > 2) ||
      (Number.isFinite(jitter) && jitter > 50) ||
      (Number.isFinite(rtt) && rtt > 280) ||
      (Number.isFinite(bitrate) && bitrate > 0 && bitrate < 96000)) {
    level = 3;
  } else if ((Number.isFinite(loss) && loss > 1) ||
      (Number.isFinite(jitter) && jitter > 25) ||
      (Number.isFinite(rtt) && rtt > 160) ||
      (Number.isFinite(bitrate) && bitrate > 0 && bitrate < 160000)) {
    level = 4;
  }
  return { level, label: NETWORK_QUALITY_LABELS[level] };
}

export function readLiveAudioPeerStats(report) {
  const stats = report && typeof report.values === "function"
    ? Array.from(report.values())
    : Array.isArray(report) ? report : [];
  const transport = stats.find(item => item && item.type === "transport" && item.selectedCandidatePairId);
  const selectedPair = transport
    ? stats.find(item => item && item.id === transport.selectedCandidatePairId)
    : stats.find(item => item && item.type === "candidate-pair" &&
      (item.selected === true || (item.nominated === true && item.state === "succeeded")));
  const remoteAudio = stats.find(item => item && item.type === "remote-inbound-rtp" &&
    (item.kind === "audio" || item.mediaType === "audio"));
  const localCandidate = selectedPair && stats.find(item => item && item.id === selectedPair.localCandidateId);
  const remoteCandidate = selectedPair && stats.find(item => item && item.id === selectedPair.remoteCandidateId);
  const fractionLost = remoteAudio ? Number(remoteAudio.fractionLost) : NaN;
  const packetLoss = Number.isFinite(fractionLost)
    ? Math.max(0, fractionLost * 100)
    : NaN;
  const jitter = remoteAudio ? Number(remoteAudio.jitter) : NaN;
  const remoteRtt = remoteAudio ? Number(remoteAudio.roundTripTime) : NaN;
  const pairRtt = selectedPair ? Number(selectedPair.currentRoundTripTime) : NaN;
  const outgoingBitrate = selectedPair ? Number(selectedPair.availableOutgoingBitrate) : NaN;
  const quality = classifyLiveAudioNetworkQuality({
    lossPercent: packetLoss,
    jitterMs: Number.isFinite(jitter) ? jitter * 1000 : NaN,
    rttMs: Number.isFinite(remoteRtt) ? remoteRtt * 1000 : Number.isFinite(pairRtt) ? pairRtt * 1000 : NaN,
    availableOutgoingBitrate: outgoingBitrate
  });
  const candidateTypes = [localCandidate && localCandidate.candidateType, remoteCandidate && remoteCandidate.candidateType];
  const route = candidateTypes.includes("relay") ? "Relay" : selectedPair ? "Direct" : "—";
  return {
    ...quality,
    lossPercent: Number.isFinite(packetLoss) ? packetLoss : null,
    jitterMs: Number.isFinite(jitter) ? jitter * 1000 : null,
    rttMs: Number.isFinite(remoteRtt) ? remoteRtt * 1000 : Number.isFinite(pairRtt) ? pairRtt * 1000 : null,
    route
  };
}

export async function createLiveAudioMicEngine(options) {
  const opts = options || {};
  if (!globalThis.navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("This browser does not support microphone access.");
  }
  if (typeof window !== "undefined" && !window.isSecureContext) {
    throw new Error("Microphone broadcasting requires the secure HTTPS website.");
  }

  let rawStream;
  try {
    const audioConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: false,
      channelCount: 1
    };
    if (opts.deviceId) audioConstraints.deviceId = { exact: opts.deviceId };
    rawStream = await navigator.mediaDevices.getUserMedia({
      audio: audioConstraints
    });
  } catch (error) {
    if (!opts.deviceId && error && (error.name === "OverconstrainedError" || error.name === "ConstraintNotSatisfiedError")) {
      rawStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } else {
      throw new Error(error && error.name === "NotAllowedError"
        ? "Microphone permission was denied. Allow microphone access in your browser settings."
        : (error && error.message) || "The microphone could not be started.");
    }
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    rawStream.getTracks().forEach(track => track.stop());
    throw new Error("This browser does not support live audio processing.");
  }

  const context = new AudioContextClass({ latencyHint: "interactive" });
  try {
    if (context.state === "suspended") await context.resume();
    const source = context.createMediaStreamSource(rawStream);
    const highPass = context.createBiquadFilter();
    highPass.type = "highpass";
    highPass.Q.value = 0.7;
    const bass = context.createBiquadFilter();
    bass.type = "lowshelf";
    bass.frequency.value = 160;
    const eqBands = AUDIO_EQ_BANDS.map(freq => {
      const band = context.createBiquadFilter();
      band.type = "peaking";
      band.frequency.value = freq;
      band.Q.value = 1.1;
      band.gain.value = 0;
      return band;
    });
    const mid = context.createBiquadFilter();
    mid.type = "peaking";
    mid.frequency.value = 1100;
    mid.Q.value = 0.85;
    const treble = context.createBiquadFilter();
    treble.type = "highshelf";
    treble.frequency.value = 5200;
    const balance = typeof context.createStereoPanner === "function" ? context.createStereoPanner() : null;
    const compressor = context.createDynamicsCompressor();
    let pitchNode = null;
    let pitchAvailable = false;

    if (context.audioWorklet && typeof AudioWorkletNode === "function") {
      try {
        await context.audioWorklet.addModule(new URL("./worklets/live-audio-pitch.js", import.meta.url));
        pitchNode = new AudioWorkletNode(context, "live-audio-pitch", {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          channelCount: 1,
          processorOptions: { numberOfChannels: 1 }
        });
        pitchAvailable = true;
      } catch (error) {
        pitchNode = null;
      }
    }

    const gain = context.createGain();
    const volume = context.createGain();
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.72;
    const destination = context.createMediaStreamDestination();

    // Serial chain: source -> low cut -> bass -> 16 EQ bands -> mid -> treble -> balance -> compressor -> pitch -> mic level -> volume -> analyser -> broadcast.
    const serial = [source, highPass, bass, ...eqBands, mid, treble, balance, compressor];
    for (let index = 0; index < serial.length - 1; index += 1) {
      if (serial[index] && serial[index + 1]) serial[index].connect(serial[index + 1]);
    }
    const last = serial[serial.length - 1];
    if (pitchNode) {
      last.connect(pitchNode);
      pitchNode.connect(gain);
    } else {
      last.connect(gain);
    }
    gain.connect(volume);
    volume.connect(analyser);
    analyser.connect(destination);

    const nodes = { highPass, bass, eqBands, mid, treble, balance, compressor, gain, volume, pitchNode };
    const setSettings = values => {
      const settings = Object.assign({}, DEFAULT_AUDIO_SETTINGS, values || {});
      const now = context.currentTime;
      const ramp = (param, value) => param.setTargetAtTime(value, now, 0.025);
      ramp(nodes.highPass.frequency, clamp(settings.highpass, 20, 300));
      ramp(nodes.bass.gain, clamp(settings.bass, -12, 12));
      ramp(nodes.mid.gain, clamp(settings.mid, -12, 12));
      ramp(nodes.mid.frequency, clamp(settings.midFreq, 200, 5000));
      ramp(nodes.mid.Q, clamp(settings.midQ, 0.3, 4));
      ramp(nodes.treble.gain, clamp(settings.treble, -12, 12));
      nodes.eqBands.forEach((band, index) => {
        ramp(band.gain, clamp(settings["eq" + AUDIO_EQ_BANDS[index]], -12, 12));
      });
      if (nodes.balance) ramp(nodes.balance.pan, clamp(settings.balance, -1, 1));
      ramp(nodes.compressor.threshold, clamp(settings.threshold, -60, 0));
      ramp(nodes.compressor.knee, clamp(settings.knee, 0, 40));
      ramp(nodes.compressor.ratio, clamp(settings.ratio, 1, 20));
      ramp(nodes.compressor.attack, clamp(settings.attack, 0, 100) / 1000);
      ramp(nodes.compressor.release, clamp(settings.release, 20, 1000) / 1000);
      ramp(nodes.gain.gain, Math.pow(10, clamp(settings.gain, -12, 6) / 20));
      ramp(nodes.volume.gain, clamp(settings.volume, 0, 100) / 100);
      if (nodes.pitchNode) nodes.pitchNode.port.postMessage({ semitones: clamp(settings.pitch, -4, 4) });
    };
    setSettings(opts.settings || DEFAULT_AUDIO_SETTINGS);

    return {
      stream: destination.stream,
      rawStream,
      analyser,
      context,
      pitchAvailable,
      setSettings,
      waveform(buffer) {
        const samples = buffer || new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(samples);
        return samples;
      },
      level() {
        const samples = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(samples);
        let energy = 0;
        for (let index = 0; index < samples.length; index += 1) {
          const centered = (samples[index] - 128) / 128;
          energy += centered * centered;
        }
        return Math.min(100, Math.round(Math.sqrt(energy / samples.length) * 260));
      },
      async stop() {
        rawStream.getTracks().forEach(track => track.stop());
        destination.stream.getTracks().forEach(track => track.stop());
        if (context.state !== "closed") await context.close().catch(() => {});
      }
    };
  } catch (error) {
    rawStream.getTracks().forEach(track => track.stop());
    if (context.state !== "closed") await context.close().catch(() => {});
    throw error;
  }
}

function descriptionToJson(description) {
  return description && typeof description.toJSON === "function"
    ? description.toJSON()
    : { type: description.type, sdp: description.sdp };
}

export async function startLiveAudioPublisher(options) {
  const opts = options || {};
  if (!opts.programId || !opts.sessionId || !opts.stream) throw new Error("The broadcast is missing its programme or microphone.");
  const localClientId = "host-" + opts.sessionId;
  const peers = new Map();
  const peerIceQueues = new Map();
  const pendingPeerConnections = new Map();
  const pendingRemoteCandidates = new Map();
  const peerDisconnectTimers = new Map();
  const peerRecoveryTimers = new Map();
  const peerRecoveryAttempts = new Map();
  let channel = null;
  let closed = false;
  let statsTimer = null;
  let statsPolling = false;
  let handleSignal = null;
  channel = await connectLiveAudioChannel(opts.programId, opts.sessionId, {
    onStatus: status => {
      if (opts.onStatus) opts.onStatus(status);
    },
    onSignal: message => { if (handleSignal) void handleSignal(message); }
  });

  const clearPeerTimer = (timers, clientId) => {
    const timer = timers.get(clientId);
    if (timer !== undefined) globalThis.clearTimeout(timer);
    timers.delete(clientId);
  };

  const closePeer = clientId => {
    const pending = pendingPeerConnections.get(clientId);
    if (pending) {
      pending.cancelled = true;
      pendingPeerConnections.delete(clientId);
    }
    pendingRemoteCandidates.delete(clientId);
    const peer = peers.get(clientId);
    if (!peer) return;
    clearPeerTimer(peerDisconnectTimers, clientId);
    clearPeerTimer(peerRecoveryTimers, clientId);
    peerRecoveryAttempts.delete(clientId);
    peers.delete(clientId);
    peerIceQueues.delete(clientId);
    peer.onconnectionstatechange = null;
    peer.onicecandidate = null;
    peer.close();
    if (opts.onListenerCount) opts.onListenerCount(peers.size);
  };

  const schedulePeerRecovery = (clientId, peer, delayMs) => {
    if (closed || peers.get(clientId) !== peer || peerRecoveryTimers.has(clientId)) return;
    const timer = globalThis.setTimeout(async () => {
      peerRecoveryTimers.delete(clientId);
      if (closed || peers.get(clientId) !== peer || peer.connectionState === "connected") return;
      if (!channel.connected) {
        schedulePeerRecovery(clientId, peer, 1000);
        return;
      }
      const attempts = peerRecoveryAttempts.get(clientId) || 0;
      if (attempts >= 3) {
        channel.send({ type: "failed", sessionId: opts.sessionId, from: localClientId, to: clientId });
        closePeer(clientId);
        return;
      }
      if (peer.signalingState !== "stable") {
        if (peer.signalingState === "have-local-offer") {
          try { await peer.setLocalDescription({ type: "rollback" }); } catch (error) {}
        } else {
          schedulePeerRecovery(clientId, peer, 1500);
          return;
        }
      }

      const iceQueue = peerIceQueues.get(clientId);
      if (!iceQueue) return;
      peerRecoveryAttempts.set(clientId, attempts + 1);
      iceQueue.beginRemoteDescription();
      if (!channel.send({ type: "restart-start", sessionId: opts.sessionId, from: localClientId, to: clientId })) {
        await iceQueue.restoreRemoteDescription();
        schedulePeerRecovery(clientId, peer, 1500);
        return;
      }
      try {
        const offer = await peer.createOffer({ iceRestart: true });
        await peer.setLocalDescription(offer);
        if (!channel.send({
          type: "restart-offer",
          sessionId: opts.sessionId,
          from: localClientId,
          to: clientId,
          description: descriptionToJson(peer.localDescription)
        })) {
          throw new Error("The live audio signaling channel is reconnecting.");
        }
        if (opts.onStatus) opts.onStatus("reconnecting");
        schedulePeerRecovery(clientId, peer, 12000);
      } catch (error) {
        await iceQueue.restoreRemoteDescription();
        channel.send({ type: "restart-cancel", sessionId: opts.sessionId, from: localClientId, to: clientId });
        if (peer.signalingState === "have-local-offer") {
          try { await peer.setLocalDescription({ type: "rollback" }); } catch (rollbackError) {}
        }
        schedulePeerRecovery(clientId, peer, 2000);
      }
    }, Math.max(0, Number(delayMs) || 0));
    peerRecoveryTimers.set(clientId, timer);
  };

  const reportNetworkStats = async () => {
    if (closed || statsPolling || !opts.onNetworkStatus) return;
    statsPolling = true;
    try {
      const samples = await Promise.all(Array.from(peers.entries()).map(async ([clientId, peer]) => {
        if (peer.connectionState !== "connected" || typeof peer.getStats !== "function") return null;
        try {
          return { clientId, ...readLiveAudioPeerStats(await peer.getStats()) };
        } catch (error) {
          return null;
        }
      }));
      if (closed) return;
      const connected = samples.filter(Boolean);
      const measured = connected.filter(sample => sample.level > 0);
      if (!measured.length) {
        opts.onNetworkStatus({
          level: 0,
          label: connected.length ? "Checking" : peers.size ? "Reconnecting" : "Waiting for listeners",
          connectedListeners: connected.length,
          listenerCount: peers.size,
          weakListeners: 0,
          route: "—"
        });
        return;
      }
      const level = Math.round(measured.reduce((sum, sample) => sum + sample.level, 0) / measured.length);
      const routes = new Set(measured.map(sample => sample.route).filter(route => route !== "—"));
      opts.onNetworkStatus({
        level,
        label: NETWORK_QUALITY_LABELS[level],
        connectedListeners: connected.length,
        listenerCount: peers.size,
        weakListeners: measured.filter(sample => sample.level <= 2).length,
        route: routes.size > 1 ? "Mixed" : routes.values().next().value || "—"
      });
    } finally {
      statsPolling = false;
    }
  };

  handleSignal = async message => {
    if (!message || message.sessionId !== opts.sessionId) return;
    if (message.type === "leave" && message.to === localClientId) {
      closePeer(message.from);
      return;
    }
    if (message.type === "candidate" && message.to === localClientId) {
      const iceQueue = peerIceQueues.get(message.from);
      if (iceQueue && message.candidate) {
        void iceQueue.addRemoteCandidate(message.candidate).catch(() => {});
      } else if (pendingPeerConnections.has(message.from) && message.candidate) {
        const candidates = pendingRemoteCandidates.get(message.from) || [];
        candidates.push(message.candidate);
        pendingRemoteCandidates.set(message.from, candidates);
      }
      return;
    }
    if (message.type === "restart-answer" && message.to === localClientId) {
      const peer = peers.get(message.from);
      const iceQueue = peerIceQueues.get(message.from);
      if (peer && iceQueue && peer.signalingState === "have-local-offer") {
        try {
          await iceQueue.setRemoteDescription(message.description);
        } catch (error) {
          schedulePeerRecovery(message.from, peer, 0);
        }
      }
      return;
    }
    if (message.type !== "offer" || message.to !== localClientId ||
        peers.has(message.from) || pendingPeerConnections.has(message.from)) return;
    const limit = Math.max(1, Number(opts.maxListeners) || 16);
    if (peers.size + pendingPeerConnections.size >= limit) {
      channel.send({ type: "full", sessionId: opts.sessionId, from: localClientId, to: message.from });
      return;
    }
    const pending = { cancelled: false };
    pendingPeerConnections.set(message.from, pending);
    try {
      const peer = await makeAudioPeerConnection({
        programId: opts.programId,
        sessionId: opts.sessionId
      });
      if (closed || pending.cancelled) {
        peer.close();
        return;
      }
      pendingPeerConnections.delete(message.from);
      const iceQueue = createLiveAudioIceCandidateQueue(peer);
      peers.set(message.from, peer);
      peerIceQueues.set(message.from, iceQueue);
      const queuedCandidates = pendingRemoteCandidates.get(message.from) || [];
      pendingRemoteCandidates.delete(message.from);
      queuedCandidates.forEach(candidate => {
        void iceQueue.addRemoteCandidate(candidate).catch(() => {});
      });
      opts.stream.getAudioTracks().forEach(track => peer.addTrack(track, opts.stream));
      peer.onicecandidate = event => {
        if (!event.candidate) return;
        channel.send({
          type: "candidate",
          sessionId: opts.sessionId,
          from: localClientId,
          to: message.from,
          candidate: serializeIceCandidate(event.candidate)
        });
      };
      peer.onconnectionstatechange = () => {
        if (peers.get(message.from) !== peer) return;
        if (peer.connectionState === "connected") {
          clearPeerTimer(peerDisconnectTimers, message.from);
          clearPeerTimer(peerRecoveryTimers, message.from);
          peerRecoveryAttempts.delete(message.from);
          if (opts.onStatus) opts.onStatus("connected");
          void reportNetworkStats();
        } else if (peer.connectionState === "disconnected") {
          if (!peerDisconnectTimers.has(message.from)) {
            peerDisconnectTimers.set(message.from, globalThis.setTimeout(() => {
              peerDisconnectTimers.delete(message.from);
              schedulePeerRecovery(message.from, peer, 0);
            }, 5000));
          }
        } else if (peer.connectionState === "failed") {
          schedulePeerRecovery(message.from, peer, 0);
        } else if (peer.connectionState === "closed") {
          closePeer(message.from);
        }
        if (opts.onListenerCount) opts.onListenerCount(peers.size);
      };
      await iceQueue.setRemoteDescription(message.description);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      channel.send({
        type: "answer",
        sessionId: opts.sessionId,
        from: localClientId,
        to: message.from,
        description: descriptionToJson(peer.localDescription)
      });
      if (opts.onListenerCount) opts.onListenerCount(peers.size);
      void reportNetworkStats();
    } catch (error) {
      pendingPeerConnections.delete(message.from);
      pendingRemoteCandidates.delete(message.from);
      closePeer(message.from);
      if (!closed && !pending.cancelled) {
        channel.send({ type: "failed", sessionId: opts.sessionId, from: localClientId, to: message.from });
      }
    }
  };

  statsTimer = globalThis.setInterval(() => { void reportNetworkStats(); }, 3000);
  void reportNetworkStats();

  return {
    get listenerCount() { return peers.size; },
    async stop() {
      if (closed) return;
      closed = true;
      if (statsTimer !== null) globalThis.clearInterval(statsTimer);
      statsTimer = null;
      channel.send({ type: "ended", sessionId: opts.sessionId, from: localClientId });
      pendingPeerConnections.forEach(pending => { pending.cancelled = true; });
      pendingPeerConnections.clear();
      Array.from(peers.keys()).forEach(closePeer);
      channel.close();
      if (opts.onStatus) opts.onStatus("disconnected");
    }
  };
}

export async function startLiveAudioListener(options) {
  const opts = options || {};
  if (!opts.programId || !opts.sessionId || !opts.audioElement) throw new Error("This broadcast is missing its live player.");
  const connectChannel = opts.connectChannel || connectLiveAudioChannel;
  const createPeerConnection = opts.createPeerConnection || makeAudioPeerConnection;
  let clientId = createLiveAudioId();
  let peer = null;
  let channel = null;
  let iceQueue = null;
  let remoteAudioTrack = null;
  let remoteTrackUnmuteHandler = null;
  let remoteTrackMuteHandler = null;
  let playRemoteAudioTrack = null;
  let earlyRemoteCandidates = [];
  let closed = false;
  let peerGeneration = 0;
  let startingPeer = false;
  let reconnectTimer = null;
  let handshakeTimer = null;
  let startupTimer = null;
  let reconnectAttempts = 0;
  let hasConnected = false;
  let audioPlaybackStatus = "connecting";
  let resolveConnected;
  let rejectConnected;
  const connected = new Promise((resolve, reject) => {
    resolveConnected = resolve;
    rejectConnected = reject;
  });

  const clearTimer = key => {
    if (key === "reconnect" && reconnectTimer !== null) globalThis.clearTimeout(reconnectTimer);
    if (key === "handshake" && handshakeTimer !== null) globalThis.clearTimeout(handshakeTimer);
    if (key === "startup" && startupTimer !== null) globalThis.clearTimeout(startupTimer);
    if (key === "reconnect") reconnectTimer = null;
    if (key === "handshake") handshakeTimer = null;
    if (key === "startup") startupTimer = null;
  };

  const clearRemoteTrackHandlers = () => {
    if (remoteAudioTrack && remoteTrackUnmuteHandler) {
      if (typeof remoteAudioTrack.removeEventListener === "function") {
        remoteAudioTrack.removeEventListener("unmute", remoteTrackUnmuteHandler);
      }
    }
    if (remoteAudioTrack && remoteTrackMuteHandler) {
      if (typeof remoteAudioTrack.removeEventListener === "function") {
        remoteAudioTrack.removeEventListener("mute", remoteTrackMuteHandler);
      }
    }
    remoteAudioTrack = null;
    remoteTrackUnmuteHandler = null;
    remoteTrackMuteHandler = null;
    playRemoteAudioTrack = null;
  };

  const finishConnected = () => {
    if (hasConnected) return;
    hasConnected = true;
    clearTimer("startup");
    resolveConnected(true);
  };

  const failInitialConnection = error => {
    if (hasConnected) return;
    hasConnected = true;
    clearTimer("startup");
    rejectConnected(error);
  };

  const scheduleReconnect = delayMs => {
    if (closed || reconnectTimer !== null) return;
    if (opts.onStatus) opts.onStatus("reconnecting");
    const delay = Number.isFinite(Number(delayMs))
      ? Math.max(0, Number(delayMs))
      : Math.min(30000, 750 * Math.pow(2, reconnectAttempts)) + Math.round(Math.random() * 400);
    reconnectAttempts = Math.min(reconnectAttempts + 1, 8);
    reconnectTimer = globalThis.setTimeout(() => {
      reconnectTimer = null;
      void startPeer(true);
    }, delay);
  };

  let handleSignal = null;
  channel = await connectChannel(opts.programId, opts.sessionId, {
    onStatus: status => {
      if (opts.onStatus) opts.onStatus(status);
      if (status === "connected" && peer &&
          (peer.connectionState === "failed" || peer.connectionState === "disconnected")) {
        scheduleReconnect(0);
      }
    },
    onSignal: message => { if (handleSignal) void handleSignal(message); }
  });

  const startPeer = async retry => {
    if (closed || startingPeer) return;
    startingPeer = true;
    audioPlaybackStatus = "connecting";
    clearTimer("handshake");
    const previousClientId = clientId;
    if (retry) {
      if (peer) {
        clearRemoteTrackHandlers();
        channel.send({ type: "leave", sessionId: opts.sessionId, from: previousClientId, to: "host-" + opts.sessionId });
        peer.onconnectionstatechange = null;
        peer.onicecandidate = null;
        peer.ontrack = null;
        peer.close();
      }
      peer = null;
      iceQueue = null;
      earlyRemoteCandidates = [];
      clientId = createLiveAudioId();
    }
    const attemptClientId = clientId;
    const generation = ++peerGeneration;
    try {
      if (!channel.connected) throw new Error("The live audio signaling channel is reconnecting.");
      const nextPeer = await createPeerConnection({
        programId: opts.programId,
        sessionId: opts.sessionId
      });
      if (closed || generation !== peerGeneration) {
        nextPeer.close();
        return;
      }
      peer = nextPeer;
      iceQueue = createLiveAudioIceCandidateQueue(nextPeer);
      earlyRemoteCandidates.splice(0).forEach(candidate => {
        void iceQueue.addRemoteCandidate(candidate).catch(() => {});
      });
      const earlyLocalCandidates = [];
      let offerSent = false;
      const sendCandidate = candidate => channel.send({
        type: "candidate",
        sessionId: opts.sessionId,
        from: attemptClientId,
        to: "host-" + opts.sessionId,
        candidate: serializeIceCandidate(candidate)
      });
      nextPeer.onicecandidate = event => {
        if (!event.candidate) return;
        if (offerSent) sendCandidate(event.candidate);
        else earlyLocalCandidates.push(event.candidate);
      };
      nextPeer.ontrack = event => {
        clearRemoteTrackHandlers();
        const stream = event.streams && event.streams[0]
          ? event.streams[0]
          : new MediaStream([event.track]);
        remoteAudioTrack = event.track || null;
        const attachStream = () => {
          if (typeof opts.onStream === "function") return opts.onStream(stream) !== false;
          opts.audioElement.srcObject = stream;
          return true;
        };
        playRemoteAudioTrack = () => {
          if (closed || peer !== nextPeer || !attachStream()) return;
          try {
            Promise.resolve(opts.audioElement.play()).then(() => {
              if (closed || peer !== nextPeer) return;
              audioPlaybackStatus = remoteAudioTrack && remoteAudioTrack.muted
                ? "connecting"
                : "playing";
              if (opts.onStatus) opts.onStatus(getLiveAudioListenerStatus(nextPeer.connectionState, audioPlaybackStatus));
            }, () => {
              if (closed || peer !== nextPeer) return;
              audioPlaybackStatus = "blocked";
              if (opts.onStatus) opts.onStatus(getLiveAudioListenerStatus(nextPeer.connectionState, audioPlaybackStatus));
            });
          } catch (error) {
            audioPlaybackStatus = "blocked";
            if (opts.onStatus) opts.onStatus(getLiveAudioListenerStatus(nextPeer.connectionState, audioPlaybackStatus));
          }
        };
        if (remoteAudioTrack && typeof remoteAudioTrack.addEventListener === "function") {
          remoteTrackUnmuteHandler = () => {
            if (playRemoteAudioTrack) playRemoteAudioTrack();
          };
          remoteTrackMuteHandler = () => {
            if (closed || peer !== nextPeer || opts.audioElement.srcObject !== stream) return;
            audioPlaybackStatus = "connecting";
            if (opts.onStatus) opts.onStatus(getLiveAudioListenerStatus(nextPeer.connectionState, audioPlaybackStatus));
          };
          remoteAudioTrack.addEventListener("unmute", remoteTrackUnmuteHandler);
          remoteAudioTrack.addEventListener("mute", remoteTrackMuteHandler);
        }
        playRemoteAudioTrack();
      };
      nextPeer.onconnectionstatechange = () => {
        if (peer !== nextPeer) return;
        if (nextPeer.connectionState === "connected") {
          clearTimer("reconnect");
          clearTimer("handshake");
          reconnectAttempts = 0;
          finishConnected();
          if (opts.onStatus) opts.onStatus(getLiveAudioListenerStatus(nextPeer.connectionState, audioPlaybackStatus));
          if (playRemoteAudioTrack) playRemoteAudioTrack();
        } else if (nextPeer.connectionState === "disconnected") {
          scheduleReconnect(5000);
        } else if (nextPeer.connectionState === "failed") {
          scheduleReconnect(750);
        }
      };
      nextPeer.addTransceiver("audio", { direction: "recvonly" });
      const offer = await nextPeer.createOffer();
      await nextPeer.setLocalDescription(offer);
      if (!channel.send({
        type: "offer",
        sessionId: opts.sessionId,
        from: attemptClientId,
        to: "host-" + opts.sessionId,
        description: descriptionToJson(nextPeer.localDescription)
      })) {
        throw new Error("The live audio signaling channel is reconnecting.");
      }
      offerSent = true;
      earlyLocalCandidates.splice(0).forEach(sendCandidate);
      handshakeTimer = globalThis.setTimeout(() => {
        if (peer === nextPeer && nextPeer.connectionState !== "connected") scheduleReconnect(0);
      }, 16000);
    } catch (error) {
      if (peer && clientId === attemptClientId) {
        clearRemoteTrackHandlers();
        peer.onconnectionstatechange = null;
        peer.onicecandidate = null;
        peer.ontrack = null;
        peer.close();
        peer = null;
        iceQueue = null;
      }
      scheduleReconnect();
    } finally {
      startingPeer = false;
    }
  };

  handleSignal = async message => {
    if (!message || message.sessionId !== opts.sessionId) return;
    if (message.type === "ended") {
      if (opts.onStatus) opts.onStatus("ended");
      return;
    }
    if (message.to !== clientId) return;
    if (message.type === "candidate") {
      if (message.candidate) {
        if (iceQueue) void iceQueue.addRemoteCandidate(message.candidate).catch(() => {});
        else earlyRemoteCandidates.push(message.candidate);
      }
      return;
    }
    if (message.type === "full") {
      failInitialConnection(new Error("The broadcast has reached its listener limit. Please try again later."));
      return;
    }
    if (message.type === "failed") {
      scheduleReconnect(500);
      return;
    }
    if (message.type === "restart-start" && peer && iceQueue &&
        message.from === "host-" + opts.sessionId) {
      iceQueue.beginRemoteDescription();
      return;
    }
    if (message.type === "restart-cancel" && peer && iceQueue &&
        message.from === "host-" + opts.sessionId) {
      await iceQueue.restoreRemoteDescription();
      return;
    }
    if (message.type === "restart-offer" && peer && iceQueue &&
        message.from === "host-" + opts.sessionId) {
      try {
        if (peer.signalingState !== "stable") return;
        await iceQueue.setRemoteDescription(message.description);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        channel.send({
          type: "restart-answer",
          sessionId: opts.sessionId,
          from: clientId,
          to: "host-" + opts.sessionId,
          description: descriptionToJson(peer.localDescription)
        });
      } catch (error) {
        scheduleReconnect(500);
      }
      return;
    }
    if (message.type === "answer" && peer && iceQueue && peer.signalingState === "have-local-offer") {
      try {
        await iceQueue.setRemoteDescription(message.description);
        clearTimer("handshake");
        reconnectAttempts = 0;
        finishConnected();
      } catch (error) {
        scheduleReconnect(500);
      }
    }
  };

  try {
    startupTimer = globalThis.setTimeout(() => {
      failInitialConnection(new Error("Live audio could not reconnect. Check your internet connection and try again."));
    }, 60000);
    await startPeer(false);
    await connected;
  } catch (error) {
    closed = true;
    clearTimer("reconnect");
    clearTimer("handshake");
    clearTimer("startup");
    clearRemoteTrackHandlers();
    if (peer) {
      peer.onconnectionstatechange = null;
      peer.onicecandidate = null;
      peer.ontrack = null;
      peer.close();
    }
    channel.close();
    throw error;
  }

  return {
    get clientId() { return clientId; },
    async stop() {
      if (closed) return;
      closed = true;
      clearTimer("reconnect");
      clearTimer("handshake");
      clearTimer("startup");
      clearRemoteTrackHandlers();
      channel.send({ type: "leave", sessionId: opts.sessionId, from: clientId, to: "host-" + opts.sessionId });
      if (peer) {
        peer.onconnectionstatechange = null;
        peer.onicecandidate = null;
        peer.ontrack = null;
        peer.close();
      }
      channel.close();
      opts.audioElement.pause();
      opts.audioElement.srcObject = null;
      if (opts.onStatus) opts.onStatus("disconnected");
    }
  };
}
