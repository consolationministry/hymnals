import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const adminApp = readFileSync(new URL("../admin/js/admin-app.js", import.meta.url), "utf8");

test("Service Planner and Upcoming Programmes have distinct navigation pages", () => {
  assert.match(adminApp, /\{ id: "services", label: "Service Planner"/);
  assert.match(adminApp, /\{ id: "programs", label: "Upcoming Programmes"/);
  assert.match(adminApp, /else if \(state\.activeView === "services"\) renderServiceWorkspace\(\);\s*else if \(state\.activeView === "programs"\) renderProgramWorkspace\(\);/);
  assert.match(adminApp, /make\("h1", "", "Service Planner"\)/);
  assert.match(adminApp, /make\("h1", "", "Upcoming Programmes"\)/);
  assert.match(adminApp, /\["Open Service Planner", "calendar", "navigate", "services"\]/);
  assert.match(adminApp, /\["Open Upcoming Programmes", "event", "navigate", "programs"\]/);
});
