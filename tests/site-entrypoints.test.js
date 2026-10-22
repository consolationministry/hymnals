import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (name) => readFile(new URL("../" + name, import.meta.url), "utf8");

test("public homepage offers app installation and a separate hymn-reader route", async () => {
  const home = await read("index.html");
  assert.ok(home.includes("Get the Android app"));
  assert.ok(home.includes("Proceed to the hymnal"));
  assert.ok(home.includes('href="./hymnal.html"'));
  assert.ok(home.includes("/releases/latest/download/consolation-hymnal-android.apk"));
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
