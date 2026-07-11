import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration. We override three things:
 *
 * 1. The `@/` alias so test files can import app modules the same way
 *    the source code does (defined in `tsconfig.json`
 *    `compilerOptions.paths`).
 *
 * 2. The `react-native-android-widget` package is loaded from its
 *    TypeScript source via its `react-native` entry field, which pulls
 *    in `react-native` itself at runtime. We force Vitest to use the
 *    precompiled CommonJS build instead so the package can be imported
 *    without React Native's native module bridge.
 *
 * 3. Inline `jotai` so its mock in `widget-task-handler.test.ts` can
 *    replace the real module's exports.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      // react-native-android-widget → compiled CJS, not TS source.
      // The package's `react-native` entry field resolves to its TS
      // source, which imports `react-native` and crashes in node.
      'react-native-android-widget': resolve(
        __dirname,
        'node_modules/react-native-android-widget/lib/commonjs/index.js',
      ),
    },
  },
  test: {
    include: ['**/__tests__/**/*.test.{ts,tsx}'],
    server: {
      deps: {
        inline: [/jotai/, /react-native-android-widget/],
      },
    },
  },
});
