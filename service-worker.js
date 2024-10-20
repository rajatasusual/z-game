const CACHE_NAME = 'z-tile-game-cache-v1';
const urlsToCache = [
    `/`,
    `/index.html`,
    `/service-worker.js`,
    `/styles.css`,
    `/game.js`,
    `/ui.js`,
    `/dict`,
    `/manifest.json`,
    `/icons/z.png`,
    `/favicon.ico`,
    `/init.js`,
];

// Install the service worker and cache files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    console.log('Fetch event for: ', event.request.url); // Debugging log
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('Found response in cache: ', response);
                    return response;
                }
                console.log('No response found in cache. Fetching from network...');
                return fetch(event.request);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
                // Optionally serve a fallback page or asset if the fetch fails
            })
    );
});

// Activate the service worker and remove old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(keyList =>
            Promise.all(keyList.map(key => {
                if (!cacheWhitelist.includes(key)) {
                    return caches.delete(key);
                }
            }))
        )
    );
});