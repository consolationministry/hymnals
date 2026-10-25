import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

export function nextReleaseVersion(currentVersion, bump) {
  const match = String(currentVersion).match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Invalid current version: ${currentVersion}. Expected MAJOR.MINOR.PATCH.`);
  }
  if (!["patch", "minor", "major"].includes(bump)) {
    throw new Error(`Invalid version increment: ${bump}. Choose patch, minor, or major.`);
  }

  let [major, minor, patch] = match.slice(1).map(Number);
  if (bump === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (bump === "minor") {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }

  if (minor > 999 || patch > 999) {
    throw new Error("Android versionCode mapping supports minor and patch numbers up to 999.");
  }
  const versionCode = major * 1_000_000 + minor * 1_000 + patch;
  if (versionCode > 2_100_000_000) {
    throw new Error("The next version exceeds Android's versionCode limit.");
  }
  return `${major}.${minor}.${patch}`;
}

export async function bumpReleaseFiles(bump, projectRoot = root) {
  const packagePath = path.join(projectRoot, "package.json");
  const lockPath = path.join(projectRoot, "package-lock.json");
  const versionPath = path.join(projectRoot, "js/version.js");
  const workerPath = path.join(projectRoot, "service-worker.js");

  const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
  const lockJson = JSON.parse(await readFile(lockPath, "utf8"));
  const currentVersion = packageJson.version;
  const nextVersion = nextReleaseVersion(currentVersion, bump);
  const appVersionSource = await readFile(versionPath, "utf8");
  const workerSource = await readFile(workerPath, "utf8");

  if (lockJson.version !== currentVersion || lockJson.packages?.[""]?.version !== currentVersion) {
    throw new Error("package-lock.json is out of sync with package.json. Fix the lockfile before releasing.");
  }

  const appVersion = appVersionSource.match(/^export const APP_VERSION = "([^"]+)";$/m);
  if (!appVersion || appVersion[1] !== currentVersion) {
    throw new Error("js/version.js is out of sync with package.json. Fix the version before releasing.");
  }

  const cacheName = workerSource.match(/^const CACHE_NAME = "consolation-hymnal-([^"]+)";$/m);
  if (!cacheName || cacheName[1] !== currentVersion) {
    throw new Error("service-worker.js is out of sync with package.json. Fix the cache version before releasing.");
  }

  packageJson.version = nextVersion;
  lockJson.version = nextVersion;
  lockJson.packages[""].version = nextVersion;
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
  await writeFile(lockPath, `${JSON.stringify(lockJson, null, 2)}\n`);
  await writeFile(
    versionPath,
    appVersionSource.replace(appVersion[0], `export const APP_VERSION = "${nextVersion}";`)
  );
  await writeFile(
    workerPath,
    workerSource.replace(cacheName[0], `const CACHE_NAME = "consolation-hymnal-${nextVersion}";`)
  );

  return nextVersion;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    const bump = process.argv[2];
    if (!bump) throw new Error("Usage: node scripts/bump-version.mjs patch|minor|major");
    console.log(await bumpReleaseFiles(bump));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
