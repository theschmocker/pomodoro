// When the user navigates to your site,
// the browser tries to redownload the script file that defined the service
// worker in the background.
// If there is even a byte's difference in the service worker file compared
// to what it currently has, it considers it 'new'.
const { assets } = global.serviceWorkerOption

let appShellFiles = [...assets, './', './static/alarm.mp3', './static/styles.css']

const cacheName = `pomodorschmo1-${new Date().toISOString()}`;

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
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
      return r || fetch(e.request).then(function(response) {
        return caches.open(cacheName).then(function(cache) {
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});
