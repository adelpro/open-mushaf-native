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
            '@assets': './assets',
            '@components': './components',
            '@constants': './constants',
            '@utils': './utils',
            '@hooks': './hooks',
            '@types': './types',
            '@recoil': './recoil',
            // Automatically converts react-native imports to react-native-web for web platform
            //'react-native$': 'react-native-web',
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
