/* eslint-disable no-undef */
// This service worker is processed by workbox-cli

try {
  importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js',
  );

  // Configure workbox
  workbox.setConfig({
    debug: false,
  });

  // Add better install handling
  self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');

    // Notify clients that installation has started
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_STATE_UPDATE',
          message: 'جاري تثبيت التطبيق...',
          state: 'installing',
        });
      });
    });

    // Force the waiting service worker to become the active service worker
    self.skipWaiting();

    // Pre-cache the offline page during installation
    event.waitUntil(
      caches.open('offline-cache').then((cache) => {
        return cache.add('/offline.html');
      }),
    );
  });

  self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');

    // Notify clients that activation has started
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_STATE_UPDATE',
          message: 'جاري تفعيل التطبيق...',
          state: 'activating',
        });
      });
    });

    // Clean up old caches
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames
              .filter((cacheName) => {
                // Add logic to identify old caches if needed
                return (
                  cacheName.startsWith('workbox-') &&
                  !cacheName.includes('quran-images') &&
                  !cacheName.includes('google-fonts')
                );
              })
              .map((cacheName) => {
                console.log('Deleting outdated cache:', cacheName);
                return caches.delete(cacheName);
              }),
          );
        })
        .then(() => {
          // Claim clients and notify them that the service worker is ready
          return clients.claim().then(() => {
            self.clients.matchAll().then((clients) => {
              clients.forEach((client) => {
                client.postMessage({
                  type: 'SW_STATE_UPDATE',
                  message: 'تم تحديث التطبيق بنجاح!',
                  state: 'activated',
                  duration: 3000,
                });
              });
            });
          });
        }),
    );
  });

  // Add a message handler to respond to client messages
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'GET_SW_STATE') {
      // Respond with the current state
      event.ports[0].postMessage({
        state: 'active',
        version: '1.0.0', // You could store and return the actual version
      });
    }
  });

  const { registerRoute } = workbox.routing;
  const { CacheFirst, StaleWhileRevalidate } = workbox.strategies;
  const { ExpirationPlugin } = workbox.expiration;
  const { precacheAndRoute } = workbox.precaching;

  precacheAndRoute(self.__WB_MANIFEST);

  // Cache the Google Fonts stylesheets with a stale-while-revalidate strategy
  registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com',
    new StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets',
    }),
  );

  // Cache the underlying font files with a cache-first strategy
  registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          maxEntries: 30,
        }),
      ],
    }),
  );

  // Cache Quran page images on-demand (only when user loads them)
  // This aligns with your useImagePreloader hook
  registerRoute(
    ({ request }) => {
      if (request.destination !== 'image') return false;

      const url = request.url;
      return (
        url.includes('/mushaf-data/') ||
        // url.includes('/assets/assets/') ||
        url.includes('/assets/')
      );
    },
    new CacheFirst({
      cacheName: 'quran-images',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 100, // Keep a limited number of entries
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    }),
  );

  // Cache UI assets
  registerRoute(
    ({ request }) => {
      if (request.destination !== 'image') return false;

      const url = request.url;
      return (
        url.includes('/icons/') ||
        url.includes('/images/') ||
        url.includes('/tutorial/') ||
        url.includes('/screenshots/')
      );
    },
    new CacheFirst({
      cacheName: 'ui-assets',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    }),
  );

  // Cache SVG and vector icons
  registerRoute(
    ({ request, url }) => {
      // Match SVG files
      if (request.destination === 'image' && url.pathname.endsWith('.svg')) {
        return true;
      }

      // Match Expo vector icons
      if (
        url.pathname.includes('@expo/vector-icons') ||
        url.pathname.includes('node_modules/expo-vector-icons') ||
        url.pathname.includes('vector-icons')
      ) {
        return true;
      }

      return false;
    },
    new CacheFirst({
      cacheName: 'vector-icons',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    }),
  );

  // Cache JSON data (tafseer files)
  registerRoute(
    ({ request }) =>
      request.url.includes('/tafaseer/') && request.url.endsWith('.json'),
    new CacheFirst({
      cacheName: 'tafseer-data',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
        }),
      ],
    }),
  );

  // Default strategy for scripts and styles
  registerRoute(
    ({ request }) =>
      request.destination === 'script' || request.destination === 'style',
    new StaleWhileRevalidate({
      cacheName: 'static-resources',
    }),
  );

  // Cache app pages for offline access
  registerRoute(
    ({ url }) => {
      const appRoutes = [
        '/settings',
        '/about',
        '/navigation',
        '/search',
        '/tutorial',
        '/lists',
        '/contact',
        '/privacy',
      ];

      // Check if the URL path matches any of our app routes
      return appRoutes.some(
        (route) => url.pathname === route || url.pathname.endsWith(route),
      );
    },
    new StaleWhileRevalidate({
      cacheName: 'app-pages',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 15,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    }),
  );

  // Simple offline fallback
  registerRoute(
    ({ request }) => request.mode === 'navigate',
    new StaleWhileRevalidate({
      cacheName: 'pages',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 10,
        }),
      ],
    }),
  );

  // Add a fallback for navigation requests when offline
  workbox.routing.setCatchHandler(async ({ event }) => {
    // Return the offline page for navigation requests
    if (event.request.mode === 'navigate') {
      try {
        // Try to get the offline page from cache
        const offlineCache = await caches.open('offline-cache');
        const offlinePage = await offlineCache.match('/offline.html');

        if (offlinePage) {
          // Send notification to the client that we're offline
          const clients = await self.clients.matchAll();
          clients.forEach((client) => {
            client.postMessage({
              type: 'SW_STATE_UPDATE',
              message: 'أنت غير متصل بالإنترنت',
              duration: 5000,
            });
          });

          return offlinePage;
        }
      } catch (error) {
        console.error('Error serving offline page:', error);
      }
    }

    // If we don't have a fallback, return a generic response
    return Response.error();
  });
} catch (error) {
  console.error('Service worker registration failed with error:', error);
  // Send error to client if possible
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'SW_ERROR',
        message: `Service worker error: ${error.message}`,
      });
    });
  });
}
