// Service Worker – Abnahme Tagebuch
const CACHE = 'abnahme-v1';
const ASSETS = [
  '/abnahme-tagebuch/',
  '/abnahme-tagebuch/index.html',
  '/abnahme-tagebuch/manifest.json',
  '/abnahme-tagebuch/icons/icon-72.png',
  '/abnahme-tagebuch/icons/icon-192.png',
  '/abnahme-tagebuch/icons/icon-512.png',
  'https://cdn.jsdelivr.net/npm/chart.js@4.5.0/dist/chart.umd.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Google APIs immer live laden
  if (e.request.url.includes('googleapis.com') || e.request.url.includes('accounts.google.com')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
      if (resp.ok && e.request.method === 'GET') {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return resp;
    }))
  );
});
