import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { bumpReleaseFiles, nextReleaseVersion } from "../scripts/bump-version.mjs";

test("release version increments patch, minor, and major versions", () => {
  assert.equal(nextReleaseVersion("1.1.1", "patch"), "1.1.2");
  assert.equal(nextReleaseVersion("1.1.1", "minor"), "1.2.0");
  assert.equal(nextReleaseVersion("1.1.1", "major"), "2.0.0");
});

test("release version rejects invalid versions and bump types", () => {
  assert.throws(() => nextReleaseVersion("1.1", "patch"), /Invalid current version/);
  assert.throws(() => nextReleaseVersion("1.1.1", "prerelease"), /Invalid version increment/);
});

test("release version respects Android versionCode bounds", () => {
  assert.throws(() => nextReleaseVersion("1.1.999", "patch"), /minor and patch numbers up to 999/);
  assert.throws(() => nextReleaseVersion("2100.0.0", "major"), /versionCode limit/);
});

test("release bump synchronizes app, lockfile, and offline-cache versions", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "hymnal-version-test-"));
  await mkdir(path.join(root, "js"));
  try {
    await writeFile(path.join(root, "package.json"), JSON.stringify({ version: "1.1.1" }, null, 2) + "\n");
    await writeFile(path.join(root, "package-lock.json"), JSON.stringify({
      version: "1.1.1",
      packages: { "": { version: "1.1.1" } }
    }, null, 2) + "\n");
    await writeFile(path.join(root, "js/version.js"), 'export const APP_VERSION = "1.1.1";\n');
    await writeFile(path.join(root, "service-worker.js"), 'const CACHE_NAME = "consolation-hymnal-1.1.1";\n');

    assert.equal(await bumpReleaseFiles("patch", root), "1.1.2");
    assert.equal(JSON.parse(await readFile(path.join(root, "package.json"), "utf8")).version, "1.1.2");
    const lock = JSON.parse(await readFile(path.join(root, "package-lock.json"), "utf8"));
    assert.equal(lock.version, "1.1.2");
    assert.equal(lock.packages[""].version, "1.1.2");
    assert.match(await readFile(path.join(root, "js/version.js"), "utf8"), /APP_VERSION = "1\.1\.2"/);
    assert.match(await readFile(path.join(root, "service-worker.js"), "utf8"), /consolation-hymnal-1\.1\.2/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
