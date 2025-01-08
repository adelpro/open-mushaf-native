module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    'header-max-length': [2, 'always', 200],

    'scope-case': [2, 'always', 'lower-case'],

    'subject-case': [2, 'always', 'lower-case'],

    'type-case': [2, 'always', 'lower-case'],

    'type-enum': [
      2,

      'always',

      [
        'feat', // New feature or functionality
        'fix', // Bug fix or correction
        'docs', // Documentation changes
        'style', // Code style changes (e.g., formatting, whitespace)
        'refactor', // Code refactoring without changing functionality
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'chore', // Routine tasks like build process or dependency updates
        'revert', // Reverting a previous commit
      ],
    ],
  },
};
