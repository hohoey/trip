const CACHE_NAME = 'travel-app-v1';
const ASSETS = [
    './',
    './index.html',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 安裝並快取資源
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

// 攔截請求，優先從快取讀取
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((res) => res || fetch(e.request))
    );
});