import test from "node:test";
import assert from "node:assert/strict";
import { ANDROID_APK_ASSET, APP_VERSION, getAndroidApkRelease, isNewerVersion } from "../js/version.js";

function nextPatchVersion(version) {
  const parts = version.split(".").map(Number);
  parts[2] += 1;
  return parts.join(".");
}

test("Android update checks compare semantic version components", () => {
  assert.equal(isNewerVersion("v1.1.0", "1.0.9"), true);
  assert.equal(isNewerVersion("v1.0.10", "1.0.9"), true);
  assert.equal(isNewerVersion("v1.0.0", "1.0.0"), false);
  assert.equal(isNewerVersion("v1.0.0", "1.1.0"), false);
  assert.equal(isNewerVersion("latest", "1.0.0"), false);
});

test("Android updater accepts only a newer signed APK from this GitHub release", () => {
  const nextVersion = nextPatchVersion(APP_VERSION);
  const release = {
    tag_name: "v" + nextVersion,
    html_url: "https://github.com/consolationministry/hymnals/releases/tag/v" + nextVersion,
    assets: [{
      name: ANDROID_APK_ASSET,
      browser_download_url: "https://github.com/consolationministry/hymnals/releases/download/v" + nextVersion + "/consolation-hymnal-android.apk"
    }]
  };
  assert.deepEqual(getAndroidApkRelease(release, APP_VERSION), {
    version: nextVersion,
    apkUrl: release.assets[0].browser_download_url,
    releaseUrl: release.html_url
  });
  assert.equal(getAndroidApkRelease({ ...release, tag_name: "v" + APP_VERSION }, APP_VERSION), null);
  assert.equal(getAndroidApkRelease(release, nextPatchVersion(nextVersion)), null);
  assert.equal(getAndroidApkRelease({ ...release, draft: true }, APP_VERSION), null);
  assert.equal(getAndroidApkRelease({ ...release, prerelease: true }, APP_VERSION), null);
  assert.equal(getAndroidApkRelease({ ...release, assets: [{ ...release.assets[0], browser_download_url: "https://attacker.example/update.apk" }] }, APP_VERSION), null);
});
