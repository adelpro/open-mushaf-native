/**
 * Hook that exposes a single downloaded translation's bundle.
 *
 *   const { textByGid, isLoading, isReady, error } = useTranslation({
 *     translationId: 'en.sahih',
 *   });
 *
 * Reads the flat `translation/<id>.json` from disk if present,
 * builds a gid → verse-text index in memory, and returns the
 * lookup function. Falls back to fetching `/quran/<id>` from
 * qurani.ai on miss and persists the result.
 *
 * Translation bundles are large (~2-3 MB flat JSON) so the hook
 * memoizes the parse and exposes a single per-gid lookup rather
 * than the per-page snapshot pattern used for narations.
 */

import { useEffect, useState } from 'react';

import { useAtomValue } from 'jotai/react';

import type { TranslationKey } from '@/constants/translations';
import { selectedTranslation } from '@/jotai/atoms';
import { getCompleteQuran, QuranApiSurah } from '@/utils/api/qurani';
import {
  isTranslationCached,
  persistTranslation,
  readTranslationFromDisk,
} from '@/utils/api/qurani/cache';

export type TranslationState = {
  translationId: TranslationKey | null;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  textByGid: Map<number, string>;
  /** Returns the translation text for a given gid, or null if missing. */
  getText: (gid: number) => string | null;
};

/**
 * Translate the qurani.ai `QuranApiSurah[]` (nested) shape into the
 * flat gid → text map we cache on disk.
 */
function flatten(surahs: QuranApiSurah[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const s of surahs) {
    for (const a of s.ayahs) {
      map.set(a.number, a.text);
    }
  }
  return map;
}

const EMPTY: TranslationState = {
  translationId: null,
  isLoading: false,
  isReady: false,
  error: null,
  textByGid: new Map(),
  getText: () => null,
};

export function useTranslation(args: {
  translationId?: TranslationKey | null;
}): TranslationState {
  // Use the explicit arg if provided, otherwise fall back to the
  // selectedTranslation atom. Callers that want to render a
  // translation that's not the user's active selection pass the
  // override.
  const selected = useAtomValue(selectedTranslation);
  const translationId =
    args.translationId !== undefined ? args.translationId : selected;

  const [state, setState] = useState<TranslationState>(EMPTY);

  useEffect(() => {
    if (!translationId) {
      setState(EMPTY);
      return;
    }

    let cancelled = false;
    setState((prev) => ({
      ...prev,
      translationId,
      isLoading: true,
      error: null,
    }));

    (async () => {
      // 1) Disk first
      let flat: Map<number, string> | null = null;
      try {
        if (await isTranslationCached(translationId)) {
          const raw = await readTranslationFromDisk(translationId);
          if (raw) {
            // The persisted JSON is the raw `QuranApiSurah[]` shape
            // from `/quran/<id>`. We re-flatten on each load to keep
            // the on-disk format stable (matches what the API
            // returns) and avoid a separate serialisation step.
            const parsed = JSON.parse(raw) as QuranApiSurah[];
            flat = flatten(parsed);
          }
        }
      } catch {
        // Fall through to network.
      }

      // 2) Network fallback
      if (!flat) {
        try {
          const surahs = await getCompleteQuran(translationId);
          flat = flatten(surahs);
          // Persist for next cold start. Best-effort.
          void persistTranslation(translationId, JSON.stringify(surahs));
        } catch {
          if (cancelled) return;
          setState({
            translationId,
            isLoading: false,
            isReady: false,
            error: 'فشل تحميل الترجمة',
            textByGid: new Map(),
            getText: () => null,
          });
          return;
        }
      }

      if (cancelled) return;

      const textByGid = flat ?? new Map<number, string>();
      const getText = (gid: number): string | null =>
        textByGid.get(gid) ?? null;

      setState({
        translationId,
        isLoading: false,
        isReady: true,
        error: null,
        textByGid,
        getText,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [translationId]);

  return state;
}
