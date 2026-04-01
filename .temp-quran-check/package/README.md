<p align="center">
  <img src="./assets/800x450.png" width="850" height="400" alt="quran-search-engine logo" />
</p>

# quran-search-engine

[![npm](https://img.shields.io/npm/v/quran-search-engine)](https://www.npmjs.com/package/quran-search-engine)
[![downloads](https://img.shields.io/npm/dm/quran-search-engine)](https://www.npmjs.com/package/quran-search-engine)
![TypeScript](https://img.shields.io/badge/ts-yes-blue)
[![Changelog](https://img.shields.io/badge/changelog-view-brightgreen)](https://github.com/adelpro/quran-search-engine/releases)
![license](https://img.shields.io/npm/l/quran-search-engine)

Stateless, UI-agnostic Quran (Qur'an) search engine for Arabic text in pure TypeScript:

- Arabic normalization
- Exact text search
- Lemma + root matching (via morphology + word map)
- Highlight ranges (UI-agnostic)

## Table of contents

- [Why this library](#why-this-library)
- [Installation](#installation)
- [Development Setup](#development-setup)
- [Quickstart](#quickstart)
- [Public API](#public-api)
- [How scoring works](#how-scoring-works)
- [Multi-word search](#multi-word-search)
- [Core types](#core-types)
- [Non-goals](#non-goals)
- [Example apps](#example-apps)
- [Testing](#testing)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Why this library

Most Quran search solutions are:

- tightly coupled to a UI
- server-bound or stateful
- hard to customize or extend
- weakly typed

**quran-search-engine** is designed to be:

- UI-agnostic (React, Vue, React Native, Node)
- fully client-side or server-side
- stateless and deterministic
- TypeScript-first and strongly typed

You control the data, rendering, and persistence.

## Installation

This project uses **pnpm** as the default package manager for optimal performance, caching, and workspace management. pnpm provides:

- **Faster installs** through global content-addressable storage
- **Efficient disk usage** by hard-linking packages from a global store
- **Better workspace support** for monorepo management
- **Strict dependency resolution** preventing phantom dependencies

```bash
pnpm install quran-search-engine
```

<details> <summary>Other package managers</summary>
<br>
npm install quran-search-engine <br>
yarn add quran-search-engine <br>

</details>

## Development Setup

This is a **pnpm workspace** monorepo containing the main library and example applications. The workspace is configured in `pnpm-workspace.yaml` to include:

- The main library (root package)
- All examples in the `examples/` directory

### Prerequisites

Install pnpm if you haven't already:

```bash
npm install -g pnpm
# or
corepack enable pnpm
```

### Setup Commands

```bash
# Install all dependencies for the workspace and examples
pnpm install

# Build the main library
pnpm build

# Run tests across the workspace
pnpm test
```

## Quickstart

> Note: examples assume an async context (Node 18+, ESM, or browser).

```ts
import {
  search,
  loadMorphology,
  loadQuranData,
  loadWordMap,
  type SearchResponse,
} from 'quran-search-engine';

const [quranData, morphologyMap, wordMap] = await Promise.all([
  loadQuranData(),
  loadMorphology(),
  loadWordMap(),
]);
// Example output:
// quranData.length => 6236
// morphologyMap.size => 6236
// Object.keys(wordMap).length => (depends on dataset)

const response: SearchResponse = search('الله الرحمن', quranData, morphologyMap, wordMap, {
  lemma: true,
  root: true,
});

response.results.forEach((v) => {
  console.log(v.sura_id, v.aya_id, v.matchType, v.matchScore);
});
// Example output:
// 1 1 exact 6
// 1 3 lemma 4
```

JavaScript (Node / ESM):

```js
import { search, loadMorphology, loadQuranData, loadWordMap } from 'quran-search-engine';

const [quranData, morphologyMap, wordMap] = await Promise.all([
  loadQuranData(),
  loadMorphology(),
  loadWordMap(),
]);

const response = search('الله الرحمن', quranData, morphologyMap, wordMap, {
  lemma: true,
  root: true,
});

console.log(response.results[0]);
// Example output (shape):
// { gid: 1, matchType: 'exact', matchScore: 6, matchedTokens: ['...'], ... }
```

## Public API

Everything documented below is exported from `quran-search-engine` (aligned with `src/index.ts`).

### Data loading

#### `loadQuranData()`

Use case: load the Quran dataset once at app startup (browser or Node), then reuse in searches.

```ts
import { loadQuranData, type QuranText } from 'quran-search-engine';

const quranData: QuranText[] = await loadQuranData();
// Example output:
// quranData[0] => { gid: 1, uthmani: '...', standard: '...', sura_id: 1, aya_id: 1, ... }
```

#### `loadMorphology()`

Use case: enable lemma/root search and scoring.

```ts
import { loadMorphology, type MorphologyAya } from 'quran-search-engine';

const morphologyMap: Map<number, MorphologyAya> = await loadMorphology();
// Example output:
// morphologyMap.get(1) => { gid: 1, lemmas: ['...'], roots: ['...'] }
```

#### `loadWordMap()`

Use case: map normalized query tokens to their canonical lemma/root.

```ts
import { loadWordMap, type WordMap } from 'quran-search-engine';

const wordMap: WordMap = await loadWordMap();
// Example output:
// wordMap['الله'] => { lemma: 'الله', root: 'ا ل ه' }
```

### Normalization

#### `removeTashkeel(text)`

Use case: stripping diacritics (tashkeel) for display or simple comparisons.

```ts
import { removeTashkeel } from 'quran-search-engine';

const out = removeTashkeel('بِسْمِ ٱللَّهِ');
// out => 'بسم الله'
```

#### `normalizeArabic(text)`

Use case: preparing user input for searching (unifies alef variants, removes tashkeel, etc).

```ts
import { normalizeArabic } from 'quran-search-engine';

const out = normalizeArabic('بِسْمِ ٱللَّهِ');
// out => 'بسم الله'
```

### Search

#### `search(query, quranData, morphologyMap, wordMap, options?, pagination?)`

Main entry point. Combines:

- Exact text matching
- Lemma/root matching (when enabled and available)
- Fuzzy fallback (Fuse) per token

Use case: your primary API for Quran search results + scoring + pagination.

Set `options.fuzzy = false` to disable fuzzy fallback.

```ts
import { search } from 'quran-search-engine';

const response = search(
  'الله الرحمن',
  quranData,
  morphologyMap,
  wordMap,
  { lemma: true, root: true },
  { page: 1, limit: 10 },
);
// Example output:
// response.pagination => { totalResults: 42, totalPages: 5, currentPage: 1, limit: 10 }
// response.counts => { simple: 10, lemma: 18, root: 9, fuzzy: 5, total: 42 }
// response.results[0] => { gid: 123, matchType: 'exact', matchScore: 9, matchedTokens: ['...'], ... }
```

| Match type | Score per hit        |
| ---------- | -------------------- |
| Exact      | +3                   |
| Lemma      | +2                   |
| Root       | +1                   |
| Fuzzy      | +0.5 (fallback only) |

If you need a simple “contains all tokens in a field” filter for your own data, you can do:

```ts
import { normalizeArabic } from 'quran-search-engine';

export function containsAllTokens(value: string, query: string): boolean {
  const normalizedQuery = normalizeArabic(query);
  if (!normalizedQuery) return false;

  const tokens = normalizedQuery.split(/\s+/);
  const normalizedValue = normalizeArabic(value);
  return tokens.every((token) => normalizedValue.includes(token));
}
```

#### Custom datasets

`search` accepts any dataset shape as long as each record satisfies `VerseInput`:

```ts
export type VerseInput = {
  gid: number;
  uthmani: string;
  standard: string;
};
```

Minimum requirements:

- `gid`: unique verse id (used to join with `morphologyMap`)
- `standard`: used for exact text matching
- `uthmani`: used for fuzzy fallback and commonly used for highlighting in UI (if you don’t have it, set it to `standard`)

Custom dataset example:

```ts
import { search, type VerseInput, type WordMap, type MorphologyAya } from 'quran-search-engine';

type MyVerse = VerseInput & {
  sura: number;
  aya: number;
  translation_en?: string;
};

const myQuranData: MyVerse[] = [
  {
    gid: 1,
    standard: 'بسم الله الرحمن الرحيم',
    uthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    sura: 1,
    aya: 1,
    translation_en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
  },
];

const morphologyMap = new Map<number, MorphologyAya>();
const wordMap: WordMap = {};

const response = search('الله الرحمن', myQuranData, morphologyMap, wordMap, {
  lemma: false,
  root: false,
});
// Example output:
// response.results[0] => { gid: 1, sura: 1, aya: 1, matchType: 'exact', matchScore: 6, ... }
```

For lemma/root matching, provide both:

- `morphologyMap: Map<number, MorphologyAya>` where `MorphologyAya` is `{ gid, lemmas: string[], roots: string[] }`
- `wordMap: WordMap` where each normalized token maps to `{ lemma?: string; root?: string }`

### Highlighting (UI-agnostic)

#### `getHighlightRanges(text, matchedTokens, tokenTypes?)`

Computes non-overlapping highlight ranges. This is pure (no HTML output), so the consumer controls rendering.

Use case: highlight matches in UI without `dangerouslySetInnerHTML`.

```ts
import { getHighlightRanges } from 'quran-search-engine';

const ranges = getHighlightRanges(verse.uthmani, verse.matchedTokens, verse.tokenTypes);
// Example output (shape):
// [
//   { start: 12, end: 23, token: 'الله', matchType: 'exact' },
//   { start: 30, end: 45, token: 'الرحمن', matchType: 'lemma' },
// ]
```

React rendering example:

```tsx
import { getHighlightRanges, type ScoredQuranText } from 'quran-search-engine';
import type { ReactNode } from 'react';

export function Verse({ verse }: { verse: ScoredQuranText }) {
  const ranges = getHighlightRanges(verse.uthmani, verse.matchedTokens, verse.tokenTypes);
  if (ranges.length === 0) return <span>{verse.uthmani}</span>;

  const parts: ReactNode[] = [];
  let cursor = 0;

  ranges.forEach((r, i) => {
    if (cursor < r.start) parts.push(verse.uthmani.slice(cursor, r.start));
    parts.push(
      <span key={`${r.start}-${r.end}-${i}`} className={`highlight highlight-${r.matchType}`}>
        {verse.uthmani.slice(r.start, r.end)}
      </span>,
    );
    cursor = r.end;
  });

  if (cursor < verse.uthmani.length) parts.push(verse.uthmani.slice(cursor));

  return <span>{parts}</span>;
}
```

## How scoring works

`search` returns `ScoredQuranText` results with `matchScore`, `matchType`, `matchedTokens`, and `tokenTypes`.

- The query is cleaned to Arabic letters/spaces, then normalized, then split by whitespace into tokens.
- For each query token, scoring accumulates across match layers:
  - Exact word matches in the verse: `+3` per matched word
  - Lemma matches (when enabled): `+2` per matched word
  - Root matches (when enabled): `+1` per matched word
  - Fuzzy matches: only used as a fallback when the verse has no exact/lemma/root matches; `+0.5` per fuzzy segment extracted from Fuse indices
- `matchedTokens` is deduplicated (used for highlighting).
- `matchType` is the best “overall” type seen on that verse (`exact` > `lemma` > `root` > `fuzzy`/`none`).

## Multi-word search

`search` supports multi-word queries.

- Query tokenization: the normalized query is split by whitespace.
- AND logic:
  - `search` intersects matches per token, so results must match every token (via exact, lemma/root, or fuzzy fallback for that token).

Example:

```ts
const response = search('الله الرحمن', quranData, morphologyMap, wordMap, {
  lemma: true,
  root: true,
});
// Example output:
// response.results => all returned verses match BOTH tokens (AND logic)
```

## Core types

These are the main types you’ll interact with when calling `search(...)` and rendering results.

```ts
import type {
  HighlightRange,
  MatchType,
  MorphologyAya,
  PaginationOptions,
  QuranText,
  ScoredQuranText,
  SearchOptions,
  SearchCounts,
  SearchResponse,
  WordMap,
} from 'quran-search-engine';
```

### `QuranText`

One verse record in the dataset (input to `search`).

```ts
export type QuranText = {
  gid: number;
  uthmani: string;
  standard: string;
  sura_id: number;
  aya_id: number;
  aya_id_display: string;
  page_id: number;
  juz_id: number;
  sura_name: string;
  sura_name_en: string;
  sura_name_romanization: string;
  standard_full: string;
};
```

### `MorphologyAya`

Morphology info for one verse (looked up by `gid` via a `Map<number, MorphologyAya>`).

```ts
export type MorphologyAya = {
  gid: number;
  lemmas: string[];
  roots: string[];
};
```

### `WordMap`

Dictionary mapping a normalized token to lemma/root. Used to resolve query tokens into canonical forms for lemma/root matching.

```ts
export type WordMap = {
  [normalizedToken: string]: {
    lemma?: string;
    root?: string;
  };
};
```

### `SearchOptions`

Toggles for linguistic matching:

```ts
export type SearchOptions = {
  lemma: boolean;
  root: boolean;
  fuzzy?: boolean;
};
```

### `PaginationOptions`

Controls paging (defaults are applied if omitted):

```ts
export type PaginationOptions = {
  page?: number;
  limit?: number;
};
```

### `MatchType`

Overall “best” match class for a verse:

```ts
export type MatchType = 'exact' | 'lemma' | 'root' | 'fuzzy' | 'none';
```

### `ScoredQuranText`

The verse returned by `search`, including scoring and highlighting metadata:

```ts
export type ScoredQuranText = QuranText & {
  matchScore: number;
  matchType: MatchType;
  matchedTokens: string[];
  tokenTypes?: Record<string, MatchType>;
};
```

### `SearchResponse`

Full response from `search`:

```ts
export type SearchResponse = {
  results: ScoredQuranText[];
  counts: SearchCounts;
  pagination: {
    totalResults: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
};
```

### `HighlightRange`

Range output from `getHighlightRanges(...)`:

```ts
export type HighlightRange = {
  start: number;
  end: number;
  token: string;
  matchType: MatchType;
};
```

## Non-goals

This library does not aim to provide:

- AI or semantic interpretation
- Tafsir or meaning inference
- Opinionated UI rendering
- Server-side indexing infrastructure

It focuses strictly on deterministic Quran text search.

## Example apps

> [!IMPORTANT]
> **Note for Developers**: This project uses a pnpm workspace with `workspace:*` links. If you make changes to the library's source code in `src/`, you **must build the library** using `pnpm build` (or run it in watch mode with `pnpm build --watch`) for those changes to be reflected in the example applications.

Several example applications are available in the `examples/` directory:

- **React + Vite**: Full-featured web app with search UI (`examples/vite-react`)
- **Vanilla TypeScript**: Simple browser-based search without frameworks (`examples/vanilla-ts`)
- **Node.js**: Server-side search with command-line interface (`examples/nodejs`)

To run any example:

```bash
pnpm -C examples/<example-name> install
pnpm -C examples/<example-name> dev  # or start for Node.js
```

## Testing

This project includes comprehensive test coverage and verification tools.

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Test Coverage

The test suite covers:

- **Core Search Logic**: `search()` and `simpleSearch()` functions
- **Tokenization**: Exact, lemma, and root matching algorithms
- **Arabic Normalization**: Text processing utilities (`removeTashkeel`, `normalizeArabic`)
- **Data Loading**: Quran data, morphology, and word map loading utilities
- **Highlighting**: UI-agnostic highlight range generation

**Note**: These are **unit tests** that test individual functions in isolation. For integration testing, see the Verification Script below.

### Verification Script

For comprehensive end-to-end verification, run the included verification script:

```bash
# Build the library first
pnpm build

# Then run verification (requires tsx or similar TypeScript runner)
pnpm tsx scripts/verify-loader.ts
```

This script performs **integration testing** that validates the complete search pipeline:

- **Data Loading**: Tests Quran data, morphology, and word map loading with performance timing
- **Simple Search**: Validates basic text search functionality
- **Advanced Search**: Tests morphological matching (lemma/root), scoring, and pagination
- **Pagination**: Verifies page navigation and result differentiation across pages
- **Highlighting**: Tests token extraction for UI highlighting features

**Key Differences from Unit Tests:**

- **Scope**: Integration test vs. isolated unit tests
- **Dependencies**: Tests real data loading and full function pipelines
- **Performance**: Measures actual loading times and search performance
- **End-to-End**: Validates the complete user workflow from data to results
- **Purpose**: Catches integration issues that unit tests might miss

### Test Structure

```
src/
├── core/
│   ├── search.test.ts       # Search algorithm tests
│   └── tokenization.test.ts # Token matching tests
└── utils/
    ├── loader.test.ts       # Data loading tests
    ├── normalization.test.ts # Text processing tests
    └── highlight.ts         # Highlighting utilities
```

## Development

```bash
pnpm run lint
pnpm run test
pnpm run build
```

## Contributing

- Open an issue to discuss larger changes before starting implementation.
- Keep changes focused and include tests when applicable.
- Ensure checks pass locally: `pnpm run lint && pnpm run test && pnpm run build`.

## Contact

- Adel Benyahia — <contact@adelpro.us.kg>

## License

MIT
