/* eslint-env node */
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const os = require('os');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
const { transformer, resolver } = config;
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
};

config.cacheStores = [
  new FileStore({
    root: path.join(os.tmpdir(), 'metro-cache'),
  }),
];
module.exports = config;
