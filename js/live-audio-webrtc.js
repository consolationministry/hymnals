import { connectLiveAudioChannel, createLiveAudioId, makeAudioPeerConnection, waitForIceGatheringComplete } from "./live-audio-realtime.js";

export const DEFAULT_AUDIO_SETTINGS = Object.freeze({
  bass: 0,
  mid: 0,
  treble: 0,
  pitch: 0,
  gain: 0
});

function clamp(value, min, max) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : 0;
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
    rawStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false, channelCount: 1 }
    });
  } catch (error) {
    if (error && (error.name === "OverconstrainedError" || error.name === "ConstraintNotSatisfiedError")) {
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
    highPass.frequency.value = 75;
    highPass.Q.value = 0.7;
    const bass = context.createBiquadFilter();
    bass.type = "lowshelf";
    bass.frequency.value = 160;
    const mid = context.createBiquadFilter();
    mid.type = "peaking";
    mid.frequency.value = 1100;
    mid.Q.value = 0.85;
    const treble = context.createBiquadFilter();
    treble.type = "highshelf";
    treble.frequency.value = 5200;
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 12;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.16;
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
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.72;
    const destination = context.createMediaStreamDestination();
    source.connect(highPass);
    highPass.connect(bass);
    bass.connect(mid);
    mid.connect(treble);
    treble.connect(compressor);
    if (pitchNode) {
      compressor.connect(pitchNode);
      pitchNode.connect(gain);
    } else {
      compressor.connect(gain);
    }
    gain.connect(analyser);
    analyser.connect(destination);

    const nodes = { bass, mid, treble, gain, pitchNode };
    const setSettings = values => {
      const settings = Object.assign({}, DEFAULT_AUDIO_SETTINGS, values || {});
      nodes.bass.gain.setTargetAtTime(clamp(settings.bass, -12, 12), context.currentTime, 0.025);
      nodes.mid.gain.setTargetAtTime(clamp(settings.mid, -12, 12), context.currentTime, 0.025);
      nodes.treble.gain.setTargetAtTime(clamp(settings.treble, -12, 12), context.currentTime, 0.025);
      nodes.gain.gain.setTargetAtTime(Math.pow(10, clamp(settings.gain, -12, 6) / 20), context.currentTime, 0.025);
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
  let channel = null;
  let closed = false;
  let handleSignal = null;
  channel = await connectLiveAudioChannel(opts.programId, opts.sessionId, {
    onStatus: status => { if (opts.onStatus) opts.onStatus(status); },
    onSignal: message => { if (handleSignal) void handleSignal(message); }
  });

  const closePeer = clientId => {
    const peer = peers.get(clientId);
    if (!peer) return;
    peers.delete(clientId);
    peer.onconnectionstatechange = null;
    peer.close();
    if (opts.onListenerCount) opts.onListenerCount(peers.size);
  };

  handleSignal = async message => {
    if (!message || message.sessionId !== opts.sessionId) return;
    if (message.type === "leave" && message.to === localClientId) {
      closePeer(message.from);
      return;
    }
    if (message.type !== "offer" || message.to !== localClientId || peers.has(message.from)) return;
    const limit = Math.max(1, Number(opts.maxListeners) || 16);
    if (peers.size >= limit) {
      channel.send({ type: "full", sessionId: opts.sessionId, from: localClientId, to: message.from });
      return;
    }
    try {
      const peer = makeAudioPeerConnection();
      peers.set(message.from, peer);
      opts.stream.getAudioTracks().forEach(track => peer.addTrack(track, opts.stream));
      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "failed" || peer.connectionState === "closed") closePeer(message.from);
        else if (opts.onListenerCount) opts.onListenerCount(peers.size);
      };
      await peer.setRemoteDescription(message.description);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      await waitForIceGatheringComplete(peer);
      channel.send({
        type: "answer",
        sessionId: opts.sessionId,
        from: localClientId,
        to: message.from,
        description: descriptionToJson(peer.localDescription)
      });
      if (opts.onListenerCount) opts.onListenerCount(peers.size);
    } catch (error) {
      closePeer(message.from);
      channel.send({ type: "failed", sessionId: opts.sessionId, from: localClientId, to: message.from });
    }
  };

  return {
    get listenerCount() { return peers.size; },
    async stop() {
      if (closed) return;
      closed = true;
      channel.send({ type: "ended", sessionId: opts.sessionId, from: localClientId });
      Array.from(peers.keys()).forEach(closePeer);
      channel.close();
      if (opts.onStatus) opts.onStatus("disconnected");
    }
  };
}

export async function startLiveAudioListener(options) {
  const opts = options || {};
  if (!opts.programId || !opts.sessionId || !opts.audioElement) throw new Error("This broadcast is missing its live player.");
  const clientId = createLiveAudioId();
  let peer = null;
  let channel = null;
  let closed = false;
  let resolveConnected;
  let rejectConnected;
  const connected = new Promise((resolve, reject) => {
    resolveConnected = resolve;
    rejectConnected = reject;
  });
  channel = await connectLiveAudioChannel(opts.programId, opts.sessionId, {
    onStatus: status => { if (opts.onStatus) opts.onStatus(status); },
    onSignal: async message => {
      if (!message || message.sessionId !== opts.sessionId || message.to !== clientId) {
        if (message && message.sessionId === opts.sessionId && message.type === "ended" && opts.onStatus) {
          opts.onStatus("ended");
        }
        return;
      }
      if (message.type === "full") {
        rejectConnected(new Error("The broadcast has reached its listener limit. Please try again later."));
        return;
      }
      if (message.type === "failed") {
        rejectConnected(new Error("This network could not establish a direct WebRTC connection."));
        return;
      }
      if (message.type === "answer" && peer && peer.signalingState === "have-local-offer") {
        try {
          await peer.setRemoteDescription(message.description);
          resolveConnected(true);
        } catch (error) {
          rejectConnected(new Error("The live audio connection could not complete."));
        }
      }
    }
  });
  try {
    peer = makeAudioPeerConnection();
    peer.ontrack = event => {
      const stream = event.streams && event.streams[0]
        ? event.streams[0]
        : new MediaStream([event.track]);
      opts.audioElement.srcObject = stream;
      opts.audioElement.play().catch(() => {
        if (opts.onStatus) opts.onStatus("tap-to-play");
      });
      if (opts.onStatus) opts.onStatus("live");
    };
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "failed") {
        if (opts.onStatus) opts.onStatus("failed");
        rejectConnected(new Error("The direct audio connection failed on this network."));
      } else if (peer.connectionState === "connected" && opts.onStatus) {
        opts.onStatus("live");
      }
    };
    peer.addTransceiver("audio", { direction: "recvonly" });
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    await waitForIceGatheringComplete(peer);
    channel.send({
      type: "offer",
      sessionId: opts.sessionId,
      from: clientId,
      to: "host-" + opts.sessionId,
      description: descriptionToJson(peer.localDescription)
    });
    await Promise.race([
      connected,
      new Promise((_, reject) => setTimeout(() => reject(new Error("No response from the broadcaster. Check whether the programme is still live.")), 20000))
    ]);
  } catch (error) {
    if (peer) peer.close();
    channel.close();
    throw error;
  }

  return {
    clientId,
    async stop() {
      if (closed) return;
      closed = true;
      channel.send({ type: "leave", sessionId: opts.sessionId, from: clientId, to: "host-" + opts.sessionId });
      if (peer) peer.close();
      channel.close();
      opts.audioElement.pause();
      opts.audioElement.srcObject = null;
      if (opts.onStatus) opts.onStatus("disconnected");
    }
  };
}
