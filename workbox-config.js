module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    'index.html',
    'manifest.json',
    'offline.html',
    'icons/*.{png,ico}',
    '*.js',
    '*.css',
    // Only include UI components, not all assets
    '_expo/**/*',
    'settings/**/*',
    'lists/**/*',
    'navigation/**/*',
    'search/**/*',
    'privacy/**/*',
    'contact/**/*',
    'about/**/*',
  ],
  // Exclude large assets from precaching
  globIgnores: ['assets/mushaf-data/**/*', 'assets/**/*'],
  swSrc: 'public/service-worker.js',
  swDest: 'dist/service-worker.js',
  maximumFileSizeToCacheInBytes: 104857600, // 100MB
};
