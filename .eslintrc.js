module.exports = {
  extends: ['expo', 'prettier', 'plugin:jsx-a11y/recommended'],
  plugins: ['prettier', 'import', 'eslint-plugin-react-compiler', 'jsx-a11y'],
  rules: {
    'prettier/prettier': 'error',
    'react-compiler/react-compiler': 'error',
    'jsx-a11y/alt-text': 'warn', // for missing alt attributes in images
    'jsx-a11y/no-static-element-interactions': 'warn', // for missing role attributes
    'jsx-a11y/anchor-is-valid': 'warn', // for missing anchor role
    'sort-imports': [
      'error',
      { ignoreCase: true, ignoreDeclarationSort: true },
    ],
    // this is for sorting imports
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
};
