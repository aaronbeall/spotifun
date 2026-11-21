/*
 * Spotifun service worker. Kept small on purpose:
 * - Pages: network first, falling back to the last copy, then to /offline.html.
 * - Build assets and app images (/_next/static, /vibes, /personas, /home): cache first.
 * - /api and anything off-site: never touched, so Spotify data is never cached here.
 * Bump VERSION to drop old caches on the next visit.
 */
const VERSION = 'v1';
const PAGES = `spotifun-pages-${VERSION}`;
const ASSETS = `spotifun-assets-${VERSION}`;
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PAGES).then(cache => cache.addAll([OFFLINE_URL, '/icons/icon-192.png'])).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== PAGES && key !== ASSETS).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

const STATIC_PREFIXES = ['/_next/static/', '/vibes/', '/personas/', '/home/'];

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Only public pages are kept. The dashboard is personal and always comes from the network.
          if (response.ok && !url.pathname.startsWith('/dashboard')) {
            const copy = response.clone();
            caches.open(PAGES).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(request)) || caches.match(OFFLINE_URL)),
    );
    return;
  }

  if (url.pathname.startsWith('/icons/')) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
    return;
  }

  if (STATIC_PREFIXES.some(prefix => url.pathname.startsWith(prefix))) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(ASSETS).then(cache => cache.put(request, copy));
        }
        return response;
      })),
    );
  }
});
