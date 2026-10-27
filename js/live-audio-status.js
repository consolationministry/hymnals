const LIVE_AUDIO_STATUS_MESSAGES = Object.freeze({
  connecting: "Connecting to the live broadcast…",
  connected: "Connected. Waiting for audio from the live source…",
  live: "Live audio is connected.",
  "tap-to-play": "Tap play on the audio player to hear the broadcast.",
  ended: "This broadcast has ended.",
  failed: "The live audio source did not respond. Try again shortly.",
  reconnecting: "Connection interrupted. Reconnecting to the live source…",
  disconnected: "Connection interrupted. Reconnecting to the live source…"
});

export function publicLiveAudioConnectionMessage(status) {
  return LIVE_AUDIO_STATUS_MESSAGES[status] || "Connecting to live audio…";
}

export function publicLiveAudioNetworkIssue(network) {
  if (!network) return null;
  if (network.online === false) {
    return { kind: "network", message: "You appear to be offline. Reconnect, then tap Retry." };
  }

  const effectiveType = String(network.effectiveType || "").toLowerCase();
  const rtt = Number(network.rtt);
  const downlink = Number(network.downlink);
  const slowConnection = effectiveType === "slow-2g" || effectiveType === "2g" ||
    (Number.isFinite(rtt) && rtt >= 1500) ||
    (Number.isFinite(downlink) && downlink > 0 && downlink <= 0.3);
  return slowConnection
    ? { kind: "network", message: "Your network connection may be too weak for live audio. Try a stronger signal, then tap Retry." }
    : null;
}

export function publicLiveAudioJoinError(error, network) {
  const networkIssue = publicLiveAudioNetworkIssue(network);
  if (networkIssue) return networkIssue;
  const detail = String(error && error.message || "");
  if (/listener limit|at capacity|reached its listener limit/i.test(detail)) {
    return { kind: "source", message: "This live broadcast has reached its listener limit. Please try again shortly." };
  }
  if (/network|internet|connection|reconnect|signaling|timeout|timed out|ice/i.test(detail)) {
    return { kind: "network", message: "Your connection to the live broadcast may be unstable. Check your signal or switch networks, then tap Retry." };
  }
  return { kind: "source", message: "The live audio source is not responding yet. It may be reconnecting. Tap Retry in a moment." };
}
