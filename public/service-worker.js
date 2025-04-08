/* eslint-disable no-undef */
// This service worker is processed by workbox-cli

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
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
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
      .then(() => clients.claim()),
  );
});

const { registerRoute } = workbox.routing;
const { CacheFirst, StaleWhileRevalidate } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { precacheAndRoute } = workbox.precaching;

// Only precache essential UI assets, not all Quran pages
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
