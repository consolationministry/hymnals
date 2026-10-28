import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("main app header renders the church branding and search, without the hamburger menu", async () => {
  const appSource = await readFile(new URL("../js/app.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../css/style.css", import.meta.url), "utf8");
  assert.match(appSource, /function renderHeader\(\)/);
  assert.match(appSource, /class="brand-lockup"/);
  assert.match(appSource, /Consolation Evangelical/);
  assert.match(appSource, /data-testid="button-header-search"/);
  assert.doesNotMatch(appSource, /toggle-menu|button-header-menu|header-nav|menuOpen/);
  assert.doesNotMatch(css, /\.header-nav-/);
});
