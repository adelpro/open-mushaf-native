# open-mushaf-native — Claude Code Rules

## Project

Expo SDK 54 / React Native 0.81 / TypeScript 5.9. Quran reader app, ships to
iOS (App Store), Android (Play Store), and Web (Firebase Hosting).

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
| Build AI vector index    | `yarn build:vectors`                              |
| Build AI ONNX model      | `yarn build:model`                                |
| Build + upload ONNX      | `yarn build:model:upload <user>/<repo>`           |
| Build web ONNX layout    | `yarn build:model:web`                            |
| Build + upload web ONNX  | `yarn build:model:upload:web <user>/<repo>`       |
| Build all AI assets      | `yarn build:ai:full`                              |
| Verify AI search code    | `yarn verify:ai-search`                           |

## AI search build pipeline

The `بالذكاء الاصطناعي` tab in `/search` uses two components on each platform:

1. **Vector index** (`assets/ai-search/quran_vectors.bin` + meta JSON) — built
   from the in-repo `quran.json` + `muyassar.json` via
   `scripts/build_vectors.py` (Python `transformers` + `torch`). Pre-checks model
   availability on HF before generating. Run with `yarn build:vectors`.
   Outputs are committed to the repo.
2. **ONNX model** — Hosted on HuggingFace Hub. Two layouts, one per platform:
   - **Native** — flat directory (`ATM_V2_MODEL_BASE_URL` in `constants/aiSearch.ts`).
     Downloaded once on-device on first AI-search use via `expo-file-system`.
     To convert/export a new model to INT8 ONNX, run `yarn build:model`
     (`python scripts/convert_onnx.py`), and upload via
     `yarn build:model:upload <user>/<repo>`. If the model is already hosted on HF,
     no local export is needed.
   - **Web** — transformers.js layout (`ATM_V2_WEB_REPO_ID` /
     `AI_SEARCH_WEB_CDN_URL` in `constants/aiSearch.ts`). The `@huggingface/transformers`
     runtime is loaded from a CDN at runtime via `public/ai/transformers-loader.js`,
     so Metro never bundles it. The repo must be public (transformers.js fetches
     unauthenticated). Build with `yarn build:model:web` (adds `--emit-web-layout`
     to `convert_onnx.py`, which also fetches `config.json` from the base repo
     and merges `1_Pooling/config.json` if present) and upload with
     `yarn build:model:upload:web <user>/<repo>`. The web runtime uses
     `dtype: 'q8'` → `onnx/model_quantized.onnx` and runs the WASM backend
     single-threaded to avoid cross-origin isolation requirements.


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
