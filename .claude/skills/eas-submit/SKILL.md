---
name: eas-submit
description: Build and submit an open-mushaf-native release via EAS. Use when the user wants to ship a new iOS / Android build to TestFlight, App Store, Play Store, or internal testing. User-only (side effects: triggers real builds and store submissions).
disable-model-invocation: true
---

# eas-submit

Ship open-mushaf-native to a store or internal track via EAS. This is a
**destructive** workflow — it triggers paid EAS build minutes, may
upload to App Store Connect / Play Console, and bumps the version in
`app.json`. Confirm every step.

## Inputs (ask the user)

1. **Platform** — `ios` | `android` | `both` (default: ask)
2. **Profile** — `preview` | `production` | `internal` (default: `production`)
3. **Version bump** — `patch` | `minor` | `major` | `none` (default: `patch`)
4. **Submit after build?** — `yes` | `no` (default: `yes` for production)

## Workflow

### 1. Pre-flight checks

Run these and stop if any fails:

```bash
git status                          # must be clean tree
git log --oneline -1                # last commit
yarn type-check                     # must pass
yarn lint                           # must pass
```

If `git status` is dirty, stop and tell the user to commit first.

### 2. Bump version in `app.json`

Read the current `expo.version` field. Bump per the user's choice:
- `patch`: `6.0.1` → `6.0.2`
- `minor`: `6.0.1` → `6.1.0`
- `major`: `6.0.1` → `7.0.0`
- `none`: skip

For iOS, also bump `expo.ios.buildNumber` to `Date.now()` or to a
user-supplied value. For Android, `expo.android.versionCode` is computed
automatically by EAS at submit time — do not edit manually unless the
user insists.

Edit `app.json` directly with the Edit tool. Confirm the diff with the
user before continuing.

### 3. Guard check

Inspect the diff for these gotchas — all of which have bitten this
project before:

- `ios.infoPlist.UIBackgroundModes` — must not contain `"audio"` unless
  the app actually plays persistent background audio (this app does
  not; page-flip SFX is foreground-only).
- `ios.infoPlist` — no duplicate keys in any array (`UIBackgroundModes`,
  `ITSAppUsesNonExemptEncryption`, etc.).
- `android.permissions` — `POST_NOTIFICATIONS` and `SCHEDULE_EXACT_ALARM`
  must be present if reminders are enabled in app settings.

If any guard fails, **stop and tell the user**. Do not proceed.

### 4. Build

For each platform in scope, run:

```bash
# iOS production
eas build -p ios --profile production --non-interactive

# iOS preview (TestFlight internal)
eas build -p ios --profile preview --non-interactive

# Android production
eas build -p android --profile production --non-interactive

# Android preview (internal APK)
eas build -p android --profile preview --non-interactive
```

Stream the EAS build URL back to the user. Builds typically take
8–15 minutes. Do not poll — tell the user to wait for the EAS
notification.

### 5. Submit (only if user said yes)

```bash
# App Store
eas submit -p ios --profile production --latest --non-interactive

# Play Store internal track
eas submit -p android --profile production --latest --non-interactive

# Play Store internal (separate profile)
eas submit -p android --profile internal --latest --non-interactive
```

After submit, report the App Store Connect / Play Console URL.

### 6. Commit the version bump

```bash
git add app.json
yarn commit
# type: chore(release): vX.Y.Z
```

## Common failure modes

| Symptom | Cause | Fix |
|---|---|---|
| `eas.json` profile missing | new profile added locally but not committed | commit `eas.json` first |
| `ascAppId` mismatch | wrong Apple App Store Connect app ID | check `eas.json` `submit.production.ios.ascAppId` |
| Build rejected for `UIBackgroundModes` | duplicate or unjustified audio entry | remove `audio` from `ios.infoPlist.UIBackgroundModes` |
| `GoogleService-Info.plist` not found | Firebase config not in repo (correct) | let EAS use env var / credential from `eas.json` |

## Recent history

- v6.0.0 build 5 was **rejected** by Apple Guideline 2.5.4 for a
  duplicate `UIBackgroundModes: ["audio"]` entry in `app.json`. The
  page-flip SFX audio is foreground-only and does not need background
  audio entitlement. Always run the guard check (step 3) before
  triggering an iOS build.