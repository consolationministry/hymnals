const CACHE_NAME = "consolation-hymnal-1.1.121-unified";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./hymnal.html",
  "./manifest.webmanifest",
  "./css/theme.css",
  "./css/style.css",
  "./css/live-audio.css",
  "./assets/consolation-launcher.png",
  "./assets/consolation-launcher-192.png",
  "./assets/splash-chime.wav",
  "./data/uploaded-hymns.js",
  "./data/uploaded-yoruba-hymns.js",
  "./js/hymnal-selection.js",
  "./js/app.js",
  "./js/live-audio-data.js",
  "./js/live-audio-offline.js",
  "./js/live-audio-player.js",
  "./js/live-audio-public-data.js",
  "./js/cloudinary-live-audio.js",
  "./js/live-audio-realtime.js",
  "./js/live-audio-recording.js",
  "./js/live-audio-views.js",
  "./js/live-audio-webrtc.js",
  "./js/favorites.js",
  "./js/hymn-service.js",
  "./js/hymn-reading.js",
  "./js/local-store.js",
  "./js/native-updates.js",
  "./js/recent.js",
  "./js/public-content.js",
  "./js/search.js",
  "./js/settings.js",
  "./js/sharing.js",
  "./js/updates.js",
  "./js/version.js"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key.startsWith("consolation-hymnal-") && key !== CACHE_NAME;
      }).map(function (key) {
        return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(function (response) {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(request, copy); });
        }
        return response;
      }).catch(function () {
        return caches.match(request).then(function (cached) {
          return cached || caches.match(new URL("./hymnal.html", self.location.href).href) || caches.match(new URL("./index.html", self.location.href).href);
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(request, copy); });
        }
        return response;
      });
    })
  );
});
