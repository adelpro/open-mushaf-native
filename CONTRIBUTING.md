# Contributing to Open-Mushaf Native

Thank you for considering contributing to **Open-Mushaf Native**! We appreciate your help in making this project better.

---

## 🤝 Code of Conduct

We are committed to providing a welcoming and inspiring community for all.

- **Respect**: Treat everyone with respect and kindness.
- **Inclusivity**: Welcome people of all backgrounds and identities.
- **Professionalism**: Focus on constructive feedback and collaboration.

**Reporting**: If you experience or witness unacceptable behavior, please contact the maintainer at [adelpro@gmail.com](mailto:adelpro@gmail.com).

---

## 🛠️ How to Contribute

### Development Setup

This project uses **yarn** for package management.

1. **Fork the Repository**
2. **Clone Your Fork**

   ```bash
   git clone https://github.com/your-username/open-mushaf-native.git
   cd open-mushaf-native
   ```

3. **Install Dependencies**

   ```bash
   yarn install
   ```

4. **Start the App**

   ```bash
   npx expo start
   ```

### Pull Requests

1. **Create a Branch**: Use a descriptive name like `feature/your-feature-name`.
2. **Make Your Changes**: Ensure your code follows the project's style guidelines.
3. **Test Locally**: Always run tests locally before pushing - do not rely solely on CI.
   ```bash
   yarn test
   yarn type-check
   ```
4. **Run Lint & Format**: Ensure code quality passes locally.
   ```bash
   yarn lint
   yarn format
   ```
5. **Build Check**: Verify the app builds successfully.
   ```bash
   yarn prebuild
   ```
6. **Commit Your Changes**: Use conventional commit messages (see below).
7. **Push to Your Fork** and open a Pull Request.

> ⚠️ **Important**: Always test your changes locally. Do not rely on CI or AI to catch all issues. AI assistants can help but may miss edge cases or introduce bugs. You are responsible for the code you submit.

---

## 📝 Commit Message Convention

This project uses **Conventional Commits** with Husky and Commitlint to enforce consistent commit messages.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type       | Description                                             |
| :--------- | :------------------------------------------------------ |
| `feat`     | A new feature                                           |
| `fix`      | A bug fix                                               |
| `docs`     | Documentation only changes                              |
| `style`    | Changes that don't affect code meaning (formatting)     |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test`     | Adding or updating tests                                |
| `chore`    | Changes to build process, dependencies, or tooling      |
| `ci`       | Changes to CI configuration                             |
| `perf`     | Performance improvement                                 |
| `revert`   | Reverting a previous commit                             |

### Example

```bash
# Using yarn commit (interactive)
yarn commit

# Or manual commit
git commit -m "feat(search): add fuzzy search for Quran verses"

# With body and footer
git commit -m "fix(tafseer): resolve popup not closing on swipe" -m "Closes #123"
```

### Commitlint Rules

- Header max length: 200 characters
- Type must be lowercase
- Subject should be concise and descriptive

---

## 🪝 Git Hooks (Husky)

This project uses Husky to run git hooks:

- **pre-commit**: Runs lint-staged (ESLint + Prettier on staged files)
- **commit-msg**: Validates commit messages using Commitlint

Hooks are automatically installed via `yarn prepare`.

---

## 🏷️ Issue Labels

We use labels to categorize issues and indicate their status.

| Label                 | Description                                  |
| :-------------------- | :------------------------------------------- |
| `type: bug`           | Something isn't working as expected.         |
| `type: enhancement`   | A request for a new feature or improvement.  |
| `type: documentation` | Improvements or additions to documentation.  |
| `difficulty: easy`    | Good for first-time contributors.            |
| `difficulty: medium`  | Requires some familiarity with the codebase. |

---

## 📜 License

This project is licensed under the **MIT License**.
See the [LICENSE](file:///d:/benyahia-dev/open-mushaf-native/LICENSE) for full details.

---

Thank you for your contributions!
