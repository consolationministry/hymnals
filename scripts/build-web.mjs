import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = path.join(root, "dist");
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const versionSource = await readFile(path.join(root, "js/version.js"), "utf8");
const workerTemplate = await readFile(path.join(root, "public/service-worker.js"), "utf8");
const appVersion = versionSource.match(/APP_VERSION\s*=\s*"([^"]+)"/)?.[1];
if (appVersion !== packageJson.version) {
  throw new Error(`package.json version (${packageJson.version}) and js/version.js (${appVersion || "missing"}) must match.`);
}

await mkdir(path.join(dist, "assets"), { recursive: true });
await copyFile(path.join(root, "assets/demo-church-mark.svg"), path.join(dist, "assets/demo-church-mark.svg"));
await copyFile(path.join(root, "manifest.webmanifest"), path.join(dist, "manifest.webmanifest"));
const sourceWorker = await readFile(path.join(root, "service-worker.js"), "utf8");
if (!sourceWorker.includes(`consolation-hymnal-${packageJson.version}`)) {
  throw new Error(`service-worker.js cache version must match package.json (${packageJson.version}).`);
}

async function collectFiles(directory, relative = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const childRelative = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(path.join(directory, entry.name), childRelative));
    } else if (entry.name !== "service-worker.js" && !entry.name.endsWith(".map")) {
      files.push("./" + childRelative);
    }
  }
  return files;
}

const precacheUrls = await collectFiles(dist);
const worker = workerTemplate
  .replace("__CACHE_NAME__", `consolation-hymnal-${packageJson.version}`)
  .replace("__PRECACHE_URLS__", JSON.stringify(precacheUrls));
await writeFile(path.join(dist, "service-worker.js"), worker);

console.log(`Prepared ${precacheUrls.length} offline app files for version ${packageJson.version}.`);
