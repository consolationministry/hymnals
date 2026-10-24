import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (name) => readFile(new URL("../" + name, import.meta.url), "utf8");

test("public homepage offers app installation and a separate hymn-reader route", async () => {
  const home = await read("index.html");
  assert.ok(home.includes("Download Android app"));
  assert.ok(home.includes("Proceed to the hymnal"));
  assert.ok(home.includes('href="./hymnal.html"'));
  const androidLink = home.match(/<a id="android-download"[^>]*>/)?.[0] || "";
  assert.ok(androidLink.includes('href="./consolation-hymnal-android.apk" download="consolation-hymnal-android.apk"'));
  assert.ok(!androidLink.includes("github.com"));
  assert.ok(home.includes('id="pwa-install"'));
  assert.ok(home.includes('installButton.textContent="How to add to Home Screen"'));
  assert.ok(!home.includes("beforeinstallprompt"));
  assert.ok(!home.includes("deferredPrompt"));
});

test("the hymn reader remains the web, PWA, and native Android launch page", async () => {
  const [reader, manifestText, capacitorText] = await Promise.all([
    read("hymnal.html"),
    read("manifest.webmanifest"),
    read("capacitor.config.json")
  ]);
  const manifest = JSON.parse(manifestText);
  const capacitor = JSON.parse(capacitorText);
  assert.ok(reader.includes("./js/app.js"));
  assert.equal(manifest.start_url, "./hymnal.html");
  assert.equal(capacitor.server.appStartPath, "/hymnal.html");
});

test("offline app worker caches the reader and the Vite build emits both pages", async () => {
  const [worker, viteConfig] = await Promise.all([read("service-worker.js"), read("vite.config.js")]);
  assert.ok(worker.includes('"./hymnal.html"'));
  assert.ok(viteConfig.includes("hymnal.html"));
});

test("Pages deploys the signed APK alongside the website after a release", async () => {
  const workflow = await read(".github/workflows/deploy-pages.yml");
  assert.ok(workflow.includes("workflow_dispatch:"));
  assert.ok(workflow.includes('workflows: ["Android signed release"]'));
  assert.ok(workflow.includes("gh release download --repo"));
  assert.ok(workflow.includes("actions/upload-pages-artifact@v3"));
  assert.ok(workflow.includes("actions/deploy-pages@v4"));
});
