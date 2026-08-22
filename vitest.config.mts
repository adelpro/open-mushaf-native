import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      // Mirror the `@/*` path alias from tsconfig.json. Anchored to `@/` so
      // scoped packages (`@expo/vector-icons`, `@shopify/flash-list`, …)
      // still resolve to node_modules.
      { find: /^@\//, replacement: `${import.meta.dirname}/` },
      // Pure modules under test still sit behind `react-native` imports
      // (`Platform`, `I18nManager`). The RN entry point is Flow-typed and
      // cannot be parsed outside Metro, so tests resolve it to the web
      // implementation. Anchored so `react-native-svg`, `react-native-mmkv`,
      // and friends are left alone.
      { find: /^react-native$/, replacement: 'react-native-web' },
    ],
  },
});
