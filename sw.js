// Name der Cache-Version
const CACHE_NAME = 'agh-einsatz-cache-v1';

// Ressourcen, die im Cache gespeichert werden sollen
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    // Fügen Sie hier weitere Ressourcen hinzu, die Sie cachen möchten (CSS, JS, Bilder, etc.)
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];

// Install Event - Caching der Ressourcen
self.addEventListener('install', event => {
    console.log('[Service Worker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching all: app shell and content');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate Event - Alte Caches löschen
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activate');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch Event - Abrufen von Ressourcen aus dem Cache oder Netzwerk
self.addEventListener('fetch', event => {
    console.log('[Service Worker] Fetch', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Wenn die Ressource im Cache ist, zurückgeben
                if (response) {
                    return response;
                }
                // Andernfalls die Ressource aus dem Netzwerk abrufen
                return fetch(event.request);
            })
    );
});
