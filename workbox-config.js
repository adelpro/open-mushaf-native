module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{html,js,css,png,jpg,jpeg,svg,ico,json,ttf,woff,woff2}'],
  globIgnores: [
    '**/service-worker.js',
    'workbox-*.js',
    'assets/mushaf-data/**/*',
  ],
  swSrc: 'public/service-worker.js',
  swDest: 'dist/service-worker.js',
  maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50MB
};
