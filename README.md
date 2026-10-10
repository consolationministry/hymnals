# Consolation Evangelical and Revival Church Hymnal

The website and Android app use the same mobile-first HTML, CSS, JavaScript, and bundled hymn collection. Capacitor packages that same interface for Android; there is no separate Android screen set to drift out of sync.

## What is included

- Home, Hymn Library, Reader, Favorites, and Settings
- Search by hymn number, title, keyword, first line, or lyrics
- Separate CAC Gospel Hymn Book (English, 1,000 distinct hymns shown) and CAC Yoruba Hymn Book (Yorùbá, 997 hymns)
- Favorites and reading preferences stored locally on the device
- Light, dark, and system appearance modes; adjustable text size and accent
- Sharing through the device share sheet when available
- 1,000 distinct English and 997 Yorùbá hymns bundled for offline reading
- Offline-capable web app with a service-worker update prompt
- Android app update checks, APK download, and Android installer handoff
- A separate, administrator-only web workspace at `/admin/`
- Published hymns from all collections, plus programs and service plans from any date, can load in the public web app and Android app from Supabase

The member web app and Android app need a successful online visit to fetch the published hymn list. After that, published hymns and the program/service-plan schedule are cached for offline use. If no published list has been fetched or cached, the hymn library remains empty rather than falling back to the bundled catalog.
The member web app and Android app use the same public content service. After applying migrations `202610090002_public_published_hymns.sql`, `202610090003_public_programs_and_service_plans.sql`, and `202610110001_public_program_history.sql`, members can read published hymn fields and the listed program/service-plan display fields for any date. Past entries are labeled in the member app. The hymn loader includes all records marked published, regardless of collection, and never substitutes the full bundled catalog. Draft hymns and admin preferences stay private. Administrators should confirm source attribution and publishing permission before marking additional material as published. Existing Supabase rows are not changed by these migrations, and a populated legacy hymn table still requires an authorized administrator to replace its records.

The admin workspace is a separate web page at `/admin/`. It requires an approved administrator account and the Supabase setup below. Hymn editing, program editing, service-plan editing, and admin preferences stay protected there; published hymns and date-independent program/service-plan display data appear in the member app. Attendance responses and analytics are not connected.

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

Signed Android releases are built by `.github/workflows/android-release.yml` when a version tag such as `v1.1.6` is pushed. Configure the GitHub Actions secrets `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD`; the workflow decodes the keystore only on the runner, builds the signed APK, and attaches it to the GitHub Release as `consolation-hymnal-android.apk`. Keep the same private keystore for every release, back it up securely, and never commit it.

The signed-release workflow keeps `package.json`, `package-lock.json`, `js/version.js`, the service-worker cache, and release tag synchronized when it publishes a signed APK. A pull request or feature-branch build alone does not publish an app update; members receive the update only after the change is merged to `main` and the signed-release workflow completes. The first official release may not install over earlier debug APKs if their signatures differ; uninstalling a mismatched test build can erase device-local favorites and settings.

Older test APKs were produced by a separate debug workflow and may not share the release signing key. If Android rejects the first signed update because the signatures differ, install the signed release once from its GitHub Release; uninstalling a mismatched test build can erase its device-local favorites and settings.

Updates require an internet connection. The web app updates its cached files through the service worker; Android app updates replace the installed APK through the Android installer. Neither update path removes local Favorites or preferences when the Android package signature remains the same.

## GitHub Pages

The static website and service worker are in the repository root and can be published from there. Capacitor packages the optimized `dist/` build. Keep the web app and Android app on the same branch so both ship the same interface and hymn data.

## Hymn text and rights

The app includes 1,000 distinct English hymns from the CAC Gospel Hymn Book and 997 Yorùbá hymns from the CAC Yoruba Hymn Book, kept as separate collections because their numbering is not a verified translation mapping. Meter-only English headings use each hymn’s opening lyric line as its title. The duplicated English hymn at source number 110 is merged with the same hymn at number 86; searching for 110 still finds it. Printed hymn numbers are preserved; V marks entries that the source identifies as part of its Various section. The app maintainer confirmed permission to republish the selected lyrics. The upstream HymnFlow repository is marked GPL-2.0 for its software; that does not itself describe a separate lyric-text license. Source details are in `data/SOURCES.md`.

Member favorites and reading preferences are stored only in the current browser/device; they do not sync between devices. Members do not need an account. The separate admin account is only for the protected web workspace. Audio and projector mode are not included.
