# Consolation Evangelical and Revival Church Hymnal

Phase 1 is a lightweight, mobile-first hymn frontend built with plain HTML, CSS, and JavaScript. It includes original bilingual demo hymns and works without an account or backend connection.

## What is included

- Hymn Home, Library, Reader, Favorites, and Settings screens
- Instant search by hymn number, title, keyword, first line, and lyric text
- English, Yoruba, and bilingual reading modes
- Favorites and reading preferences stored locally in the browser
- Light, dark, and system appearance modes, plus adjustable reading size and accent
- Native sharing when available, with a copy-to-clipboard fallback
- Bundled demo data; no network request is needed to load hymns

All demo lyrics are original placeholders for interface testing. Replace them with church-approved material before using this as the church's official hymnal.

## Run locally

Serve the repository root with any static web server. For example, run python3 -m http.server 8000, then open localhost port 8000 in a browser. Opening index.html directly with file:// may prevent JavaScript modules from loading; use a local server or GitHub Pages instead.

## GitHub Pages

The paths are relative to the repository root, so the app is compatible with a project Pages URL. Enable Pages for the main branch root in the repository's Pages settings when the church is ready to host it there. This repository does not configure or activate hosting.

## Project boundaries

This phase intentionally does not connect Supabase or Cloudinary and does not include accounts, an admin panel, audio, service planning, or projector mode. The local hymn service is the integration seam for a later Supabase-backed catalogue. The church logo placeholder is a single replaceable SVG in assets/.

Favorites and preferences remain on the current browser/device in localStorage; they are not synced between devices. The bundled data and relative assets are suitable foundations for later Capacitor packaging.
