import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../css/style.css", import.meta.url), "utf8");

test("programme cards open a single-post detail view from the title", () => {
  assert.match(appSource, /data-action="open-programme"/);
  assert.match(appSource, /else if \(action === "open-programme"\) openProgrammePost/);
  assert.match(appSource, /data-action="close-programme"/);
  assert.match(appSource, /renderProgrammeCard\(selected, true\)/);
});

test("programme category is a clickable filter with hover and active states", () => {
  assert.match(appSource, /data-action="filter-programme-category"/);
  assert.match(appSource, /else if \(action === "filter-programme-category"\) showProgrammeCategory/);
  assert.match(styleSource, /\.public-program-post-category:hover \{/);
  assert.match(styleSource, /\.public-program-post-category:active \{/);
  assert.match(styleSource, /\.public-program-post-title-button:hover \{/);
  assert.match(styleSource, /\.public-program-post-title-button:active \{/);
});

test("programme cards use the app logo as the avatar and a fixed-height cover image", () => {
  assert.match(appSource, /class="public-program-post-avatar" src="\.\/assets\/consolation-launcher\.png"/);
  assert.match(styleSource, /\.public-program-post-media \{ display: block; width: 100%; height: 260px;/);
  assert.match(styleSource, /\.public-program-post-flyer \{[^}]*object-fit: cover;/);
});

test("programme date sits under the title and the detail page shows venue and ministers", () => {
  // Date is part of the header, under the title, like Facebook's timestamp line.
  assert.match(appSource, /'<\/div>' \+ categoryMarkup \+ '<\/header>'/);
  assert.match(appSource, /eventDate \+ '<\/div>' \+ categoryMarkup/);
  assert.match(styleSource, /\.public-program-post-event-date \{ display: block;[^}]*color: var\(--muted\);/);
  // Detail view: Venue then Ministers, shown below the image and above the votes.
  assert.match(appSource, /<span class=\"public-program-detail-title\">Venue<\/span>/);
  assert.match(appSource, /<span class=\"public-program-detail-title\">Ministers<\/span>/);
  assert.match(appSource, /media \+ detailsBlock \+ renderProgrammeInteractions\(program\)/);
  assert.match(styleSource, /\.public-program-details \{ display: grid;/);
});

test("feed card header never shows the minister or venue", () => {
  // The header markup is built from the title, date and category only.
  assert.doesNotMatch(appSource, /public-program-post-minister/);
  assert.doesNotMatch(appSource, /public-program-post-venue/);
  assert.doesNotMatch(appSource, /const eventMetadata = ministerMarkup/);
  assert.match(appSource, /const header = '<header class="public-program-post-header">/);
});

test("programme header date is a from-to range or a single date, in human form", () => {
  assert.match(appSource, /function programmeShortDate\(value\)/);
  assert.match(appSource, /const monthNames = \["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"\];/);
  assert.match(appSource, /\? "from " \+ startLabel \+ " to " \+ endLabel/);
  assert.match(appSource, /: startLabel;/);
});
