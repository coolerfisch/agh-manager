// Name der Cache-Version
const CACHE_NAME = 'agh-einsatz-cache-v1';

// Ressourcen, die im Cache gespeichert werden sollen
const urlsToCache = [
    './',
    './index.html',
    './offline.html', // Fallback-Seite für Offline-Modus
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    './css/bootstrap.min.css',
    './css/bootstrap-icons.css',
    './js/chart.js',
    './js/bootstrap.bundle.min.js'
];

// Install Event - Caching der Ressourcen
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate Event - Alte Caches löschen
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch Event - Abrufen von Ressourcen aus dem Cache oder Netzwerk
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(() => caches.match('./offline.html'));
        })
    );
});
