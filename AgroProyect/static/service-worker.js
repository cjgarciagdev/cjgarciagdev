const CACHE_NAME = 'agro-master-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/static/css/style.css',
    '/static/js/app.js',
    '/static/img/icons/icon-192.png',
    '/static/img/icons/icon-512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE).catch(err => {
                console.error('Error caching assets:', err);
            });
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Estrategia: Cache First, luego Network
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request).then(response => {
                // Opcional: Cachear dinámicamente nuevos recursos
                return response;
            }).catch(() => {
                // Si falla la red y no está en caché
                if (event.request.mode === 'navigate') {
                    return caches.match('/'); // Devolver raíz si es navegación
                }
            });
        })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
