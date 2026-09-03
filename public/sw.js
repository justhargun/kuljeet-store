// Minimal service worker: caches the app shell so it can open (and show
// already-visited pages) even with no internet connection.
// v2: fetch now explicitly bypasses the browser's HTTP cache (cache: 'no-store')
// so "network-first" actually means fresh-from-network, not a stale cached
// response that technically counted as "successful".
const CACHE_NAME = 'kuljeet-store-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const fresh = await fetch(event.request, { cache: 'no-store' });
        cache.put(event.request, fresh.clone());
        return fresh;
      } catch (e) {
        const cached = await cache.match(event.request);
        return cached || Promise.reject(e);
      }
    })
  );
});
