import { copyFile, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const androidApp = path.join(root, "android/app");
const manifestPath = path.join(androidApp, "src/main/AndroidManifest.xml");
const gradlePath = path.join(androidApp, "build.gradle");
const manifest = await readFile(manifestPath, "utf8");
const gradle = await readFile(gradlePath, "utf8");

function versionCode(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) throw new Error(`Invalid package version: ${version}`);
  if (Number(match[2]) > 999 || Number(match[3]) > 999) {
    throw new Error("Android versionCode mapping supports minor and patch numbers up to 999.");
  }
  const code = Number(match[1]) * 1000000 + Number(match[2]) * 1000 + Number(match[3]);
  if (code > 2100000000) throw new Error(`Version ${version} exceeds Android's versionCode limit.`);
  return code;
}

const versionName = packageJson.version;
const code = versionCode(versionName);
const patchedGradle = gradle
  .replace(/versionCode\s+\d+/, `versionCode ${code}`)
  .replace(/versionName\s+"[^"]+"/, `versionName "${versionName}"`);

if (!patchedGradle.includes(`versionCode ${code}`) || !patchedGradle.includes(`versionName "${versionName}"`)) {
  throw new Error("Could not set Android versionName/versionCode in the generated Gradle file.");
}

const permission = '<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />';
const patchedManifest = manifest;
const finalManifest = patchedManifest.includes(permission)
  ? patchedManifest
  : patchedManifest.replace(/(<manifest\b[^>]*>)/, `$1\n    ${permission}`);

await writeFile(gradlePath, patchedGradle);
await writeFile(manifestPath, finalManifest);
const xmlDir = path.join(androidApp, "src/main/res/xml");
await mkdir(xmlDir, { recursive: true });
await writeFile(path.join(xmlDir, "file_paths.xml"), `<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <files-path name="files" path="." />
    <cache-path name="cache" path="." />
    <external-files-path name="external-files" path="." />
    <external-cache-path name="external-cache" path="." />
</paths>
`);

const androidRes = path.join(androidApp, "src/main/res");
const launcherDensities = ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"];
for (const density of launcherDensities) {
  const sourceDir = path.join(root, "assets/android-icons", `mipmap-${density}`);
  const targetDir = path.join(androidRes, `mipmap-${density}`);
  await mkdir(targetDir, { recursive: true });
  for (const filename of ["ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png"]) {
    await copyFile(path.join(sourceDir, filename), path.join(targetDir, filename));
  }
}

const adaptiveIconsDir = path.join(androidRes, "mipmap-anydpi-v26");
await mkdir(adaptiveIconsDir, { recursive: true });
const adaptiveIcon = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
await writeFile(path.join(adaptiveIconsDir, "ic_launcher.xml"), adaptiveIcon);
await writeFile(path.join(adaptiveIconsDir, "ic_launcher_round.xml"), adaptiveIcon);

const valuesDir = path.join(androidRes, "values");
await mkdir(valuesDir, { recursive: true });
await writeFile(path.join(valuesDir, "ic_launcher_background.xml"), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#60366F</color>
</resources>
`);

if (process.env.ANDROID_KEYSTORE_PATH) {
  const releaseBlock = `
    signingConfigs {
        release {
            storeFile file(System.getenv("ANDROID_KEYSTORE_PATH"))
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD")
        }
    }
`;
  if (!patchedGradle.includes("signingConfigs {")) {
    const withSigning = patchedGradle.replace(/(android\s*\{)/, `$1${releaseBlock}`);
    const releaseBuildType = /buildTypes\s*\{\s*release\s*\{/;
    if (!releaseBuildType.test(withSigning)) {
      throw new Error("Could not locate the generated Android release build type.");
    }
    const withReleaseSigning = withSigning.replace(releaseBuildType, "$&\n            signingConfig signingConfigs.release");
    await writeFile(gradlePath, withReleaseSigning);
  }
}

console.log(`Prepared Android version ${versionName} (${code}).`);
console.log("Applied Consolation Evangelical and Revival Church launcher icons.");
