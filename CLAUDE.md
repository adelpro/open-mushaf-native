# open-mushaf-native — Claude Code Rules

## Project

Expo SDK 54 / React Native 0.81 / TypeScript 5.9. Quran reader app, ships to
iOS (App Store), Android (Play Store), and Web (Firebase Hosting).

## System design (required reading)

Before making architectural, widget, theming, state, or platform changes, read
**[`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md)** at the repo root. It is the source of
truth for how the app is structured today (architecture, Jotai/MMKV, Android
widget light/dark design, RTL/theming, web/PWA, CI, known gotchas). Prefer it
over guessing from partial file reads; update it when you change system-level
behavior.

## Hard rules

- **Package manager:** Yarn 1.22 (`yarn install`, `yarn add`). Never `npm`.
- **iOS config source:** `app.json` `ios` section. There is **no native
  `ios/` folder** (managed workflow). Editing `ios.infoPlist` here writes
  to the generated native config at `expo prebuild` time.
- **Guarded files:** `app.json`, `eas.json`, `google-services.json`,
  `GoogleService-Info.plist`. Changes to `app.json` `ios` / `android`
  blocks must be deliberate — see recent history: duplicate
  `UIBackgroundModes: ["audio"]` caused App Store Guideline 2.5.4
  rejection of v6.0.0 build 5.
- **State management:** Jotai (`jotai` + `jotai-effect`). Do not introduce
  Redux, Zustand, or React Context for state.
- **Storage:** `react-native-mmkv` (sync). Do not wrap reads in async.
- **Fonts:** Amiri + Tajawal via `@expo-google-fonts`. Do not bundle fonts
  in `assets/fonts/`.
- **Tests:** Vitest (`yarn test`). `jest-expo` is in deps for one-off
  snapshot tests but the day-to-day runner is Vitest.

## Build / ship commands

| Goal                     | Command                                           |
| ------------------------ | ------------------------------------------------- |
| Dev server               | `yarn start`                                      |
| Type check               | `yarn type-check`                                 |
| Lint                     | `yarn lint` (eslint, `--max-warnings=0`)          |
| Format                   | `yarn format`                                     |
| Android preview build    | `yarn android:build:preview`                      |
| Android production build | `yarn android:build:production`                   |
| iOS release build        | `eas build -p ios --profile production`           |
| Submit to App Store      | `eas submit -p ios --profile production --latest` |
| Web preview deploy       | `yarn deploy:preview`                             |
| Web live deploy          | `yarn deploy:live`                                |

## EAS profiles (from `eas.json`)

- `preview` — internal Android APK for testing
- `production` — Play Store / App Store release
- `internal` — Android internal track submit

iOS production profile uses `ascAppId: 6783070437`.

## Commit conventions

Conventional commits enforced by `@commitlint`. Use `yarn commit` (commitizen),
not raw `git commit`. Scopes: `ios`, `android`, `web`, `expo`, `deps`,
`a11y`, `perf`, `docs`.

## When making changes

- After editing any `.ts` / `.tsx` file: `yarn type-check && yarn lint` must
  pass before claiming done.
- After editing `app.json` / `eas.json`: explain why the change is needed
  in the commit body — config drift is the #1 source of release bugs here.
- After editing web-affecting code: run `yarn web:export` once to confirm
  the export still succeeds (catches Metro/web incompatibilities).
