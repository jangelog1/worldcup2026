/* Service worker — makes the app work offline like a native app.
   Network-first (so live standings stay fresh online), cache fallback (so it opens offline). */
const CACHE = 'wc2026-v2';
const ASSETS = ['world-cup-2026.html', 'icon-512.png', 'manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const sameOrigin = new URL(req.url).origin === self.location.origin;
  e.respondWith(
    fetch(req).then(r => {
      if (sameOrigin && r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
      return r;
    }).catch(() => caches.match(req).then(m => m || (sameOrigin ? caches.match('world-cup-2026.html') : Promise.reject('offline'))))
  );
});
