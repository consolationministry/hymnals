# Consolation Evangelical and Revival Church Hymnal

Phase 1 is a lightweight, mobile-first hymn frontend built with plain HTML, CSS, and JavaScript. It contains 197 sourced English hymn texts and works without an account or backend connection.

## What is included

- Hymn Home (full-text collection), Library, Reader, Favorites, and Settings screens
- Instant search by hymn number, title, keyword, first line, and lyric text
- English and Yorùbá language choices; the home screen defaults to English and shows a notice until verified Yorùbá texts are added
- Favorites and reading preferences stored locally in the browser
- Light, dark, and system appearance modes, plus adjustable reading size and accent
- Native sharing when available, with a copy-to-clipboard fallback
- Bundled English data; no network request is needed to load hymns
- Original hymn numbers and links to each Hymnary text authority page

## Hymn text and rights

The current 197 English texts are transcribed from Hymnary text-authority records marked Public Domain and associated with *Pentecostal Hymns No. 1* (1894). The app preserves the original book number and links to the individual text source. This is not a jurisdiction-by-jurisdiction rights determination: the source's Public Domain designation and 1894 publication date do not establish status in every country. Verify local rights before distributing the texts outside the United States.

The target collection is 250 hymns. Only the 197 entries with a clean transcript and an explicit Public Domain designation are included in this update; other entries are intentionally omitted rather than filled from unproofread OCR. No Yorùbá translations have been invented or included. Source details and the collection process are in `data/SOURCES.md`.

## Run locally

Serve the repository root with any static web server. For example, run python3 -m http.server 8000, then open localhost port 8000 in a browser. Opening index.html directly with file:// may prevent JavaScript modules from loading; use a local server or GitHub Pages instead.

## GitHub Pages

The paths are relative to the repository root, so the app is compatible with a project Pages URL. Enable Pages for the main branch root in the repository's Pages settings when the church is ready to host it there. This repository does not configure or activate hosting.

## Project boundaries

This phase intentionally does not connect Supabase or Cloudinary and does not include accounts, an admin panel, audio, service planning, or projector mode. The local hymn service is the integration seam for a later Supabase-backed catalogue. The church logo placeholder is a single replaceable SVG in assets/.

Favorites and preferences remain on the current browser/device in localStorage; they are not synced between devices. The bundled data and relative assets are suitable foundations for later Capacitor packaging.
