/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'flut-cache-v1';
const RUNTIME_CACHE = 'flut-runtime-cache-v1';
const VAULT_DATA_CACHE = 'flut-vault-data-cache-v1';

// List of files to cache during service worker install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache static assets
addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - clean up old caches
addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== RUNTIME_CACHE &&
            cacheName !== VAULT_DATA_CACHE
          ) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't cache non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests to Stacks/Hiro
  if (
    url.hostname.includes('blockstack.org') ||
    url.hostname.includes('hiro.so') ||
    url.hostname.includes('stacks.co')
  ) {
    event.respondWith(
      caches.open(VAULT_DATA_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Clone and cache the response
            const clonedResponse = response.clone();
            if (response.status === 200) {
              cache.put(request, clonedResponse);
            }
            return response;
          })
          .catch(() => {
            // If network fails, try to get from cache
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                // Add offline indicator
                const modifiedResponse = cachedResponse.clone();
                modifiedResponse.headers.append('X-From-Cache', 'true');
                modifiedResponse.headers.append('X-Offline', 'true');
                return modifiedResponse;
              }
              // If nothing in cache, return offline response
              return new Response(
                JSON.stringify({ error: 'Offline - no cached data available' }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' },
                }
              );
            });
          });
      })
    );
    return;
  }

  // For other requests, use cache-first strategy for assets
  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone and cache successful responses
            const responseToCache = response.clone();
            cache.put(request, responseToCache);
            return response;
          })
          .catch(() => {
            // Return offline page if available
            return cache.match('/');
          });
      });
    })
  );
});

// Handle messages from clients
addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    });
  }

  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { vaultId, unlockDate, vaultName } = event.data;
    scheduleNotification(vaultId, unlockDate, vaultName);
  }
});

// Schedule push notification for vault unlock
function scheduleNotification(vaultId, unlockDate, vaultName) {
  console.log(`Scheduling notification for vault: ${vaultName} at ${unlockDate}`);
  
  const targetTime = new Date(unlockDate).getTime();
  const currentTime = Date.now();
  const delay = targetTime - currentTime;

  if (delay > 0) {
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        self.registration.showNotification('Vault Unlocked!', {
          body: `Your vault "${vaultName}" is now ready to withdraw.`,
          icon: '/pwa-192x192.png',
          badge: '/badge-icon.png',
          tag: `vault-unlock-${vaultId}`,
          requireInteraction: true,
          actions: [
            {
              action: 'open-vault',
              title: 'View Vault',
            },
            {
              action: 'close',
              title: 'Dismiss',
            },
          ],
        });
      }
    }, delay);
  }
}

// Handle notification clicks
addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open-vault') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if client is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // If not open, open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});
