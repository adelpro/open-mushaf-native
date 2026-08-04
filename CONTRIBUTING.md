# Contributing to Open Mushaf Native

This file covers how to contribute — tooling, workflow, and process. Product
behavior lives in [`docs/`](docs/introduction.md); cross-link rather than
duplicate.

## Contents

- [Welcome and TL;DR](#welcome-and-tldr)
- [Code of Conduct](#code-of-conduct)
- [Security](#security)
- [Requirements](#requirements)
- [Branch Model](#branch-model)
- [Development Workflow](#development-workflow)
- [Guarded Files](#guarded-files)
- [Pre-PR Quality Gate](#pre-pr-quality-gate)
- [Commit Messages](#commit-messages)
- [Verifying AI-Generated or Auto-Generated Code](#verifying-ai-generated-or-auto-generated-code)
- [Pull Requests](#pull-requests)
- [Adding a New Screen](#adding-a-new-screen)
- [Reporting Bugs and Requesting Features](#reporting-bugs-and-requesting-features)
- [Where to Ask Questions](#where-to-ask-questions)
- [License](#license)
- [Documentation Map](#documentation-map)

## Welcome and TL;DR

Open Mushaf Native is an Expo SDK 54 / React Native 0.81 / TypeScript 5.9 app
that ships to iOS, Android, and Web. Contributions are accepted via fork and
pull request.

Two non-negotiables, stated once so they do not surprise you later:

- The package manager is **Yarn 1.22.22 only**. A CI job fails the build if any
  non-Yarn lockfile is present.
- Commits go through `yarn commit` (Commitlint runs on every `commit-msg`).

Quick start:

```bash
git clone https://github.com/adelpro/open-mushaf-native.git
cd open-mushaf-native
yarn install
yarn start
```

Then press `a` for Android, `i` for iOS, or `w` for web. `yarn install` runs
the `prepare` script, which installs Husky hooks. The hooks are active
immediately; do not bypass them with `--no-verify`. If Metro is acting up,
`yarn start:clear` resets the cache.

## Code of Conduct

<!-- TODO: promote to a dedicated CODE_OF_CONDUCT.md when ready (Contributor
     Covenant 2.1 is the conventional choice). Until then, this section is the
     interim source of truth. -->

- **Respect.** Assume good faith. Critique code, not people.
- **Inclusivity.** The project serves a global audience. English and Arabic
  are both first-class in issues and PRs.
- **Professionalism.** No harassment, no personal attacks, no off-topic
  proselytizing in issues or PRs.

Report violations privately to `adelpro@gmail.com`. Reports are handled
confidentially. Maintainers may close or lock threads.

## Security

<!-- TODO: promote to a dedicated SECURITY.md when ready — only SECURITY.md
     surfaces in GitHub's "Report a vulnerability" UI. Until then, this
     section is the interim source of truth. -->

Do not open a public issue for a suspected vulnerability. Email
`adelpro@gmail.com` with:

- affected version or commit SHA
- platform (iOS, Android, or Web)
- reproduction steps
- impact in one sentence

Reproduce locally on a clean checkout before reporting:

```bash
yarn install
yarn start
```

Gitleaks scans this repo on every push, pull request, and on a daily schedule.
If your PR trips Gitleaks, rotate the exposed credential first and force-push
a clean history — do not just delete the line in a follow-up commit. See
[Guarded Files](#guarded-files) for the files most likely to leak secrets.

## Requirements

| Tool           | Version                 | Notes                                                             |
| :------------- | :---------------------- | :---------------------------------------------------------------- |
| Node.js        | `>=20` (20 LTS); 22 LTS | CI runs on Node 20.x                                              |
| Yarn           | `1.22.22`               | Pinned via `packageManager`; npm, pnpm, and bun lockfiles fail CI |
| Git            | any recent              |                                                                   |
| Watchman       | latest                  | Recommended on macOS and Linux for file watching                  |
| Expo CLI       | bundled                 | Use `npx expo` or the project scripts; no global install          |
| Xcode          | latest stable           | iOS simulator only                                                |
| Android Studio | latest stable           | Android emulator and SDK only                                     |

<!-- TODO: README states Node v22+, CI uses 20.x. Reconcile — either bump the
     CI matrix or relax the README. -->

This is a managed Expo workflow. There is no committed `ios/` folder.
`app.json` is the source of truth for native config. Run `yarn prebuild`
only if you genuinely need native directories, and do not commit them.

## Branch Model

| Branch    | Lifetime   | Purpose                               |
| :-------- | :--------- | :------------------------------------ |
| `main`    | long-lived | Production; GitHub default HEAD       |
| `staging` | long-lived | Pre-production verification           |
| `develop` | long-lived | Integration; where feature work lands |

**Base new work on `develop` and open pull requests against `develop`.**
Maintainers promote `develop` to `staging` to `main`.

Short-lived branch prefixes in use:

- `feature/<short-slug>`
- `fix/<short-slug>`
- `chore/<short-slug>`
- `docs/<short-slug>`
- `refactor/<short-slug>`
- `test/<short-slug>`

Release branches are bare-named by version (e.g. `b4.2.0`) and are cut by
maintainers. Contributors do not create them.

## Development Workflow

Running the app:

- `yarn start` — dev server
- `yarn start:clear` — dev server with cleared cache
- `yarn start:prod` — production-mode dev server
- `yarn start:atlas` — dev server with Expo Atlas bundle inspection
- `yarn android` / `yarn ios` / `yarn web` — platform-specific launch

What is enforced:

- **TypeScript strict mode.** `tsconfig.json` has `strict: true`, `target`
  and `module` set to `es2020`, and the path alias `@/*` mapped to the repo
  root. Prefer `@/...` imports over deep relative paths.
- **ESLint flat config (v9).** Errors, not warnings, on:
  `react-compiler/react-compiler`, `prettier/prettier`, `sort-imports`
  (`ignoreCase: true`, `ignoreDeclarationSort: true`), and `import/order`.
  The `import/order` group order is
  `external + builtin` then `internal` then `sibling + parent` then `index`,
  alphabetized ascending, with a newline between groups.
- **Prettier.** Single quotes, trailing commas `all`, `printWidth: 80`,
  semicolons on, `tabWidth: 2`, bracket spacing on, `arrowParens: always`,
  `endOfLine: auto`. Do not hand-format — run `yarn format`.
- **Lint with zero warnings.** Every ESLint message is treated as blocking.

Architecture constraints that save review round-trips:

- **State.** Jotai. Do not introduce Redux, Zustand, or React Context for app
  state.
- **Storage.** `react-native-mmkv` with the synchronous API. Do not wrap it
  in `async` or Promises.
- **Fonts.** Amiri and Tajawal come from `@expo-google-fonts`. They are not
  bundled in `assets/fonts/`. Do not add font binaries.
- **Tests.** Vitest day-to-day. `jest-expo` is installed but used only for
  occasional snapshots — do not add new Jest suites.

**One concern per PR.** Unrelated formatting churn will be asked out.

The Husky `pre-commit` hook runs `npx lint-staged`, which calls
`npx eslint --fix --cache` and `prettier --write` on `*.{js,jsx,ts,tsx}`. Your
staged files will be rewritten. Re-stage them before committing.

## Guarded Files

Four files are guarded because a careless edit breaks builds or leaks
credentials:

- `app.json`
- `eas.json`
- `google-services.json`
- `GoogleService-Info.plist`

When a pull request touches any of these, explain _why_ in the commit body
(not just the subject) and call it out in the PR description.

`app.json` is the source of truth for native config in this managed workflow;
changing it changes native builds. Any `app.json` or Expo dependency change
must be followed by `yarn doctor`.

Never commit real credentials into `google-services.json` or
`GoogleService-Info.plist` in a fork PR — Gitleaks will flag it. See
[Security](#security).

## Pre-PR Quality Gate

CI runs `yarn format:check`, `yarn lint`, `yarn test:coverage`,
`yarn type-check`, and a build check across the `development`, `staging`, and
`production` profiles. Run the same locally first.

Always:

1. `yarn format` — apply Prettier. `yarn format:check` is what CI runs and
   only verifies.
2. `yarn lint` — ESLint. If it complains, run `yarn lint:fix`, then re-read
   the diff.
3. `yarn type-check` — `tsc` in strict mode.
4. `yarn test` — Vitest. The runner uses `--passWithNoTests`, so a green run
   does not prove your change is covered.
5. `yarn test:coverage` — before pushing. This is what CI uploads to Codecov.

Conditionally:

- Touched `app.json` or any Expo dependency — run `yarn doctor`.
- Added or changed a component — run `yarn react-compiler-check`.
- Touched web-affecting code — run `yarn web:export` once to confirm the
  export succeeds.

If the workspace is in a bad state, `yarn clean:all` and `yarn fresh` reset
it.

The `android:build:*`, `android:submit:*`, and `deploy:*` scripts are
maintainer and release tooling. Do not run them against project credentials.

## Commit Messages

Commitlint enforces Conventional Commits on every `commit-msg`. The format is:

```
type(scope): subject
```

Allowed types, verbatim from `commitlint.config.js`:

`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`,
`ci`, `wip`.

Rules, verbatim from `commitlint.config.js`:

- `type-case` — lowercase.
- `header-max-length` — 200 characters.
- `subject-case` — disabled. No casing requirement on the subject.
- `scope-case` — disabled.

Conventional scopes in use: `ios`, `android`, `web`, `expo`, `deps`, `a11y`,
`perf`, `docs`.

Wrap the body at 100 columns. The body is required when the commit touches a
[Guarded File](#guarded-files) — say _why_, not _what_.

Use `yarn commit` (Commitizen) rather than raw `git commit`; it builds a
conforming header interactively.

Husky hooks:

- `pre-commit` — `npx lint-staged` (ESLint `--fix` + Prettier on staged JS
  and TS).
- `commit-msg` — `npx commitlint --edit`.

Do not bypass these with `--no-verify`.

Example:

```text
feat(search): add fuzzy match scoring for Quran verses

The previous implementation only supported exact substring matches. Users
typing partial phrases saw no results. Add Fuse.js with threshold 0.4 and
weight on diacritics-stripped text.
```

## Verifying AI-Generated or Auto-Generated Code

AI-assisted contributions are welcome; unverified ones are not. You are the
author of every line you submit.

- Build and run it locally — `yarn start` plus the target platform. A diff
  that only type-checks has not been tested.
- Re-read the full diff line by line before pushing, not just the parts you
  prompted for.
- Run the project's own gates — see [Pre-PR Quality Gate](#pre-pr-quality-gate).
  Generated code routinely violates `import/order`, `sort-imports`, and
  `react-compiler/react-compiler`.
- Add or update tests covering the behavior you changed. `--passWithNoTests`
  will not catch a missing suite.
- Check for invented APIs: hallucinated Expo modules, non-existent props, and
  dependencies that are not in `package.json`.
- Verify it respects the architecture constraints in
  [Development Workflow](#development-workflow). Generated React Native code
  defaults to React Context or Redux and to wrapping storage in `async`; both
  are wrong here.
- **If you cannot explain why a line is there, rewrite or remove it.**

Reviewers may ask you to explain any hunk. "The model wrote it" is not an
answer.

## Pull Requests

<!-- TODO: the PR template is currently at
     .github/ISSUE_TEMPLATE/pull_request_template.md; GitHub only honors
     .github/pull_request_template.md. Relocate it. Out of scope for this PR. -->

Target branch is `develop` unless a maintainer asks otherwise. See
[Branch Model](#branch-model).

Fill out the PR template that GitHub applies automatically. Do not delete its
sections; write "n/a" instead.

Required in the description:

- What changed and why, in two sentences.
- `Fixes #<n>` for issues the PR closes; `Refs #<n>` for related-but-not-
  closing.
- Before and after screenshots or a screen recording for any user-visible
  change. State which platform(s) they are from.
- Platforms tested: iOS, Android, and/or Web.
- Confirmation that the [Pre-PR Quality Gate](#pre-pr-quality-gate) passed
  locally.

One logical change per PR. Keep the branch rebased on `develop`; resolve
conflicts yourself. Mark work-in-progress as a draft PR, or use the `wip`
commit type, rather than opening a PR you do not want reviewed.

### What to expect from review

CI runs `yarn format:check`, `yarn lint`, `yarn test:coverage` (→ Codecov),
`yarn type-check`, and a build check across `development`, `staging`, and
`production`, plus `detect-package-managers` and Gitleaks. All must be green
before review.

Maintainers review manually after CI is green. Expect questions about _why_,
not just _what_. Review may request changes for
[Development Workflow](#development-workflow) violations even when CI is
green — the linter cannot catch those.

This is a volunteer-maintained project; response times vary.

## Adding a New Screen

Screens use Expo Router; they live under the app directory. Before writing
anything, read the canonical guides:

- [`docs/navigation.md`](docs/navigation.md) — how navigation is structured.
- [`docs/mushaf_interface.md`](docs/mushaf_interface.md) — the primary
  reading surface and its conventions.
- [`docs/settings.md`](docs/settings.md) — if the screen introduces a
  user-facing preference.
- [`docs/top_menu.md`](docs/top_menu.md) — if the screen needs a menu entry.

Process reminders:

- State via Jotai atoms. Persisted preferences via `react-native-mmkv`,
  synchronous.
- RTL and Arabic typography are first-class. Verify layout in Arabic before
  opening the PR.
- New component → run `yarn react-compiler-check`.
- Screen reachable on web → run `yarn web:export`.
- If the behavior is documented in `docs/`, update that file in the same PR.

## Reporting Bugs and Requesting Features

Templates live in `.github/ISSUE_TEMPLATE/`. Pick one:

- [`bug_report.md`](.github/ISSUE_TEMPLATE/bug_report.md) — auto-labeled
  `type: bug`.
- [`feature_request.md`](.github/ISSUE_TEMPLATE/feature_request.md) —
  auto-labeled `type: enhancement`.
- [`question.md`](.github/ISSUE_TEMPLATE/question.md) — auto-labeled
  `type: question`.
- [`blank-issue.md`](.github/ISSUE_TEMPLATE/blank-issue.md) — for anything
  that fits none of the above.

Bug reports must include:

- Numbered steps to reproduce.
- Expected versus actual behavior.
- Platform and version (iOS, Android, or Web; OS version; app version or
  commit SHA).
- Relevant logs or Metro or console output — as text, not screenshots.
- Screenshots or a recording for visual bugs.
- Whether it reproduces on a clean `yarn install` checkout.

Feature requests: describe the problem before the solution. Note which
platforms it affects.

Security issues do not go here — see [Security](#security).

## Where to Ask Questions

- [GitHub Discussions](https://github.com/adelpro/open-mushaf-native/discussions)
  for usage questions, ideas, and "is this a bug?" triage.
- The Question issue template for specific, answerable questions.
- `contact@adelpro.us.kg` is for [Security](#security) and
  [Code of Conduct](#code-of-conduct) matters only, not support.

Support the project via [`.github/FUNDING.yml`](.github/FUNDING.yml) if you
wish.

## License

This project is licensed under the MIT License — see [`LICENSE`](LICENSE).

Copyright (c) 2024 adelpro.

By submitting a pull request you agree that your contribution is licensed
under the MIT License and that you have the right to submit it. If you
include third-party code or assets, state the source and its license in the
PR description; incompatible licenses will be rejected.

## Documentation Map

CONTRIBUTING.md covers process. Product behavior is documented in `docs/`.
Cross-link rather than re-explain.

| Guide                                                  | Covers                                  |
| :----------------------------------------------------- | :-------------------------------------- |
| [`docs/introduction.md`](docs/introduction.md)         | Overview of the Open Mushaf product     |
| [`docs/mushaf_interface.md`](docs/mushaf_interface.md) | Primary reading surface and conventions |
| [`docs/navigation.md`](docs/navigation.md)             | App navigation flow                     |
| [`docs/lists.md`](docs/lists.md)                       | Surahs, juz, pages, bookmarks           |
| [`docs/search.md`](docs/search.md)                     | Quran search feature                    |
| [`docs/settings.md`](docs/settings.md)                 | In-app settings                         |
| [`docs/top_menu.md`](docs/top_menu.md)                 | Top menu navigation                     |
| [`docs/reminders.md`](docs/reminders.md)               | Reminders feature                       |
| [`docs/tracker.md`](docs/tracker.md)                   | Reading tracker and statistics          |
| [`docs/tafseer.md`](docs/tafseer.md)                   | Tafseer (exegesis) feature              |

Run the docs site locally with `yarn docs:start`. If you change behavior
described in `docs/`, update that file in the same PR.
