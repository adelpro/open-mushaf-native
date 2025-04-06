module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{js,html,png,jpg,jpeg,gif,svg,mp3,ico,json,txt,xml,css}',
    'assets/**/*',
    'icons/**/*',
    'splash/**/*',
  ],
  swSrc: 'public/service-worker.js',
  swDest: 'dist/service-worker.js',
  maximumFileSizeToCacheInBytes: 104857600, // 100MB
};
