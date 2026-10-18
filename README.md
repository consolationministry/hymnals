# Consolation Evangelical and Revival Church Hymnal

The website and Android app use the same mobile-first HTML, CSS, JavaScript, and bundled hymn collection. Capacitor packages that same interface for Android; there is no separate Android screen set to drift out of sync.

## What is included

- Home, Hymn Library, Reader, Favorites, and Settings
- Search by hymn number, title, keyword, first line, or lyrics
- The 128 English hymns in the uploaded hymn collection, shown as Original Consolation Hymn
- Favorites and reading preferences stored locally on the device
- Light, dark, and system appearance modes; adjustable text size and accent
- Sharing through the device share sheet when available
- The uploaded hymn collection available in the member web app and Android app
- Offline-capable web app with a service-worker update prompt
- Android app update checks, APK download, and Android installer handoff
- Anonymous attendance votes and comments on programme announcement posts
- A separate, administrator-only web workspace at `/admin/`
- Published hymns from the uploaded collection, plus programs and service plans from any date, can load in the public web app and Android app from Supabase

The member web app and Android app need a successful online visit to fetch the published hymn list. After that, published hymns and the program/service-plan schedule are cached for offline use. If no published list has been fetched or cached, the hymn library remains empty rather than falling back to the bundled catalog.
The member web app and Android app use the same public content service. After applying migrations `202610090002_public_published_hymns.sql`, `202610090003_public_programs_and_service_plans.sql`, `202610110001_public_program_history.sql`, `202610130001_current_cac_ghb_catalog.sql`, `202610130002_current_cac_yhb_catalog.sql`, and `202610130003_public_programme_feed.sql`, members can read published hymn fields and the listed program/service-plan display fields for any date, including programme post dates. Run `202610130004_programme_interactions.sql` for anonymous comments, then `202610140001_public_programme_votes_and_descriptions.sql` for programme descriptions and anonymous Yes/No attendance votes. Votes are one per browser and programme, can be changed, and expose only totals plus the current browser’s choice; comments are public immediately, have no author name, and are limited to 500 characters with a best-effort 20-second per-browser rate limit. Visitors can clear local storage to reset their browser ID, so do not post private information. The member app labels past entries. Run `202610180001_uploaded_hymns_only.sql` last to set Original Consolation Hymn as the only active collection and permanently delete CAC GHB/YHB rows. It also removes those hymn IDs from saved service plans; plans that only referenced CAC hymns will have no hymn selections. Back up the database first. The public app displays only published rows from `Uploaded Hymn Collection`; it never falls back to another catalog. Draft hymns and admin preferences stay private.

The admin workspace is a separate web page at `/admin/`. It requires an approved administrator account and the Supabase setup below. Hymn editing is limited to uploaded hymns; programme editing, service-plan editing, and admin preferences stay protected there. Published uploaded hymns and date-independent programme/service-plan display data appear in the member app. Administrators configure the attendance question and Yes/No wording. Vote totals are saved anonymously for the public feed; admin-side vote and view analytics are not shown yet.

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

The app includes 128 English hymns from a user-provided document. The document did not include separate publication or licensing information, so the uploaded material remains marked “User-supplied; rights not verified.” Source details are in `data/SOURCES.md`.

Member favorites and reading preferences are stored only in the current browser/device; they do not sync between devices. Members do not need an account. The separate admin account is only for the protected web workspace. Audio and projector mode are not included.
