import test from "node:test";
import assert from "node:assert/strict";
import { ANDROID_WEB_BUNDLE_ASSET, getAndroidWebBundle, isNewerVersion } from "../js/version.js";

test("Android update checks compare semantic version components", () => {
  assert.equal(isNewerVersion("v1.1.0", "1.0.9"), true);
  assert.equal(isNewerVersion("v1.0.10", "1.0.9"), true);
  assert.equal(isNewerVersion("v1.0.0", "1.0.0"), false);
  assert.equal(isNewerVersion("v1.0.0", "1.1.0"), false);
  assert.equal(isNewerVersion("latest", "1.0.0"), false);
});

test("Android OTA updates accept only a newer public GitHub web bundle", () => {
  const release = {
    tag_name: "v1.2.0",
    html_url: "https://github.com/consolationministry/hymnals/releases/tag/v1.2.0",
    assets: [{
      name: ANDROID_WEB_BUNDLE_ASSET,
      browser_download_url: "https://github.com/consolationministry/hymnals/releases/download/v1.2.0/consolation-hymnal-android-web.zip"
    }]
  };
  assert.deepEqual(getAndroidWebBundle(release), {
    version: "1.2.0",
    bundleUrl: release.assets[0].browser_download_url,
    releaseUrl: release.html_url
  });
  assert.equal(getAndroidWebBundle({ ...release, tag_name: "v1.1.0" }), null);
  assert.equal(getAndroidWebBundle({ ...release, draft: true }), null);
  assert.equal(getAndroidWebBundle({ ...release, prerelease: true }), null);
  assert.equal(getAndroidWebBundle({
    ...release,
    assets: [{ ...release.assets[0], browser_download_url: "https://attacker.example/update.zip" }]
  }), null);
});
