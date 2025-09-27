import { useCallback, useEffect, useState } from 'react';

import { useAtomValue } from 'jotai/react';

import { mushafRiwaya } from '@/jotai/atoms';
import { Chapter, Hizb, Page, QuranText, Specs, Surah, Thumn } from '@/types';

type LazyDataCache = {
  specsData?: Specs;
  surahData?: Surah[];
  chapterData?: Chapter[];
  thumnData?: Thumn[];
  hizbData?: Hizb[];
  ayaData?: Page[];
  quranData?: QuranText[];
};

type UseLazyQuranDataReturn = {
  // Essential data (loaded immediately)
  specsData: Specs;
  surahData: Surah[];
  isEssentialLoading: boolean;
  essentialError: string | null;

  // Lazy loaded data methods
  loadChapterData: () => Promise<Chapter[]>;
  loadNavigationData: () => Promise<{ thumnData: Thumn[]; hizbData: Hizb[] }>;
  loadPageData: () => Promise<Page[]>;
  loadQuranText: () => Promise<QuranText[]>;

  // Cache status
  isChapterDataLoaded: boolean;
  isNavigationDataLoaded: boolean;
  isPageDataLoaded: boolean;
  isQuranTextLoaded: boolean;
};

const cache: LazyDataCache = {};

export default function useLazyQuranData(): UseLazyQuranDataReturn {
  const mushafRiwayaValue = useAtomValue(mushafRiwaya);

  // Essential data - loaded immediately
  const [specsData, setSpecsData] = useState<Specs>({} as Specs);
  const [surahData, setSurahData] = useState<Surah[]>([]);
  const [isEssentialLoading, setIsEssentialLoading] = useState(true);
  const [essentialError, setEssentialError] = useState<string | null>(null);

  // Cache loading states
  const [isChapterDataLoaded, setIsChapterDataLoaded] = useState(false);
  const [isNavigationDataLoaded, setIsNavigationDataLoaded] = useState(false);
  const [isPageDataLoaded, setIsPageDataLoaded] = useState(false);
  const [isQuranTextLoaded, setIsQuranTextLoaded] = useState(false);

  // Load essential data immediately
  useEffect(() => {
    const loadEssentialData = async () => {
      try {
        setIsEssentialLoading(true);
        setEssentialError(null);

        // Use conditional imports instead of template literals for Metro compatibility
        if (mushafRiwayaValue === 'hafs') {
          const [specsModule, surahModule] = await Promise.all([
            import(
              '@/assets/quran-metadata/mushaf-elmadina-hafs-assim/specs.json'
            ),
            import(
              '@/assets/quran-metadata/mushaf-elmadina-hafs-assim/surah.json'
            ),
          ]);

          const specs = specsModule.default;
          const surah = surahModule.default;

          setSpecsData(specs);
          setSurahData(surah);

          // Cache the data
          cache.specsData = specs;
          cache.surahData = surah;
        } else {
          const [specsModule, surahModule] = await Promise.all([
            import(
              '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/specs.json'
            ),
            import(
              '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/surah.json'
            ),
          ]);

          const specs = specsModule.default;
          const surah = surahModule.default;

          setSpecsData(specs);
          setSurahData(surah);

          // Cache the data
          cache.specsData = specs;
          cache.surahData = surah;
        }
      } catch (err) {
        setEssentialError(
          `Failed to load essential data: ${err instanceof Error ? err.message : String(err)}`,
        );
      } finally {
        setIsEssentialLoading(false);
      }
    };

    loadEssentialData();
  }, [mushafRiwayaValue]);

  // Lazy load chapter data
  const loadChapterData = useCallback(async (): Promise<Chapter[]> => {
    if (cache.chapterData) {
      return cache.chapterData;
    }

    if (mushafRiwayaValue === 'hafs') {
      const chapterModule = await import(
        '@/assets/quran-metadata/mushaf-elmadina-hafs-assim/chapter.json'
      );
      cache.chapterData = chapterModule.default;
    } else {
      const chapterModule = await import(
        '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/chapter.json'
      );
      cache.chapterData = chapterModule.default;
    }

    setIsChapterDataLoaded(true);
    return cache.chapterData;
  }, [mushafRiwayaValue]);

  // Lazy load navigation data (thumn + hizb)
  const loadNavigationData = useCallback(async (): Promise<{
    thumnData: Thumn[];
    hizbData: Hizb[];
  }> => {
    if (cache.thumnData && cache.hizbData) {
      return { thumnData: cache.thumnData, hizbData: cache.hizbData };
    }

    if (mushafRiwayaValue === 'hafs') {
      const [thumnModule, hizbModule] = await Promise.all([
        import('@/assets/quran-metadata/mushaf-elmadina-hafs-assim/thumn.json'),
        import('@/assets/quran-metadata/mushaf-elmadina-hafs-assim/hizb.json'),
      ]);

      cache.thumnData = thumnModule.default;
      cache.hizbData = hizbModule.default;
    } else {
      const [thumnModule, hizbModule] = await Promise.all([
        import(
          '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/thumn.json'
        ),
        import('@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/hizb.json'),
      ]);

      cache.thumnData = thumnModule.default;
      cache.hizbData = hizbModule.default;
    }

    setIsNavigationDataLoaded(true);
    return { thumnData: cache.thumnData, hizbData: cache.hizbData };
  }, [mushafRiwayaValue]);

  // Lazy load page data
  const loadPageData = useCallback(async (): Promise<Page[]> => {
    if (cache.ayaData) {
      return cache.ayaData;
    }

    if (mushafRiwayaValue === 'hafs') {
      const ayaModule = await import(
        '@/assets/quran-metadata/mushaf-elmadina-hafs-assim/aya.json'
      );
      cache.ayaData = ayaModule.default.coordinates as Page[];
    } else {
      const ayaModule = await import(
        '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/aya.json'
      );
      cache.ayaData = ayaModule.default.coordinates as Page[];
    }

    setIsPageDataLoaded(true);
    return cache.ayaData;
  }, [mushafRiwayaValue]);

  // Lazy load Quran text data
  const loadQuranText = useCallback(async (): Promise<QuranText[]> => {
    if (cache.quranData) {
      return cache.quranData;
    }

    const quranModule = await import(
      '@/assets/quran-metadata/shared/quran.json'
    );
    cache.quranData = quranModule.default as QuranText[];
    setIsQuranTextLoaded(true);

    return cache.quranData;
  }, []);

  return {
    // Essential data
    specsData,
    surahData,
    isEssentialLoading,
    essentialError,

    // Lazy loaders
    loadChapterData,
    loadNavigationData,
    loadPageData,
    loadQuranText,

    // Cache status
    isChapterDataLoaded,
    isNavigationDataLoaded,
    isPageDataLoaded,
    isQuranTextLoaded,
  };
}
