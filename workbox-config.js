module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{js,html,png,mp3,ico,json,txt,xml}'],
  swSrc: 'public/service-worker.js',
  swDest: 'dist/service-worker.js',
  maximumFileSizeToCacheInBytes: 104857600, // 100MB
};
