module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{html,js,css,png,jpg,jpeg,svg,ico,json,ttf,woff,woff2}'],
  globIgnores: [
    '**/service-worker.js',
    'workbox-*.js',
    'assets/mushaf-data/**/*',
  ],
  swDest: 'dist/service-worker.js',
  swSrc: 'src-sw.js',
  maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50MB
};
