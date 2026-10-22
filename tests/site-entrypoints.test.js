import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (name) => readFile(new URL("../" + name, import.meta.url), "utf8");

test("public homepage offers app installation and a separate hymn-reader route", async () => {
  const home = await read("index.html");
  assert.match(home, /Get the Android app/);
  assert.match(home, /Proceed to the hymnal/);
  assert.match(home, /href="./hymnal.html"/);
  assert.match(home, /releases/latest/download/consolation-hymnal-android.apk/);
});

test("the hymn reader remains the web, PWA, and native Android launch page", async () => {
  const [reader, manifestText, capacitorText] = await Promise.all([
    read("hymnal.html"),
    read("manifest.webmanifest"),
    read("capacitor.config.json")
  ]);
  const manifest = JSON.parse(manifestText);
  const capacitor = JSON.parse(capacitorText);
  assert.match(reader, /./js/app.js/);
  assert.equal(manifest.start_url, "./hymnal.html");
  assert.equal(capacitor.server.appStartPath, "/hymnal.html");
});

test("offline app worker caches the reader and the Vite build emits both pages", async () => {
  const [worker, viteConfig] = await Promise.all([read("service-worker.js"), read("vite.config.js")]);
  assert.match(worker, /"./hymnal.html"/);
  assert.match(viteConfig, /hymnal.html/);
});
