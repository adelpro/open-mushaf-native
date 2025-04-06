module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{js,html,png,mp3,ico,json,txt,xml}'],
  swDest: 'dist/service-worker.js',
  maximumFileSizeToCacheInBytes: 104857600, // 100MB
};
