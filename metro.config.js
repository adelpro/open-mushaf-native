/* eslint-env node */
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const os = require('os');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// SVG transformer configuration
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

// Module resolution
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],

  unstable_conditionNames: ['require', 'react-native', 'default'],
};

// Cache configuration
config.cacheStores = [
  new FileStore({
    root: path.join(os.tmpdir(), 'metro-cache'),
  }),
];

module.exports = config;
