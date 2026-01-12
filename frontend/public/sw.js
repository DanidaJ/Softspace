/// <reference lib="webworker" />

// Service Worker for Softspace PWA
const CACHE_NAME = 'softspace-v1';
const RUNTIME_CACHE = 'softspace-runtime-v1';

// Assets to cache on install (app shell)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon.png',
];

// Install event - precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Immediately take control
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - network-first strategy for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle navigation requests (SPA fallback) - serve index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // If network fails, try to return cached index.html
          return caches.match('/index.html');
        })
    );
    return;
  }

  // API requests - network only (don't cache sensitive data)
  if (url.pathname.startsWith('/api') || 
      url.pathname.includes('/mood') || 
      url.pathname.includes('/chat') ||
      url.pathname.includes('/journal') ||
      url.pathname.includes('/insights')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Return offline response for API failures
          return new Response(
            JSON.stringify({ 
              error: 'offline', 
              message: 'You appear to be offline. Please check your connection.' 
            }),
            { 
              status: 503, 
              headers: { 'Content-Type': 'application/json' } 
            }
          );
        })
    );
    return;
  }

  // Static assets - stale-while-revalidate
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            // Only cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(RUNTIME_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // Network failed, hopefully we have a cached version
            console.log('[SW] Network request failed, using cache for:', request.url);
          });

        // Return cached response immediately, or wait for network
        return cachedResponse || fetchPromise;
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mood-logs') {
    event.waitUntil(syncMoodLogs());
  }
});

async function syncMoodLogs() {
  // Future: Sync offline mood logs when back online
  console.log('[SW] Syncing mood logs...');
}

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Time for a check-in?',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'checkin', title: 'Check In', icon: '/icons/checkin.png' },
      { action: 'dismiss', title: 'Later', icon: '/icons/dismiss.png' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Softspace', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'checkin') {
    event.waitUntil(
      clients.openWindow('/app?action=mood')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/app')
    );
  }
});
