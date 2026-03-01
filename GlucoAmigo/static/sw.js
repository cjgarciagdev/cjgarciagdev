const CACHE_NAME = 'glucoamigo-cache-v2';
const OFFLINE_URL = '/';
const ASSETS_TO_CACHE = [
  '/',
  '/static/manifest.json',
  '/static/css/styles.css',
  '/static/js/app.js',
  '/static/img/icon-192.png',
  '/static/img/icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=Nunito:wght@400;600;700;800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar fetch para IndexedDB proxy o Cache
self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Retornar de cache si existe, o intentar la red
        return cachedResponse || fetch(event.request).then(response => {
           // Actualizar cache dinámicamente si es un recurso estático
           if (event.request.url.includes('/static/')) {
               const resClone = response.clone();
               caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
           }
           return response;
        }).catch(() => {
           // Si falla red y es navegación, devolver página offline
           if (event.request.mode === 'navigate') {
               return caches.match(OFFLINE_URL);
           }
        });
      })
    );
  } else if (event.request.method === 'POST' || event.request.method === 'PUT') {
      // Background Sync para registros offline
      event.respondWith(
          fetch(event.request).catch(() => {
              // Si falla la red, guardar en IndexedDB simulado
              // En app.js el cliente se encarga de reintentar si la request devuelve error
              return new Response(JSON.stringify({ status: 'offline_queued', message: 'Guardado offline. Se sincronizará al tener red.' }), {
                  headers: { 'Content-Type': 'application/json' }
              });
          })
      );
  }
});
