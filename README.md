# Consolation Evangelical and Revival Church Hymnal

The GitHub Pages homepage is the app install/download landing page at `/`; the hymn reader is available at `/hymnal.html`. The reader and Android app share a mobile-first interface and a Supabase-backed hymn catalog. Their uploaded English and Yorùbá collections remain separate; Capacitor packages the reader for Android.

## What is included

- Home, Hymn Library, Reader, Favorites, and Settings
- Search by hymn number, title, keyword, first line, or lyrics
- The 128 English hymns and 122 user-provided Yorùbá hymns, shown as separate collections with their printed numbers preserved
- Favorites and reading preferences stored locally on the device
- Light, dark, and system appearance modes; adjustable text size and accent
- Sharing through the device share sheet when available
- Both uploaded hymn collections available in the member web app and Android app after their entries are published
- Offline-capable web app with a service-worker update prompt
- Android app update checks, APK download, and Android installer handoff
- Anonymous attendance votes and comments on programme announcement posts
- A branded Live Audio member page with searchable programme cards, listener reactions, and anonymous comments
- A protected Live Audio admin workspace with a two-step programme-details and microphone/broadcast flow, sound controls, and WebRTC microphone publishing
- A separate, administrator-only web workspace at `/admin/`
- Published English and Yorùbá hymns, plus programmes and service plans from any date, load in the public web app and Android app from Supabase

The member web app and Android app need a successful online visit to fetch the published hymn list. After that, published hymns and the program/service-plan schedule are cached for offline use. If no published list has been fetched or cached, the hymn library remains empty rather than falling back to the bundled catalog.
The member web app and Android app use the same public content service. After applying migrations `202610090002_public_published_hymns.sql`, `202610090003_public_programs_and_service_plans.sql`, `202610110001_public_program_history.sql`, `202610130001_current_cac_ghb_catalog.sql`, `202610130002_current_cac_yhb_catalog.sql`, and `202610130003_public_programme_feed.sql`, members can read published hymn fields and the listed program/service-plan display fields for any date, including programme post dates. Run `202610130004_programme_interactions.sql` for anonymous comments, then `202610140001_public_programme_votes_and_descriptions.sql` for programme descriptions and anonymous Yes/No attendance votes. Votes are one per browser and programme, can be changed, and expose only totals plus the current browser’s choice; comments are public immediately, have no author name, and are limited to 500 characters with a best-effort 20-second per-browser rate limit. Visitors can clear local storage to reset their browser ID, so do not post private information. The member app labels past entries. Run `202610180001_uploaded_hymns_only.sql` after the historical catalog migrations to remove old CAC GHB/YHB rows and their IDs from saved service plans; back up the database first. Then run `202610190001_dual_uploaded_hymn_collections.sql` to add scripture-reference notes and make the uploaded English and Yorùbá collections separately selectable, with both active by default. This later migration does not delete hymn rows. The admin imports missing Yorùbá entries as drafts; publish them there before they appear to members. The public app returns only published rows from the two uploaded collections selected in admin settings, and never falls back to another catalog. Draft hymns and admin preferences stay private.

For web Live Audio, apply `supabase/migrations/202610200001_live_audio.sql` after the admin backend migration and before deploying the updated web files. It adds broadcast, category, anonymous interaction, and listener-count tables without changing hymn or Android-native tables. The public Listen page reads published programmes from Supabase, connects listeners to the admin's microphone broadcast with WebRTC, and shares anonymous comments, reactions, and listener totals. Supabase Realtime carries session signaling. Some carrier or corporate networks block direct peer connections and need a TURN relay for reliable reachability. To enable it, create a Cloudflare Realtime TURN key, add its key ID and key secret to Supabase Edge Function Secrets as `CLOUDFLARE_TURN_KEY_ID` and `CLOUDFLARE_TURN_API_TOKEN`, then deploy `supabase/functions/turn-credentials` with `supabase functions deploy turn-credentials`. The function issues six-hour credentials only for an active published broadcast; TURN credentials are never embedded in the web app. See `supabase/ADMIN_SETUP.md` for allowed-origin and billing details.

The admin workspace is a separate web page at `/admin/`. It requires an approved administrator account and the Supabase setup below. Hymn editing covers the uploaded English and Yorùbá collections; programme editing, service-plan editing, and admin preferences stay protected there. Published English and Yorùbá hymns and date-independent programme/service-plan display data appear in the member app. Administrators configure the attendance question and Yes/No wording. Vote totals are saved anonymously for the public feed; admin-side vote and view analytics are not shown yet.

## Run locally

Use Node.js 22 or newer:

```sh
npm ci
npm run dev
```

Serve the repository root with a static server (for example, `python3 -m http.server 8000`) or run `npm run dev`. Do not open the HTML files through `file://`. The homepage at `/` is the install page; use `/hymnal.html` to open the reader. `npm run build` generates both pages in the optimized `dist/` bundle used by Android.

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

GitHub Pages serves the public install page at `/` and the member reader at `/hymnal.html`. The homepage's **Install the Android app** button downloads the signed APK from the same website origin instead of sending users to GitHub Releases. After a signed Android release succeeds, `.github/workflows/deploy-pages.yml` builds the site, adds the APK to the Pages bundle, and publishes both through GitHub Actions. Set the Pages publishing source to **GitHub Actions** for this workflow. The `download.html` URL redirects to the homepage. The PWA manifest and Capacitor's `server.appStartPath` both open `hymnal.html`, so installing the separate web app or launching the Android APK starts in the reader. Android still requires the user to confirm an APK installation; a website cannot silently install a native app.

## Hymn text and rights

The app catalog includes 128 user-supplied English hymns and 122 user-supplied Yorùbá hymns. The documents did not include separate publication or licensing information, so both collections remain marked “User-supplied; rights not verified.” Source details are in `data/SOURCES.md`.

Member favorites and reading preferences are stored only in the current browser/device; they do not sync between devices. Live Audio uses the existing Supabase migration and sends microphone audio directly to listeners over WebRTC; members do not need an account. Comments and reactions are public and anonymous, so visitors should not post private information. The separate admin account is only for the protected web workspace. Projector mode is not included.
