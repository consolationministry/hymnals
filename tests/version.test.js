import test from "node:test";
import assert from "node:assert/strict";
import { ANDROID_APK_ASSET, getAndroidApkRelease, isNewerVersion } from "../js/version.js";

test("Android update checks compare semantic version components", () => {
  assert.equal(isNewerVersion("v1.1.0", "1.0.9"), true);
  assert.equal(isNewerVersion("v1.0.10", "1.0.9"), true);
  assert.equal(isNewerVersion("v1.0.0", "1.0.0"), false);
  assert.equal(isNewerVersion("v1.0.0", "1.1.0"), false);
  assert.equal(isNewerVersion("latest", "1.0.0"), false);
});

test("Android updater accepts only a newer signed APK from this GitHub release", () => {
  const release = {
    tag_name: "v1.1.90",
    html_url: "https://github.com/consolationministry/hymnals/releases/tag/v1.1.90",
    assets: [{
      name: ANDROID_APK_ASSET,
      browser_download_url: "https://github.com/consolationministry/hymnals/releases/download/v1.1.90/consolation-hymnal-android.apk"
    }]
  };
  assert.deepEqual(getAndroidApkRelease(release, "1.1.89"), {
    version: "1.1.90",
    apkUrl: release.assets[0].browser_download_url,
    releaseUrl: release.html_url
  });
  assert.equal(getAndroidApkRelease({ ...release, tag_name: "v1.1.89" }, "1.1.88"), null);
  assert.equal(getAndroidApkRelease(release, "1.1.91"), null);
  assert.equal(getAndroidApkRelease({ ...release, draft: true }, "1.1.89"), null);
  assert.equal(getAndroidApkRelease({ ...release, prerelease: true }, "1.1.89"), null);
  assert.equal(getAndroidApkRelease({ ...release, assets: [{ ...release.assets[0], browser_download_url: "https://attacker.example/update.apk" }] }, "1.1.89"), null);
});
