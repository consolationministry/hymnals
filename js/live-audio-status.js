const LIVE_AUDIO_STATUS_MESSAGES = Object.freeze({
  connected: "Connected to the church room. Waiting for audio…",
  live: "Live audio is connected.",
  "tap-to-play": "Tap play on the audio player to hear the broadcast.",
  ended: "This broadcast has ended.",
  failed: "We couldn't connect to the live broadcast. Please try again or switch networks.",
  disconnected: "The live audio connection was interrupted."
});

export function publicLiveAudioConnectionMessage(status) {
  return LIVE_AUDIO_STATUS_MESSAGES[status] || "Connecting to live audio…";
}
