import test from "node:test";
import assert from "node:assert/strict";
import { isNewerVersion } from "../js/version.js";

test("Android update checks compare semantic version components", () => {
  assert.equal(isNewerVersion("v1.1.0", "1.0.9"), true);
  assert.equal(isNewerVersion("v1.0.10", "1.0.9"), true);
  assert.equal(isNewerVersion("v1.0.0", "1.0.0"), false);
  assert.equal(isNewerVersion("v1.0.0", "1.1.0"), false);
  assert.equal(isNewerVersion("latest", "1.0.0"), false);
});
