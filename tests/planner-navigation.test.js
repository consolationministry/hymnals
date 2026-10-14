import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const adminApp = readFileSync(new URL("../admin/js/admin-app.js", import.meta.url), "utf8");
const memberApp = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const memberContent = readFileSync(new URL("../js/public-content.js", import.meta.url), "utf8");
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

test("Upcoming Programmes renders a newest-first, full-width flyer and voting feed", () => {
  assert.match(memberContent, /programmeSortTime/);
  assert.match(memberContent, /return programmeSortTime\(right\) - programmeSortTime\(left\)/);
  assert.match(memberApp, /publicPostedDate\(program\.created_at\)/);
  assert.match(memberApp, /class="public-program-post-flyer"/);
  assert.match(memberApp, /return '<article class="public-program-post">/);
  assert.match(memberApp, /class="public-program-post-description"/);
  assert.match(memberApp, /<header class="public-program-post-header"><h2 class="public-program-post-title">' \+ title \+ '<\/h2>' \+ posted \+ '<\/header>' \+ media \+ renderProgrammeInteractions\(program\) \+ '<div class="public-program-post-body">/);
  assert.doesNotMatch(memberApp, /Church programme|public-program-post-kicker/);
  assert.match(memberStyles, /\.public-program-post-header/);
  assert.match(memberStyles, /\.public-program-post-flyer\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*100%;[^}]*max-height:[^;]+;[^}]*height:\s*auto;[^}]*object-fit:\s*contain;/);
  assert.match(memberStyles, /\.public-program-list\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*none;/);
});

test("programme posts keep admin-configured anonymous attendance votes and remove comments", () => {
  assert.match(memberApp, /renderProgrammeInteractions\(program\)/);
  assert.match(memberApp, /data-action="cast-programme-vote"/);
  assert.match(memberApp, /program\.response_question/);
  assert.match(memberApp, /program\.yes_label/);
  assert.match(memberApp, /program\.no_label/);
  assert.match(memberApp, /Voting is temporarily unavailable/);
  assert.doesNotMatch(memberApp, /data-programme-comment-form|programme-comments|submitPublicProgrammeComment|postProgrammeComment|Comment #|Comments are public and posted without a name or account/);
  assert.doesNotMatch(memberApp, /data-action="toggle-programme-like"/);
  assert.match(memberStyles, /\.programme-vote-button/);
  assert.doesNotMatch(memberStyles, /\.programme-comment/);
});
