const CACHE_NAME = 'travel-japan';
const ASSETS = [
    '/manifest.json',
    '/screen/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/weather.js',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});