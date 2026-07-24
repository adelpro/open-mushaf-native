/**
 * Phase-1 implementation of `useQuranMetadata`.
 *
 * Previously (pre-qurani.ai) this hook imported bundled JSON from
 * `assets/quran-metadata/...`. Phase 0 deleted those bundles. This
 * implementation derives every field from `useRiwayaCache`, which
 * reads the qurani.ai narration cache from disk or network.
 *
 * Mapping from cache fields to legacy types:
 *  - `surahData` (114 entries, with `startingPage` + `numberOfAyahs`)
 *    comes from the cache's `surahList`, with `startingPage` derived
 *    from the lowest `page` value observed per surah.
 *  - `ayaData` (page → verses) is built on the fly by grouping the
 *    flat `ayahByGid` map by `page`. Pre-Phase-0 this came from
 *    bundled `aya.json` polygons; we keep the same shape (`Aya[]`
 *    with `[sura, aya, x, y]`) but `x`/`y` default to 0 because
 *    text rendering doesn't need polygons.
 *  - `chapterData` (juz info), `hizbData`, `thumnData` are derived
 *    from each ayah's `juz`, `hizbQuarter` (hizb = ceil(q / 4)),
 *    `hizbQuarter` (thumn = q).
 *  - `specsData` is a hardcoded set of layout constants; `pages`
 *    is always 604 in the qurani.ai model.
 *  - `quranData` is the legacy search-engine shape, kept here so
 *    existing code that imports it continues to compile. Phase 5
 *    will replace it with qurani.ai's search endpoint.
 */

import { useMemo } from 'react';

import {
  Page as AyaPage,
  Chapter,
  Hizb,
  QuranText,
  Specs,
  Surah,
  Thumn,
} from '@/types';

import { useRiwayaCache } from './useRiwayaCache';

type QuranMetadata = {
  thumnData: Thumn[];
  hizbData: Hizb[];
  surahData: Surah[];
  ayaData: AyaPage[];
  specsData: Specs;
  chapterData: Chapter[];
  quranData: QuranText[];
  isLoading: boolean;
  error: string | null;
};

export function useQuranMetadata(): QuranMetadata {
  const cache = useRiwayaCache();

  return useMemo<QuranMetadata>(() => {
    if (!cache.isReady) {
      return {
        thumnData: [],
        hizbData: [],
        surahData: [],
        ayaData: [],
        specsData: { defaultNumberOfPages: 604 } as Specs,
        chapterData: [],
        quranData: [],
        isLoading: true,
        error: null,
      };
    }

    const ayahByGid = cache.ayahByGid;

    // ────── First-page-of-surah (used by surahData.startingPage) ──────
    const firstPageBySurah = new Map<number, number>();
    ayahByGid.forEach((a) => {
      const cur = firstPageBySurah.get(a.surah);
      if (cur === undefined || a.page < cur) {
        firstPageBySurah.set(a.surah, a.page);
      }
    });

    // ────── surahData ──────
    const surahData: Surah[] = cache.surahList.map((s) => ({
      number: s.number,
      name: s.name || '',
      englishName: s.englishName || '',
      englishNameTranslation: '',
      numberOfAyahs: s.numberOfAyahs,
      revelationType: s.number <= 86 ? 'Meccan' : 'Medinan',
      startingPage: firstPageBySurah.get(s.number) ?? 1,
    }));

    // ────── ayaData: page → [sura, aya, 0, 0][] (legacy shape) ──────
    const maxPage = 604;
    const pageMap: Map<number, [number, number, number, number][]> = new Map();
    ayahByGid.forEach((a) => {
      const list = pageMap.get(a.page) ?? [];
      list.push([a.surah, a.numberInSurah, 0, 0]);
      pageMap.set(a.page, list);
    });
    const ayaData: AyaPage[] = [[]];
    for (let p = 1; p <= maxPage; p++) {
      ayaData.push(pageMap.get(p) ?? []);
    }

    // ────── chapterData: 30 juzs, startingPage per juz ──────
    const juzFirstPage = new Map<number, number>();
    ayahByGid.forEach((a) => {
      const cur = juzFirstPage.get(a.juz);
      if (cur === undefined || a.page < cur) {
        juzFirstPage.set(a.juz, a.page);
      }
    });
    const chapterData: Chapter[] = [];
    for (let j = 1; j <= 30; j++) {
      const startingPage = juzFirstPage.get(j);
      if (startingPage !== undefined) {
        chapterData.push({
          number: j,
          startingPage,
          name: `الجزء ${j}`,
        } as Chapter);
      }
    }

    // ────── hizbData: 60 hizbs (each = 4 hizbQuarters) ──────
    const hizbFirstPage = new Map<number, number>();
    ayahByGid.forEach((a) => {
      const hizbNumber = Math.ceil(a.hizbQuarter / 4);
      const cur = hizbFirstPage.get(hizbNumber);
      if (cur === undefined || a.page < cur) {
        hizbFirstPage.set(hizbNumber, a.page);
      }
    });
    const hizbData: Hizb[] = [];
    for (let h = 1; h <= 60; h++) {
      const startingPage = hizbFirstPage.get(h);
      if (startingPage !== undefined) {
        hizbData.push({
          number: h,
          verses_count: 0,
          first_verse_key: '',
          last_verse_key: '',
          verse_mapping: {} as unknown,
          startingPage,
        } as Hizb);
      }
    }

    // ────── thumnData: 240 thumns (each = 1 hizbQuarter) ──────
    const thumnFirstPage = new Map<number, number>();
    const thumnSurah = new Map<number, number>();
    const thumnStartingAya = new Map<number, number>();
    ayahByGid.forEach((a) => {
      const t = a.hizbQuarter;
      if (!thumnFirstPage.has(t)) {
        thumnFirstPage.set(t, a.page);
        thumnSurah.set(t, a.surah);
        thumnStartingAya.set(t, a.numberInSurah);
      }
    });
    const thumnData: Thumn[] = [];
    for (let t = 1; t <= 240; t++) {
      const startingPage = thumnFirstPage.get(t);
      if (startingPage !== undefined) {
        thumnData.push({
          hizb_number: Math.ceil(t / 4),
          thumn: ((t - 1) % 4) + 1,
          sura_number: thumnSurah.get(t) ?? 1,
          starting_aya: thumnStartingAya.get(t) ?? 1,
          startingPage,
        } as Thumn);
      }
    }

    // ────── specsData ──────
    const specsData: Specs = {
      defaultNumberOfPages: 604,
      // Phase 0 cut removed `countBesmalAya` semantics; qurani.ai data
      // already accounts for Bismillah-of-Fatiha per narration.
      countBesmalAya: false,
    } as Specs;

    // ────── quranData: legacy search-engine shape ──────
    const quranData: QuranText[] = Array.from(ayahByGid.values()).map((a) => ({
      gid: a.gid,
      sura_id: a.surah,
      aya_id: a.numberInSurah,
      aya_id_display: String(a.numberInSurah),
      uthmani: a.text,
      standard: a.text,
      standard_full: a.text,
      page_id: a.page,
      juz_id: a.juz,
      sura_name: '',
      sura_name_en: '',
      sura_name_romanization: '',
    }));

    return {
      thumnData,
      hizbData,
      surahData,
      ayaData,
      specsData,
      chapterData,
      quranData,
      isLoading: false,
      error: null,
    };
  }, [cache]);
}
