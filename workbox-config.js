module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{js,html,png,mp3,ico,json,txt,xml}'],
  swSrc: 'public/service-worker.js',
  swDest: 'dist/sw.js',
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  maximumFileSizeToCacheInBytes: 104857600, // 100MB
  clientsClaim: true,
  skipWaiting: true,
};
