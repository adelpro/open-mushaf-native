// Minimal stub for `react-native` used in Vitest.
//
// The real `react-native` entry has Flow syntax (`import typeof …`) at
// the top, which Node can't parse. We don't need any of RN's runtime
// in tests — only the surface that `react-native-android-widget` reads
// when it loads. `Image.resolveAssetSource` is the only call site we
// see exercised; we stub it to return an empty object so callers that
// pass non-string `svg` props don't crash. Tests that import widgets
// must mock out the widget primitives (see
// `widget-task-handler.test.ts`).
module.exports = {
  Image: {
    resolveAssetSource: () => ({}),
  },
  Platform: { OS: 'android' },
  useColorScheme: () => 'light',
};
