// `@expo/metro-runtime` MUST be the first import to ensure Fast Refresh works
// on web.
import '@expo/metro-runtime';

import { Platform } from 'react-native';

import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';
import { registerWidgetTaskHandler } from 'react-native-android-widget';

import { widgetTaskHandler } from './widgets/widget-task-handler';

// This file should only import and register the root. No components or exports
// should be added here.
renderRootComponent(App);

if (Platform.OS === 'android') {
  registerWidgetTaskHandler(widgetTaskHandler);
}
