/**
 * Hook that exposes the qurani.ai narration cache for the active
 * riwaya. Reads the flat `bundle.json` from disk if present, otherwise
 * fetches it once and persists. Builds three indices in-memory:
 *
 *  - `ayahByGid`       : gid → QuranApiText (the canonical lookup)
 *  - `layoutNumberByGid`: gid → per-narration `numberInSurah`
 *  - `gidByLayoutKey`  : `${surah}:${numberInSurah}` → gid (inverse
 *                         of the above, used by hit-test lookups)
 *
 * Cold start: if the cache is missing, the hook returns
 * `{ isReady: false, ...emptyIndices }` and the home tab routes to
 * the first-launch wizard. Once the wizard's download completes and
 * `quranApiCacheVersion` is bumped, this hook re-reads from disk and
 * populates the indices.
 *
 * `usePageBundle(page, riwaya)` is exposed on the cache object so
 * consumers can lazy-load just the verses for the page they're
 * viewing (see `hooks/usePageBundle.ts`).
 */

import { useEffect, useState } from 'react';

import { useAtomValue } from 'jotai/react';

import { RIWAYA_TO_QURANI_EDITION } from '@/constants/quraniEditions';
import { mushafRiwaya } from '@/jotai/atoms';
import { Riwaya } from '@/types';
import type { QuranApiText } from '@/types/quran-api';
import {
  getCompleteQuran,
  QuranApiPage,
  QuranApiSurah,
} from '@/utils/api/qurani';
import {
  isRiwayaBundleCached,
  persistRiwayaBundle,
  readRiwayaBundleFromDisk,
} from '@/utils/api/qurani/cache';

type AyahIndex = Map<number, QuranApiText>;
type LayoutNumberIndex = Map<number, number>;
type GidByLayoutKeyIndex = Map<string, number>;

export type RiwayaCacheState = {
  /** Active app riwaya (e.g. `hafs`). Drives which bundle we read. */
  riwaya: Riwaya | null;
  /** True once the indices are populated (from disk or network). */
  isReady: boolean;
  /** gid → text + metadata. */
  ayahByGid: AyahIndex;
  /** gid → narrative-local number (the per-riwaya display number). */
  layoutNumberByGid: LayoutNumberIndex;
  /** Inverse: `${surah}:${numberInSurah}` → gid (for hit-test lookups). */
  gidByLayoutKey: GidByLayoutKeyIndex;
  /** Surah metadata list, ordered 1..114. */
  surahList: {
    number: number;
    name: string;
    englishName: string;
    numberOfAyahs: number;
  }[];
  /** Lazy per-page loader — see `hooks/usePageBundle.ts`. */
  loadPage: (
    page: number,
    signal?: AbortSignal,
  ) => Promise<{
    page: number;
    topPageSurah: number;
    topPageJuz: number;
    hizbNumbers: number[];
    ayahs: QuranApiText[];
  } | null>;
};

/**
 * Flatten the API's nested surahs[] → verses[] shape into the
 * per-gid row shape we persist on disk.
 */
function flatten(surahs: QuranApiSurah[]): QuranApiText[] {
  const out: QuranApiText[] = [];
  for (const s of surahs) {
    for (const a of s.ayahs) {
      out.push({
        gid: a.number,
        surah: s.number,
        numberInSurah: a.numberInSurah,
        page: a.page,
        juz: a.juz,
        hizbQuarter: a.hizbQuarter,
        manzil: a.manzil,
        ruku: a.ruku,
        text: a.text,
        sajda: a.sajda,
      });
    }
  }
  return out;
}

/** Convert a flat page response into the per-page bundle shape. */
function pageBundleFromApi(page: QuranApiPage): {
  page: number;
  topPageSurah: number;
  topPageJuz: number;
  hizbNumbers: number[];
  ayahs: QuranApiText[];
} {
  return {
    page: page.number,
    topPageSurah: page.topPageSurah.number,
    topPageJuz: page.topPageJuz,
    hizbNumbers: page.hizbNumbers,
    ayahs: page.ayahs.map((a) => ({
      gid: a.number,
      surah: a.surah.number,
      numberInSurah: a.numberInSurah,
      page: a.page,
      juz: a.juz,
      hizbQuarter: a.hizbQuarter,
      manzil: a.manzil,
      ruku: a.ruku,
      text: a.text,
      sajda: a.sajda,
    })),
  };
}

/**
 * Lazy per-page loader — module-level helper so it stays outside the
 * `useEffect` IIFE and avoids the rules-of-hooks violation that a
 * `useCallback` inside an async block would introduce.
 */
async function loadPageFor(
  riwaya: Riwaya,
  page: number,
  signal?: AbortSignal,
): Promise<{
  page: number;
  topPageSurah: number;
  topPageJuz: number;
  hizbNumbers: number[];
  ayahs: QuranApiText[];
} | null> {
  try {
    const { getPage } = await import('@/utils/api/qurani');
    const { persistPageSnapshot } = await import('@/utils/api/qurani/cache');
    const edition = RIWAYA_TO_QURANI_EDITION[riwaya];
    const live = await getPage(page, edition, signal);
    const bundle = pageBundleFromApi(live);
    void persistPageSnapshot(riwaya, page, JSON.stringify(bundle));
    return bundle;
  } catch {
    return null;
  }
}

const EMPTY_STATE: RiwayaCacheState = {
  riwaya: null,
  isReady: false,
  ayahByGid: new Map(),
  layoutNumberByGid: new Map(),
  gidByLayoutKey: new Map(),
  surahList: [],
  loadPage: async () => null,
};

export function useRiwayaCache(): RiwayaCacheState {
  const riwaya = useAtomValue(mushafRiwaya);
  const [state, setState] = useState<RiwayaCacheState>(EMPTY_STATE);

  useEffect(() => {
    let cancelled = false;

    if (!riwaya) {
      setState({ ...EMPTY_STATE });
      return () => {
        cancelled = true;
      };
    }

    const edition = RIWAYA_TO_QURANI_EDITION[riwaya];

    (async () => {
      // 1) Disk first
      let flat: QuranApiText[] = [];
      try {
        const cached = await isRiwayaBundleCached(riwaya);
        if (cached) {
          const raw = await readRiwayaBundleFromDisk(riwaya);
          if (raw) flat = JSON.parse(raw) as QuranApiText[];
        }
      } catch {
        // Fall through to network fetch.
      }

      // 2) Network fallback (best-effort — empty array if it fails)
      if (flat.length === 0) {
        try {
          const surahs = await getCompleteQuran(edition);
          flat = flatten(surahs);
          // Persist for next cold start. Best-effort.
          void persistRiwayaBundle(riwaya, JSON.stringify(flat));
        } catch {
          flat = [];
        }
      }

      // 3) Build the in-memory indices
      const ayahByGid = new Map<number, QuranApiText>();
      const layoutNumberByGid = new Map<number, number>();
      const gidByLayoutKey = new Map<string, number>();
      const surahSet = new Map<
        number,
        {
          number: number;
          name: string;
          englishName: string;
          numberOfAyahs: number;
        }
      >();
      for (const a of flat) {
        ayahByGid.set(a.gid, a);
        layoutNumberByGid.set(a.gid, a.numberInSurah);
        gidByLayoutKey.set(`${a.surah}:${a.numberInSurah}`, a.gid);
        if (!surahSet.has(a.surah)) {
          surahSet.set(a.surah, {
            number: a.surah,
            name: '',
            englishName: '',
            numberOfAyahs: 0,
          });
        }
      }
      // Derive `numberOfAyahs` per surah from the max `numberInSurah`
      // we observed (handles narration-specific counts like Warsh's
      // 285 ayahs in Baqarah).
      for (const a of flat) {
        const s = surahSet.get(a.surah);
        if (s) {
          s.numberOfAyahs = Math.max(s.numberOfAyahs, a.numberInSurah);
        }
      }
      const surahList = Array.from(surahSet.values()).sort(
        (a, b) => a.number - b.number,
      );

      if (cancelled) return;

      const loadPage = (
        page: number,
        signal?: AbortSignal,
      ): Promise<{
        page: number;
        topPageSurah: number;
        topPageJuz: number;
        hizbNumbers: number[];
        ayahs: QuranApiText[];
      } | null> => loadPageFor(riwaya, page, signal);

      setState({
        riwaya,
        isReady: true,
        ayahByGid,
        layoutNumberByGid,
        gidByLayoutKey,
        surahList,
        loadPage,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [riwaya]);

  return state;
}
