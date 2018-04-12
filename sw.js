const cacheName = "pomodorschmo-v0.1";
let appShellFiles = [
    '/',
    '/index.html',
    '/registerServiceWorker.js',
    '/assets/styles.css',
    '/scripts/main.js',
    '/assets/alarm.mp3',
];

self.addEventListener('install', function(e) {
    console.log('[Service Work] Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('[Service Worker] caching all files');
            return cache.addAll(appShellFiles);
        })
    );
});

self.addEventListener('activate',  event => {
  event.waitUntil(self.clients.claim());
});

// Fetching content using Service Worker
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) {
      console.log('[Service Worker] Fetching resource: '+e.request.url);
      return r || fetch(e.request).then(function(response) {
        return caches.open(cacheName).then(function(cache) {
          console.log('[Service Worker] Caching new resource: '+e.request.url);
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});
