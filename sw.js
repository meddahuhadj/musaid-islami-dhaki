// Service worker for المساعد الإسلامي الذكي
// Strategy: network-first, falling back to cache — so the app UI (and whatever
// pages/fonts/assets were already visited) still opens without internet, while
// always preferring a fresh copy when online. Live AI chat itself still needs
// a real connection; this only keeps the shell usable offline.
const CACHE_NAME = 'islamic-assistant-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
