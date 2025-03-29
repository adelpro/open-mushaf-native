module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          // Set the root directory of your project
          root: ['./src'],
          alias: {
            // Maps '@' to the root directory for easier imports
            '@': './',
            '@assets': './src/assets',
            '@components': './src/components',
            '@recoil': './src/state',
            '@utils': './src/utils',
          },
        },
      ],
    ],
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  };
};
