module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    'index.html',
    'manifest.json',
    'offline.html',
    'icons/*.{png,ico}',
    '*.js',
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
  globIgnores: [
    'assets/mushaf-data/**/*',
    'assets/**/*',
    // Don't exclude UI icons and essential assets
    '!assets/icons/**/*',
    '!assets/images/ui/**/*',
    '!assets/sound/**/*',
    '!assets/tutorial/**/*',
  ],
  swSrc: 'public/service-worker.js',
  swDest: 'dist/service-worker.js',
  maximumFileSizeToCacheInBytes: 104857600, // 100MB
};
