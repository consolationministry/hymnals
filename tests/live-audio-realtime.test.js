import assert from "node:assert/strict";
import { test } from "node:test";
import { connectLiveAudioChannel } from "../js/live-audio-realtime.js";

const PROGRAM_ID = "11111111-1111-4111-8111-111111111111";
const SESSION_ID = "22222222-2222-4222-8222-222222222222";

function waitFor(predicate, timeoutMs) {
  const timeout = Number(timeoutMs) || 1000;
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      if (predicate()) {
        resolve();
      } else if (Date.now() - startedAt >= timeout) {
        reject(new Error("Timed out waiting for the fake signaling socket."));
      } else {
        setTimeout(check, 2);
      }
    };
    check();
  });
}

test("live audio signaling rejoins after its WebSocket drops", async () => {
  class FakeWebSocket {
    static instances = [];

    constructor() {
      this.readyState = 0;
      this.listeners = new Map();
      FakeWebSocket.instances.push(this);
      queueMicrotask(() => {
        this.readyState = 1;
        this.emit("open");
      });
    }

    addEventListener(type, listener) {
      const listeners = this.listeners.get(type) || [];
      listeners.push(listener);
      this.listeners.set(type, listeners);
    }

    emit(type, event) {
      (this.listeners.get(type) || []).forEach(listener => listener(event || {}));
    }

    send(rawFrame) {
      const frame = JSON.parse(rawFrame);
      if (frame.event !== "phx_join") return;
      queueMicrotask(() => {
        this.emit("message", {
          data: JSON.stringify({
            topic: frame.topic,
            event: "phx_reply",
            ref: frame.ref,
            payload: { status: "ok" }
          })
        });
      });
    }

    close() {
      if (this.readyState === 3) return;
      this.readyState = 3;
      queueMicrotask(() => this.emit("close"));
    }
  }

  FakeWebSocket.instances = [];
  const statuses = [];
  const channel = await connectLiveAudioChannel(PROGRAM_ID, SESSION_ID, {
    WebSocket: FakeWebSocket,
    reconnectBaseDelayMs: 5,
    reconnectMaxDelayMs: 15,
    connectTimeoutMs: 1000,
    onStatus: status => statuses.push(status)
  });

  assert.equal(channel.connected, true);
  FakeWebSocket.instances[0].close();
  await waitFor(() => FakeWebSocket.instances.length >= 2 && channel.connected);

  assert.equal(channel.connected, true);
  assert.ok(statuses.includes("reconnecting"));
  assert.equal(statuses.filter(status => status === "connected").length, 2);
  channel.close();
  assert.equal(channel.closed, true);
});
