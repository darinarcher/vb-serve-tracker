const CACHE_NAME = 'serve-tracker-v10';
const ASSETS = [
  'index.html',
  'manifest.json',
  'icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  // Take over immediately
  self.skipWaiting();
});

// Clean old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Network-first strategy: try network, fall back to cache, update cache on success
self.addEventListener('fetch', (event) => {
  // Only cache GET requests (cache.put throws on non-GET)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then((response) => {
      // Update cache with fresh response
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, responseClone);
      }).catch(() => {}); // Ignore cache write failures (quota, etc.)
      return response;
    }).catch(() => {
      // Network failed — serve from cache (offline support)
      return caches.match(event.request).then((cached) => {
        return cached || caches.match('index.html');
      });
    })
  );
});
