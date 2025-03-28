module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          alias: {
            // Maps '@' to the root directory for easier imports
            '@': './',
            // Automatically converts react-native imports to react-native-web for web platform
            'react-native$': 'react-native-web',
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
