# Consolation Evangelical and Revival Church Hymnal

The website and Android app use the same mobile-first HTML, CSS, JavaScript, and bundled hymn collection. Capacitor packages that same interface for Android; there is no separate Android screen set to drift out of sync.

## What is included

- Home, Hymn Library, Reader, Favorites, and Settings
- Search by hymn number, title, keyword, first line, or lyrics
- English collection with Yorùbá selection clearly marked where verified text is not available
- Favorites and reading preferences stored locally on the device
- Light, dark, and system appearance modes; adjustable text size and accent
- Sharing through the device share sheet when available
- 197 bundled English hymns, available offline without an account or server
- Offline-capable web app with a service-worker update prompt
- Android app update checks, APK download, and Android installer handoff

The Android app includes all current hymnal files in its package and works offline immediately after installation. The web app caches its files after the first successful online visit; that initial visit needs a connection.

## Run locally

Use Node.js 22 or newer:

```sh
npm ci
npm run dev
```

Serve the repository root with a static server (for example, `python3 -m http.server 8000`) or run `npm run dev`. Do not open `index.html` through `file://`. The website remains deployable from the repository root; `npm run build` also generates the optimized `dist/` bundle used by the Android build.

## Android debug APK

The continuous-integration workflow builds a debug APK artifact on pushes, pull requests, and manual runs. To build locally, install Java 21 and the Android SDK, then run:

```sh
npm ci
npm run build
npx cap add android
npx cap sync android
node scripts/prepare-android.mjs
cd android
./gradlew assembleDebug
```

The debug APK is for testing and sideloading, not a Play Store release.

## In-app Android updates

The Android app checks the latest non-draft GitHub Release when online. If its tag is newer than the installed version and the release includes `consolation-hymnal-android.apk`, the app shows an update prompt, downloads the APK into app-private cache, then opens Android's package installer. Android—not the app—asks the user to confirm the install. The app cannot silently bypass that system prompt.

Signed updates must use the same private keystore for every release. Create and securely back up a keystore once; never commit it. Set `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD` in your local build environment, then run `npm ci`, `npm run build`, `npx cap add android`, `npx cap sync android`, and `node scripts/prepare-android.mjs`. Build with `cd android && ./gradlew assembleRelease`, then upload `android/app/build/outputs/apk/release/app-release.apk` to a GitHub Release as `consolation-hymnal-android.apk`.

The release tag must match `package.json` (currently `v1.1.0`). For each later release, update `package.json`, `js/version.js`, and the cache version in `service-worker.js` together. The first official release may not install over earlier debug APKs if their signatures differ; uninstalling a mismatched test build can erase device-local favorites and settings.

Older test APKs were produced by a separate debug workflow and may not share the release signing key. If Android rejects the first signed update because the signatures differ, install the signed release once from its GitHub Release; uninstalling a mismatched test build can erase its device-local favorites and settings.

Updates require an internet connection. The web app updates its cached files through the service worker; Android app updates replace the installed APK through the Android installer. Neither update path removes local Favorites or preferences when the Android package signature remains the same.

## GitHub Pages

The static website and service worker are in the repository root and can be published from there. Capacitor packages the optimized `dist/` build. Keep the web app and Android app on the same branch so both ship the same interface and hymn data.

## Hymn text and rights

The current 197 English texts are transcribed from Hymnary text-authority records marked Public Domain and associated with *Pentecostal Hymns No. 1* (1894). The app preserves original hymn numbers and links to individual source pages. The source's designation and the 1894 publication date do not establish status in every country; verify local rights before distribution outside the United States. The target is 250 hymns, but entries without clean transcripts and an explicit Public Domain designation are intentionally omitted. No Yorùbá translations are invented or included. Source details are in `data/SOURCES.md`.

Favorites and preferences are stored only in the current browser/device; they do not sync between devices. This phase does not include accounts, an admin panel, audio, service planning, or projector mode.
