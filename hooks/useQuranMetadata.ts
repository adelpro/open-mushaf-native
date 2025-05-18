import { useEffect, useState } from 'react';

import { useAtomValue } from 'jotai/react';

import { mushafRiwaya } from '@/jotai/atoms';
import { Chapter, Hizb, Page, QuranText, Specs, Surah, Thumn } from '@/types';

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

export default function useQuranMetadata(): QuranMetadata {
  const mushafRiwayaValue = useAtomValue(mushafRiwaya);

  const [thumnData, setThumnData] = useState<Thumn[]>([]);
  const [hizbData, setHizbData] = useState<Hizb[]>([]);
  const [surahData, setSurahData] = useState<Surah[]>([]);
  const [ayaData, setAyaData] = useState<Page[]>([]);
  const [specsData, setSpecsData] = useState<Specs>({} as Specs);
  const [chapterData, setChapterData] = useState<Chapter[]>([]);
  const [quranData, setQuranData] = useState<QuranText[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use conditional imports instead of template literals
        if (mushafRiwayaValue === 'hafs') {
          // Load Hafs metadata
          const [
            thumnModule,
            hizbModule,
            surahModule,
            ayaModule,
            specsModule,
            chapterModule,
          ] = await Promise.all([
            import(
              '@/assets/quran-metadata/mushaf-elmadina-hafs-assim/thumn.json'
            ),
            import(
              '@/assets/quran-metadata/mushaf-elmadina-hafs-assim/hizb.json'
            ),
            import(
              '@/assets/quran-metadata/mushaf-elmadina-hafs-assim/surah.json'
            ),
            import(
              '@/assets/quran-metadata/mushaf-elmadina-hafs-assim/aya.json'
            ),
            import(
              '@/assets/quran-metadata/mushaf-elmadina-hafs-assim/specs.json'
            ),
            import(
              '@/assets/quran-metadata/mushaf-elmadina-hafs-assim/chapter.json'
            ),
          ]);

          setThumnData(thumnModule.default);
          setHizbData(hizbModule.default);
          setSurahData(surahModule.default);
          setAyaData(ayaModule.default.coordinates as Page[]);
          setSpecsData(specsModule.default);
          setChapterData(chapterModule.default);
        } else {
          // Load Warsh metadata (default)
          const [
            thumnModule,
            hizbModule,
            surahModule,
            ayaModule,
            specsModule,
            chapterModule,
          ] = await Promise.all([
            import(
              '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/thumn.json'
            ),
            import(
              '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/hizb.json'
            ),
            import(
              '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/surah.json'
            ),
            import(
              '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/aya.json'
            ),
            import(
              '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/specs.json'
            ),
            import(
              '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/chapter.json'
            ),
          ]);

          setThumnData(thumnModule.default);
          setHizbData(hizbModule.default);
          setSurahData(surahModule.default);
          setAyaData(ayaModule.default.coordinates as Page[]);
          setSpecsData(specsModule.default);
          setChapterData(chapterModule.default);
        }

        const [qurandata] = await Promise.all([
          import('@/assets/quran-metadata/shared/quran.json'),
        ]);
        setQuranData(qurandata.default as QuranText[]);
      } catch (err) {
        setError(
          `Failed to load Quran metadata: ${err instanceof Error ? err.message : String(err)}`,
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadMetadata();
  }, [mushafRiwayaValue]);

  return {
    thumnData,
    hizbData,
    surahData,
    ayaData,
    specsData,
    chapterData,
    quranData,
    isLoading,
    error,
  };
}
