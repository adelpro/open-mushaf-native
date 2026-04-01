# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.5]

### Added

- **Documentation**: Added a changelog badge to `README.md` linking to GitHub releases
- **CI/CD**: Added `prepublishOnly` script to `package.json` to automate builds before npm publishing
- **Distribution**: Configured package to include `CHANGELOG.md` in the published npm bundle
- **Assets**: Added assets images (png, svg) to the `assets` directory
- **Readme**: Added a logo to the top of `README.md`

### Fixed

- **Husky**: Fixed "DEPRECATED" warnings by migratng Git hooks to the simplified Husky v9 format

## [0.1.4] - 2026-01-18

### Added

- **Vanilla TypeScript Example**: Added a framework-free browser example (`examples/vanilla-ts`) demonstrating plain TypeScript implementation with DOM manipulation
- **Node.js Example**: Added a server-side command-line example (`examples/nodejs`) showing programmatic usage with detailed console output
- **Workspace Configuration**: Updated `pnpm-workspace.yaml` to include all examples in the monorepo
- **Documentation**: Updated main `README.md` to list and describe all available examples

## [0.1.2] - 2026-01-16

### Added

- **Example Application**: Added a complete React + Vite example in the `examples/vite-react/` directory demonstrating real-time search, highlighting, and pagination
- **Unit Tests**: Added comprehensive test suite using Vitest covering:
  - Tokenization (Exact, Lemma, Root matching)
  - Search logic (`simpleSearch` and `advancedSearch`)
  - Arabic normalization (`removeTashkeel`, `normalizeArabic`)
  - Data loading utilities
- **Documentation**: Updated `README.md` with detailed testing instructions and example usage

### Fixed

- Fixed edge case in `tokenization` where empty normalized queries could return false positives
- Corrected test logic in `search.test.ts` to accurately reflect token matching behavior

## [0.1.0] - 2026-01-16

### Added

- Initial release of `quran-search-engine`
- Core stateless advanced search functionality
- `simpleSearch` for fast filter-based searching
- `advancedSearch` supporting exact match, fuzzy search (Fuse.js), and linguistic match (root/lemma)
- Arabic text normalization utility `normalizeArabic`
- Data loading utility `loadMorphology`
- TypeScript definitions for `QuranText` and `SearchResult`
