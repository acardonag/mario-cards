// Service Worker for Mario Cards PWA
const CACHE_NAME = 'mario-cards-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/battle-styles.css',
  '/game.js',
  '/src/images/batalla.png',
  '/src/images/birdo.png',
  '/src/images/bowser.png',
  '/src/images/bowsie.png',
  '/src/images/daysie.png',
  '/src/images/didikong.png',
  '/src/images/dk.png',
  '/src/images/dkpirata.png',
  '/src/images/huesitos.png',
  '/src/images/kupa.png',
  '/src/images/kupaalado.png',
  '/src/images/luigui.png',
  '/src/images/mario.png',
  '/src/images/peach.png',
  '/src/images/reybu.png',
  '/src/images/shygy.png',
  '/src/images/toad.png',
  '/src/images/toaddete.png',
  '/src/images/wario.png',
  '/src/images/weglear.png',
  '/src/images/yoshi.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // If both cache and network fail, show offline page
          return caches.match('/index.html');
        });
      })
  );
});
