/**
 * Public surface for the qurani.ai API client.
 *
 * Consumers should import from `@/utils/api/qurani` rather than
 * reaching into individual files. The barrel re-exports the typed
 * endpoints, the low-level `quraniGet`, the error class, and the
 * endpoint constants.
 */

export { QURANI_BASE, quraniGet, type QuraniFetchOpts } from './client';

export { getCompleteQuran, getSurah, getPage, getAyah } from './quran';

export {
  searchQuran,
  SEARCH_DEFAULT_PAGE_SIZE,
  type SearchHit,
  type SearchOptions,
  type QuranApiSearchResponse,
} from './search';

export { listEditions, type EditionFilters } from './editions';

export {
  QuranApiError,
  type QuranApiEnvelope,
  type QuranApiSurah,
  type QuranApiSurahHeader,
  type QuranApiAyah,
  type QuranApiPage,
  type QuranApiEdition,
  type QuranApiEditionFormat,
  type QuranApiEditionType,
  type QuranApiErrorKind,
} from './types';
