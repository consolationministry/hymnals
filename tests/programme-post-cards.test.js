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
