import css from '@eslint/css';
import { FlatCompat } from '@eslint/eslintrc';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import reactCompilerPlugin from 'eslint-plugin-react-compiler';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Create a FlatCompat instance to transform legacy configs.
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Convert legacy shareable configs to flat config using FlatCompat.
  ...compat.extends('eslint-config-expo'),
  ...compat.extends('eslint-config-prettier'),
  {
    ignores: [
      'dist/', // Add your ignore patterns here
      'android/',
      'ios/',
      'design/',
      'screenshots/',
      'assets/',
      '.expo/',
      'node_modules/',
      '*-lock.json',
    ],
  },

  // CSS config.
  {
    files: ['**/*.css'],
    language: 'css/css',
    ...css.configs.recommended,
    rules: {
      'css/no-empty-blocks': 'error',
      'css/no-duplicate-imports': 'warn',
    },
  },

  // JavaScript/TypeScript config.
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      import: importPlugin,
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
];
