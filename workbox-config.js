module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{js,html,png,mp3,ico,json,txt,xml}'],
  swDest: 'dist/sw.js',
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
};
