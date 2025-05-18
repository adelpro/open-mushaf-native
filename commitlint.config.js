module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    'header-max-length': [2, 'always', 200],

    // Disable subject-case rule to allow any case in the subject
    'subject-case': [0, 'never'],

    // Keep type in lowercase (feat, fix, etc.)
    'type-case': [2, 'always', 'lower-case'],

    // Disable scope-case rule to allow any case in scope like (Test)
    'scope-case': [0, 'never'],

    // Allow longer body messages for detailed descriptions
    'body-max-line-length': [0, 'always'],

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
        'ci', // Changes to our CI configuration files and scripts
        'wip', // Work in progress
      ],
    ],
  },
};
