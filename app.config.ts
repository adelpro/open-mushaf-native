import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  // Check if we need to disable React compiler (for web builds)
  if (process.env.EXPO_NO_REACT_COMPILER === '1') {
    console.log('⚙️ React compiler disabled for this build');

    // Make sure the experiments object exists
    if (!config.experiments) {
      config.experiments = {};
    }

    // Disable React compiler
    config.experiments.reactCompiler = false;
  } else {
    // Keep the existing setting or default to false
    if (
      config.experiments &&
      typeof config.experiments.reactCompiler === 'undefined'
    ) {
      config.experiments.reactCompiler = false;
    }
  }

  // Ensure required properties are defined
  const updatedConfig: ExpoConfig = {
    // Provide default values for required properties
    name: config.name || 'Open Mushaf',
    slug: config.slug || 'open-mushaf-native',
    version: config.version || '1.0.0',
    orientation: config.orientation || 'default',
    ...config, // Spread the rest of the config
  };

  return updatedConfig;
};
