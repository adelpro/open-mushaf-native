module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    'index.html',
    'manifest.json',
    'offline.html',
    'icons/*.{png,ico}',
    '*.js',
    '*.css',
    // Add all app screens for precaching
    '_expo/**/*',
    'settings/**/*',
    'lists/**/*',
    'navigation/**/*',
    'search/**/*',
    'privacy/**/*',
    'contact/**/*',
    'about/**/*',
    // Fix the assets pattern syntax and add pattern for duplicate paths
    'assets/**/*.png',
    'assets/assets/**/*.png',
  ],
  swSrc: 'public/service-worker.js',
  swDest: 'dist/service-worker.js',
  maximumFileSizeToCacheInBytes: 104857600, // 100MB
};
