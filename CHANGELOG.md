# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased - 5.2]

### Added

- Interactive reading progress chart with daily and weekly metrics tracking (Pages / Hizbs) and selectable tracking periods (7, 30, 90 days)
- Monthly grouping for the 90-day chart so longer tracking periods stay readable
- Locale-aware digit and month-name formatting in the reading chart (Arabic-Indic / Persian / Western digits based on the device locale)
- Dev-only mock data fallback so the reading chart renders in Expo Go (where MMKV cannot load) without overriding real history
- Tracking records distinction: differentiate "no record yet" days from "read 0" days in chart calculations and visuals
- `trackingStartedAt` caption so users who haven't filled the full window know the chart isn't missing data

### Changed

- Optimized reading chart UI: styled both metric selectors (Pages/Hizbs) and daily/weekly togglers with symmetric, equal-width outlined buttons
- Simplified reading statistics layout by removing period-over-period comparison text
- Cleaned up daily progress tracking math and improved Arabic pluralization logic for fractional hizb counts
- Reading chart now uses an "effective" daily average that only divides by days with a record, so recent starters aren't diluted by untracked days
- Chart x-axis labels now render as day ranges ("D-D") with a secondary month label on month boundaries and a partial-bucket caption for incomplete trailing weeks/months

### Fixed

- Fixed unselictable disabled option in hizb notification settings
- Fixed riwaya default mismatch: settings selector showed 'hafs' but the app loaded 'warsh' metadata on a fresh install
- Fixed SegmentedControl internal state not syncing with `initialSelectedIndex` prop changes from the underlying atom
- Fixed x-axis day names visibility on the 7-day chart by dynamically centering and expanding label containers to prevent Arabic weekday text truncation
- Fixed Feather icon color in the tracker reset button and set a transparent background on the tracker layout

## [5.1.0-athar] - 2026-03-20

### Changed

- Upgrade quran search engine package to the athar version

### Fixed

- Android safe area inset
- Reading chart eastern numbers

## [5.0.0-athar] - 18-03-2026

## Added

- Tutorial & Safe Area Fixes
- Standardize Error Messages
- Type Consolidation & UI Refinement
- Add Default Parameter Values to Prevent Undefined Behavior
- Add JSDoc Documentation
- Standardize camelCase naming in tracker.tsx and MushafPage.tsx
- Search Component UX Improvements & Debounce Loading States
- Standardize Component and hook Exports
- Haptic Feedback
- Add Reading Chart with Historical Tracking & Pages/Hizbs Toggle
- Add ErrorBoundary Component & Base Error Logger
- Add Rate on Store button to Settings
- Add accessibility labels and hints to interactive elements for screen reader support
- Add empty state illustration for no results

## Fixed

- iOS Edge-to-Edge Support, Safe Area Optimization, and RTL Alignment
- Update pan gesture constants, add sensitivity settings, and fix navigation glitch
- Changelog modal RTL alignment and semantic list structure
- Address PR review feedback for reminders feature
- Platform-specific changelogs, RTL and safe area for What's New modal
- Remove duplicated thumn entry in mushaf-elmadina-warsh-azrak
- Use iOS safe area inset instead of hardcoded top margin
- Replace raw route names in back button labels
- Add accessibility labels to icon-only buttons
- iOS physical device QA audit, closes #24
- Issue 41

## Changed

- Type Consolidation & UI Refinement

## [4.3.0] - 2025-??-??

### Fixed

- now the data in the android widget is correctly synced with the app

### Security

## [4.2.0] - 2025-??-??

### Added

- add Android widget

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [4.0.0] - 2025-??-??

### Added

### Changed

### Deprecated

### Removed

- removed riwaya warsh mujawad from el maarifah (because of copyright)

### Fixed

### Security

## [3.7.0] - 2025-??-??

### Added

- Add new mushaf riwaya warsh mujawad from el maarifah
- Add besmala aya count to mushaf specs
- Add slides presentation (our story)

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [3.6.1] - 2025-??-??

### Added

- Add Swipe navigation to the tutorial screen

### Changed

### Deprecated

### Removed

### Fixed

- fixed migration error from b3.6.0 (expo sdk 53)

### Security

## [3.5.2] - 2025-??-??

### Added

- Add share button

### Changed

- Updated Colors.ts with new primary, secondary, and accent colors

### Deprecated

### Removed

### Fixed

- Fix Tafseer popup scroll issue

### Security

## [3.5.1] - 2025-??-??

### Added

### Changed

- clean-up multiple unused packages

### Deprecated

### Removed

### Fixed

- Update metro.config to fix build error from b3.5.0

### Security

## [3.5.0] - 2025-??-??

### Added

### Changed

- Migrate to Expo SDK 53
- Migrate from expo-av to expo-audio (End of support)
- Migrate from Recoil to Jotai (end of support)
- Migrate from @react-native-community/slider to react-native-awesome-slider
- Update @gorhom/bottom-sheet
- Update react-native-safe-area-context

### Deprecated

### Removed

### Fixed

### Security

## [3.4.1] - 2025-??-??

### Added

### Changed

- Add a max width to the bottom menu

### Deprecated

### Removed

### Fixed

- Minor UI and logics fix in the service-worker
- Minor errors in the bottom menu icons
- Minor errors in the reading top banner save button

### Security

## [3.4.0] - 2025-??-??

### Added

- Add Yandex verification file for domain ownership
- Add IndexNow protocol to the web version
- Add 'Asbab Nozool from el-wahidi'
- Add 'tafseer wasseet'
- Add 'tafseer tanweer'

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [3.3.0] - 2025-??-??

### Added

- Add collapsible functionality to Reading Position Banner
- Add documentations website

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [3.2.9] - 2025-??-??

### Added

### Changed

- Add a quran metadata json file management system

### Deprecated

### Removed

- Remove the react-native-toast-message package

### Fixed

### Security

## [3.2.8] - 2025-??-??

### Added

- Add Reading Tracker feature (daily)
- Add surah name, current juz and juz progress in the top menu

### Changed

- Refactor the navigation lists ui/uix

### Deprecated

### Removed

### Fixed

### Security

## [3.2.6] - 2025-??-??

### Added

- Add SEO optimization with Open Graph and Twitter card support
- Add PWA support

### Changed

- Web improved offline capabilities

### Deprecated

### Removed

### Fixed

### Security

## [3.2.5] - 2025-??-??

### Added

- Add advanced search option using fuse.js

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [3.2.4] - 2025-??-??

### Added

- Add preload system to speedup mushaf navigation
- Implement web deployment support (Firebase Hosting)

### Changed

### Deprecated

### Removed

### Fixed

### Security
