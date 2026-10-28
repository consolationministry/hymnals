import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const adminApp = readFileSync(new URL("../admin/js/admin-app.js", import.meta.url), "utf8");
const memberApp = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const liveAudioViews = readFileSync(new URL("../js/live-audio-views.js", import.meta.url), "utf8");
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

test("Upcoming Programmes renders centered social-feed cards with flyers and voting", () => {
  assert.match(memberContent, /programmeSortTime/);
  assert.match(memberContent, /return programmeSortTime\(right\) - programmeSortTime\(left\)/);
  assert.match(memberApp, /function programmeCategory\(program\) \{/);
  assert.match(memberApp, /class="public-program-post-category"/);
  assert.match(memberApp, /data-action="open-programme"/);
  assert.match(memberApp, /const minister = repairMojibake\(String\(program && program\.minister \|\| \"\"\)\)\.trim\(\);/);
  assert.match(memberApp, /const eventDate = dateLabel/);
  assert.match(memberApp, /class="public-program-post-flyer"/);
  assert.match(memberApp, /return '<article class="public-program-post' \+ \(detail/);
  assert.match(memberApp, /class="public-program-post-description"/);
  assert.match(memberApp, /header \+ eventMetadata \+ descriptionSection \+ media \+ detailsBlock \+ renderProgrammeInteractions\(program\) \+ '<\/article>'/);
  assert.doesNotMatch(memberApp, /Church programme|public-program-post-kicker/);
  assert.match(memberStyles, /\.public-program-post-header/);
  assert.match(memberStyles, /\.public-program-post-flyer\s*\{[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*object-fit:\s*cover;/);
  assert.match(memberStyles, /\.public-program-list\s*\{[^}]*width:\s*min\(100%, 720px\);[^}]*max-width:\s*100%;/);
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
