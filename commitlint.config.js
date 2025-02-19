module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
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
