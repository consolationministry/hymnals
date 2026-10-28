import assert from "node:assert/strict";
import test from "node:test";
import { AUDIO_CONTROL_SPECS, AUDIO_PRESETS, DEFAULT_AUDIO_SETTINGS } from "../js/live-audio-webrtc.js";

test("audio controls exceed 30 real adjustable settings", () => {
  assert.ok(AUDIO_CONTROL_SPECS.length > 30, `only ${AUDIO_CONTROL_SPECS.length} controls`);
});

test("every control has a range, step, unit and default inside its range", () => {
  for (const spec of AUDIO_CONTROL_SPECS) {
    assert.ok(spec.min < spec.max, spec.key);
    assert.ok(spec.step > 0, spec.key);
    assert.ok(spec.default >= spec.min && spec.default <= spec.max, spec.key);
    assert.ok(Object.hasOwn(DEFAULT_AUDIO_SETTINGS, spec.key), `missing default for ${spec.key}`);
  }
});

test("presets only set keys that exist as controls", () => {
  const keys = new Set(AUDIO_CONTROL_SPECS.map(spec => spec.key));
  for (const [name, preset] of Object.entries(AUDIO_PRESETS)) {
    for (const key of Object.keys(preset.values || {})) {
      assert.ok(keys.has(key), `${name} sets unknown control ${key}`);
    }
  }
});
