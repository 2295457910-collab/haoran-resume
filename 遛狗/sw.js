// PawMate Service Worker
const CACHE_NAME = 'pawmate-v1.0.0';
const urlsToCache = [
    '/app.html',
    '/web-app.js',
    '/manifest.json',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            }
        )
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : '有新的遛狗邀请！',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%233B82F6" rx="20"/><text x="50" y="65" text-anchor="middle" font-size="50" fill="white">🐕</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%233B82F6" rx="20"/><text x="50" y="65" text-anchor="middle" font-size="50" fill="white">🐕</text></svg>',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: '查看详情',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%233B82F6" rx="20"/><text x="50" y="65" text-anchor="middle" font-size="50" fill="white">👁</text></svg>'
            },
            {
                action: 'close',
                title: '关闭',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%236B7280" rx="20"/><text x="50" y="65" text-anchor="middle" font-size="50" fill="white">✖</text></svg>'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('PawMate', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        // Open the app
        event.waitUntil(
            clients.openWindow('/app.html')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        event.notification.close();
    } else {
        // Default action - open app
        event.waitUntil(
            clients.openWindow('/app.html')
        );
    }
});

// Background sync function
async function doBackgroundSync() {
    try {
        // Sync offline data when connection is restored
        console.log('Background sync triggered');
        
        // Here you would sync any pending data
        // For example: posts, messages, location updates
        
        return Promise.resolve();
    } catch (error) {
        console.error('Background sync failed:', error);
        return Promise.reject(error);
    }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
    if (event.tag === 'content-sync') {
        event.waitUntil(syncContent());
    }
});

async function syncContent() {
    // Sync fresh content when the app is not in use
    try {
        console.log('Periodic sync triggered');
        // Fetch latest posts, messages, etc.
        return Promise.resolve();
    } catch (error) {
        console.error('Periodic sync failed:', error);
        return Promise.reject(error);
    }
} 