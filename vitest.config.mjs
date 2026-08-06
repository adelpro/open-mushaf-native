import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// react-native ships Flow type annotations that Rolldown/Vite cannot parse.
// We redirect RN modules to lightweight stubs for unit-test environments so
// pure-logic specs (rrf, cosineSearch, hybrid orchestrator) can run without
// pulling in the RN runtime.
const RN_STUB = path.resolve(__dirname, 'vitest', 'rn-stub.ts');

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'react-native': RN_STUB,
      'react-native-mmkv': RN_STUB,
      'expo-file-system': RN_STUB,
      'expo-file-system/legacy': RN_STUB,
    },
  },
  test: {
    environment: 'node',
    include: [
      'utils/**/__tests__/**/*.test.ts',
      'hooks/**/__tests__/**/*.test.ts',
      'components/**/__tests__/**/*.test.tsx',
    ],
  },
});
