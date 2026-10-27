import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const read = (name) => readFile(new URL("../" + name, import.meta.url), "utf8");
const run = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

test("public homepage welcomes visitors and explains the Android hymnal app", async () => {
  const home = await read("index.html");
  assert.ok(home.includes("Welcome to Consolation Ministry"));
  assert.ok(home.includes("Matthew 18:20"));
  assert.ok(home.includes("Philippians 4:6"));
  assert.ok(home.includes('id="android-download"'));
  const androidLink = home.match(/<a id="android-download"[^>]*>/)?.[0] || "";
  assert.ok(androidLink.includes('href="./consolation-hymnal-android.apk" download="consolation-hymnal-android.apk"'));
  assert.ok(!androidLink.includes("github.com"));
  assert.ok(home.includes("Your APK download is starting."));
  assert.ok(home.includes("choose Open with"));
  assert.ok(home.includes('href="./hymnal.html"'));
  assert.ok(home.includes('id="app-features"'));
  assert.ok(home.includes('id="install-guide"'));
  assert.ok(home.includes("English and Yorùbá"));
  assert.ok(home.includes("Sunday Service"));
  assert.ok(home.includes("mailto:Consolationministry123@gmail.com"));
  assert.ok(home.includes("mailto:dev@darapet.name.ng"));
  assert.ok(home.includes("Daraoet Technology"));
  assert.ok(home.includes("Release history"));
  assert.ok(!home.includes('id="pwa-install"'));
  assert.ok(!home.includes("beforeinstallprompt"));
});
test("hero and About copy animate with an accessible welcome carousel", async () => {
  const home = await read("index.html");
  assert.ok(home.includes('aria-roledescription="carousel"'));
  assert.ok(home.includes('id="hero-title-line-one"'));
  assert.ok(home.includes('id="hero-intro-typewriter"'));
  assert.ok(home.includes('id="hero-carousel-prev"'));
  assert.ok(home.includes('id="hero-carousel-next"'));
  assert.ok(home.includes('id="hero-carousel-toggle"'));
  assert.ok(home.includes('id="hero-carousel-announcement"'));
  assert.ok(home.includes("Psalm 46:1 · KJV"));
  assert.ok(home.includes('id="about-title-typewriter"'));
  assert.ok(home.includes('id="about-intro-typewriter"'));
  assert.ok(home.includes('id="about-heart-typewriter"'));
  assert.ok(home.includes("prefers-reduced-motion: reduce"));
  assert.ok(home.includes('addEventListener("focusin"'));
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
