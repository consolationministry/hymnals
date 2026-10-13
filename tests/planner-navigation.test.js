import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const adminApp = readFileSync(new URL("../admin/js/admin-app.js", import.meta.url), "utf8");
const memberApp = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const memberStyles = readFileSync(new URL("../css/style.css", import.meta.url), "utf8");

test("Service Planner and Upcoming Programmes have distinct navigation pages", () => {
  assert.match(adminApp, /\{ id: "services", label: "Service Planner"/);
  assert.match(adminApp, /\{ id: "programs", label: "Upcoming Programmes"/);
  assert.match(adminApp, /else if \(state\.activeView === "services"\) renderServiceWorkspace\(\);\s*else if \(state\.activeView === "programs"\) renderProgramWorkspace\(\);/);
  assert.match(adminApp, /make\("h1", "", "Service Planner"\)/);
  assert.match(adminApp, /make\("h1", "", "Upcoming Programmes"\)/);
  assert.match(adminApp, /\["Open Service Planner", "calendar", "navigate", "services"\]/);
  assert.match(adminApp, /\["Open Upcoming Programmes", "event", "navigate", "programs"\]/);
});

test("Member app has separate programme and service pages in its menus", () => {
  assert.match(memberApp, /\["programs", "Upcoming Programmes"\]/);
  assert.match(memberApp, /\["services", "Service Plans"\]/);
  assert.match(memberApp, /\["programs", "Programs", "sparkle"\]/);
  assert.match(memberApp, /\["services", "Services", "calendar"\]/);
  assert.match(memberApp, /else if \(state\.view === "programs"\) main\.innerHTML = renderPublicProgramsPage\(\);\s*else if \(state\.view === "services"\) main\.innerHTML = renderPublicServicePlansPage\(\);/);
  assert.match(memberApp, /renderPublicPrograms\(content\.programs, content\.programsAvailable\)/);
  assert.match(memberApp, /renderPublicServicePlans\(content\.servicePlans, content\.servicePlansAvailable\)/);
  assert.match(memberStyles, /grid-template-columns: repeat\(7, minmax\(0, 1fr\)\)/);
});
