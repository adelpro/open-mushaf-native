import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';
import prettierPlugin from 'eslint-plugin-prettier';
import reactCompilerPlugin from 'eslint-plugin-react-compiler';

const ignores = [
  'dist/',
  'android/',
  'ios/',
  'design/',
  'screenshots/',
  'assets/',
  '.expo/',
  'node_modules/',
  'firebase.json',
  'google-services.json',
  '.firebase',
  '*-lock.json',
];

export default defineConfig([
  {
    ignores,
  },
  expoConfig,
  {
    plugins: {
      prettier: prettierPlugin,
      'react-compiler': reactCompilerPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'react-compiler/react-compiler': 'error',
      'sort-imports': [
        'error',
        { ignoreCase: true, ignoreDeclarationSort: true },
      ],
      'import/order': [
        'error',
        {
          groups: [
            ['external', 'builtin'],
            'internal',
            ['sibling', 'parent'],
            'index',
          ],
          pathGroups: [
            {
              pattern: '@(react|react-native)',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@src/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['internal', 'react'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
]);
