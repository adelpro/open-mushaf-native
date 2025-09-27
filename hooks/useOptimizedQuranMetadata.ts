import { useEffect, useState } from 'react';

import { Chapter, Hizb, Page, QuranText, Specs, Surah, Thumn } from '@/types';

import useLazyQuranData from './useLazyQuranData';

type QuranMetadata = {
  thumnData: Thumn[];
  hizbData: Hizb[];
  surahData: Surah[];
  ayaData: Page[];
  specsData: Specs;
  chapterData: Chapter[];
  quranData: QuranText[];
  isLoading: boolean;
  error: string | null;
};

/**
 * Optimized version of useQuranMetadata with lazy loading
 * Loads essential data first, then progressively loads other data based on usage
 */
export default function useOptimizedQuranMetadata(options?: {
  preloadChapters?: boolean;
  preloadNavigation?: boolean;
  preloadPageData?: boolean;
  preloadQuranText?: boolean;
}): QuranMetadata {
  const {
    specsData,
    surahData,
    isEssentialLoading,
    essentialError,
    loadChapterData,
    loadNavigationData,
    loadPageData,
    loadQuranText,
  } = useLazyQuranData();

  // Data states
  const [chapterData, setChapterData] = useState<Chapter[]>([]);
  const [thumnData, setThumnData] = useState<Thumn[]>([]);
  const [hizbData, setHizbData] = useState<Hizb[]>([]);
  const [ayaData, setAyaData] = useState<Page[]>([]);
  const [quranData, setQuranData] = useState<QuranText[]>([]);

  // Loading states
  const [isChapterLoading, setIsChapterLoading] = useState(false);
  const [isNavigationLoading, setIsNavigationLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isQuranLoading, setIsQuranLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Preload data based on options
  useEffect(() => {
    if (isEssentialLoading || essentialError) return;

    const preloadData = async () => {
      try {
        const promises: Promise<any>[] = [];

        // Preload chapters if requested (for chapter list page)
        if (options?.preloadChapters) {
          setIsChapterLoading(true);
          promises.push(
            loadChapterData().then((data) => {
              setChapterData(data);
              setIsChapterLoading(false);
            }),
          );
        }

        // Preload navigation data if requested (for navigation components)
        if (options?.preloadNavigation) {
          setIsNavigationLoading(true);
          promises.push(
            loadNavigationData().then(({ thumnData, hizbData }) => {
              setThumnData(thumnData);
              setHizbData(hizbData);
              setIsNavigationLoading(false);
            }),
          );
        }

        // Preload page data if requested (for page overlay)
        if (options?.preloadPageData) {
          setIsPageLoading(true);
          promises.push(
            loadPageData().then((data) => {
              setAyaData(data);
              setIsPageLoading(false);
            }),
          );
        }

        // Preload Quran text if requested (for search)
        if (options?.preloadQuranText) {
          setIsQuranLoading(true);
          promises.push(
            loadQuranText().then((data) => {
              setQuranData(data);
              setIsQuranLoading(false);
            }),
          );
        }

        if (promises.length > 0) {
          await Promise.all(promises);
        }
      } catch (err) {
        setError(
          `Failed to preload data: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    };

    preloadData();
  }, [
    isEssentialLoading,
    essentialError,
    loadChapterData,
    loadNavigationData,
    loadPageData,
    loadQuranText,
    options?.preloadChapters,
    options?.preloadNavigation,
    options?.preloadPageData,
    options?.preloadQuranText,
  ]);

  // Public methods to load data on demand
  const loadChaptersOnDemand = async () => {
    if (chapterData.length > 0) return chapterData;

    setIsChapterLoading(true);
    try {
      const data = await loadChapterData();
      setChapterData(data);
      return data;
    } catch (err) {
      setError(
        `Failed to load chapters: ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    } finally {
      setIsChapterLoading(false);
    }
  };

  const loadNavigationOnDemand = async () => {
    if (thumnData.length > 0 && hizbData.length > 0) {
      return { thumnData, hizbData };
    }

    setIsNavigationLoading(true);
    try {
      const data = await loadNavigationData();
      setThumnData(data.thumnData);
      setHizbData(data.hizbData);
      return data;
    } catch (err) {
      setError(
        `Failed to load navigation data: ${err instanceof Error ? err.message : String(err)}`,
      );
      return { thumnData: [], hizbData: [] };
    } finally {
      setIsNavigationLoading(false);
    }
  };

  const loadQuranTextOnDemand = async () => {
    if (quranData.length > 0) return quranData;

    setIsQuranLoading(true);
    try {
      const data = await loadQuranText();
      setQuranData(data);
      return data;
    } catch (err) {
      setError(
        `Failed to load Quran text: ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    } finally {
      setIsQuranLoading(false);
    }
  };

  const loadPageDataOnDemand = async () => {
    if (ayaData.length > 0) return ayaData;

    setIsPageLoading(true);
    try {
      const data = await loadPageData();
      setAyaData(data);
      return data;
    } catch (err) {
      setError(
        `Failed to load page data: ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    } finally {
      setIsPageLoading(false);
    }
  };

  const isLoading =
    isEssentialLoading ||
    isChapterLoading ||
    isNavigationLoading ||
    isPageLoading ||
    isQuranLoading;

  const finalError = essentialError || error;

  return {
    // Data
    thumnData,
    hizbData,
    surahData,
    ayaData,
    specsData,
    chapterData,
    quranData,

    // States
    isLoading,
    error: finalError,

    // On-demand loaders (attached as hidden properties for advanced usage)
    ...(typeof window !== 'undefined' &&
      ({
        _loadChapters: loadChaptersOnDemand,
        _loadNavigation: loadNavigationOnDemand,
        _loadQuranText: loadQuranTextOnDemand,
        _loadPageData: loadPageDataOnDemand,
      } as any)),
  };
}
