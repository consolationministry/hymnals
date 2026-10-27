import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const read = (name) => readFile(new URL("../" + name, import.meta.url), "utf8");
const run = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

test("public homepage offers native APK download and a browser-managed PWA install", async () => {
  const home = await read("index.html");
  assert.ok(home.includes("Download Android app"));
  assert.ok(home.includes("Proceed to the hymnal"));
  assert.ok(home.includes('href="./hymnal.html"'));
  const androidLink = home.match(/<a id="android-download"[^>]*>/)?.[0] || "";
  assert.ok(androidLink.includes('href="./consolation-hymnal-android.apk" download="consolation-hymnal-android.apk"'));
  assert.ok(!androidLink.includes("github.com"));
  assert.ok(home.includes('id="pwa-install"'));
  assert.ok(home.includes('id="pwa-steps"'));
  assert.ok(home.includes("beforeinstallprompt"));
  assert.ok(home.includes("deferredPrompt.prompt()"));
  assert.ok(home.includes('"appinstalled"'));
  assert.ok(home.includes("Add to Home Screen"));
  assert.ok(home.includes("Android keeps the final say."));
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

test("Pages build includes the admin workspace and its runtime dependencies", async () => {
  await run(process.execPath, ["node_modules/vite/bin/vite.js", "build"], { cwd: repositoryRoot });
  await run(process.execPath, ["scripts/build-web.mjs"], { cwd: repositoryRoot });

  const files = [
    "admin/index.html",
    "admin/css/admin.css",
    "admin/css/live-audio-admin.css",
    "admin/js/admin-app.js",
    "admin/js/cloudinary-settings.js",
    "js/hymnal-selection.js",
    "js/cloudinary-live-audio.js",
    "js/live-audio-recording.js",
    "js/live-audio-realtime.js",
    "js/live-audio-webrtc.js",
    "data/uploaded-hymns.js",
    "data/uploaded-yoruba-hymns.js",
    "assets/demo-church-mark.svg"
  ];
  await Promise.all(files.map(file => access(new URL("../dist/" + file, import.meta.url))));

  const worker = await read("dist/service-worker.js");
  for (const file of files) assert.ok(worker.includes("./" + file), file + " should be precached");
});

test("Pages deploys the signed APK alongside the website after a release", async () => {
  const workflow = await read(".github/workflows/deploy-pages.yml");
  assert.ok(workflow.includes("workflow_dispatch:"));
  assert.ok(workflow.includes('workflows: ["Android signed release"]'));
  assert.ok(workflow.includes("gh release download --repo"));
  assert.ok(workflow.includes("actions/upload-pages-artifact@v3"));
  assert.ok(workflow.includes("actions/deploy-pages@v4"));
});
