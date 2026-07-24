/**
 * Phase-5 rewrite of `useQuranSearch` against qurani.ai's
 * `/search/<keyword>` endpoint. Online-only.
 *
 * Inputs:
 *   - `query`         — debounced search text (caller is responsible
 *                        for debouncing; the hook itself only
 *                        guards against empty queries)
 *   - `edition`       — qurani.ai edition id (defaults to the active
 *                        riwaya's qurani.ai edition)
 *   - `page`, `limit` — pagination
 *
 * Returns `{ results, totalCount, isLoading, error }`. The `gid` of
 * each result is the qurani.ai canonical id, suitable for routing
 * back to a page via `usePageBundle({page, riwaya})`.
 *
 * The previous implementation imported `quran-search-engine` and
 * ran a local search against bundled morphology + word-map. The
 * package is dropped in this phase (see `package.json`) and the
 * `assets/search/` folder is deleted.
 */

import { useCallback, useEffect, useState } from 'react';

import { useAtomValue } from 'jotai/react';

import { RIWAYA_TO_QURANI_EDITION } from '@/constants/quraniEditions';
import { mushafRiwaya } from '@/jotai/atoms';
import { QuranApiError, searchQuran } from '@/utils/api/qurani';
import type { SearchHit } from '@/utils/api/qurani';

export type SearchStatus = 'idle' | 'loading' | 'ready' | 'error';

export type UseQuranSearchState = {
  results: SearchHit[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  /** Force a re-fetch (e.g. retry CTA on the search screen). */
  reload: () => void;
};

type UseQuranSearchArgs = {
  query: string;
  /** Optional override; defaults to the active riwaya's qurani.ai edition. */
  edition?: string;
  page?: number;
  limit?: number;
};

export function useQuranSearch({
  query,
  edition,
  page = 1,
  limit = 20,
}: UseQuranSearchArgs): UseQuranSearchState {
  const riwaya = useAtomValue(mushafRiwaya);
  const resolvedEdition =
    edition ?? (riwaya ? RIWAYA_TO_QURANI_EDITION[riwaya] : 'quran-hafs');

  const [results, setResults] = useState<SearchHit[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setTotalCount(0);
      setStatus('idle');
      setError(null);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    setStatus('loading');
    setError(null);

    (async () => {
      try {
        const response = await searchQuran(
          trimmed,
          {
            edition: resolvedEdition,
            size: limit,
            page,
          },
          controller.signal,
        );
        if (cancelled) return;
        setResults(response.ayahs);
        setTotalCount(response.count);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        if (err instanceof QuranApiError && err.kind === 'aborted') {
          // Request was cancelled by a newer search; stay quiet.
          return;
        }
        setResults([]);
        setTotalCount(0);
        setStatus('error');
        setError(
          err instanceof QuranApiError
            ? `qurani.ai ${err.kind}: ${err.message}`
            : err instanceof Error
              ? err.message
              : String(err),
        );
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [query, resolvedEdition, page, limit, nonce]);

  return {
    results,
    totalCount,
    isLoading: status === 'loading',
    error,
    reload,
  };
}
