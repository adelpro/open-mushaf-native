/**
 * Current Mushaf page, Surah, and Juz for the TopMenu overlay.
 *
 * Used by `components/TopMenu/TopMenuBar.tsx`.
 */
import { useLocalSearchParams } from 'expo-router';
import { useAtomValue } from 'jotai/react';

import { useQuranMetadata } from '@/hooks';
import { currentSavedPage } from '@/jotai/atoms';
import {
  formatSurahDisplayName,
  getJuzPositionByPage,
  getSurahNameByPage,
  getSurahNumberByPage,
} from '@/utils/quranMetadataUtils';

import { getJuzOrdinalName } from './juzOrdinals';

export interface MushafContext {
  isTemporary: boolean;
  currentPage: number;
  surahDisplayName: string;
  currentSurahNumber: number;
  juzNumber: number;
  juzOrdinalName: string;
}

export function useMushafContext(): MushafContext {
  const { surahData, thumnData } = useQuranMetadata();
  const currentSavedPageValue = useAtomValue(currentSavedPage);
  const { page, temporary = 'false' } = useLocalSearchParams<{
    page?: string;
    temporary?: string;
  }>();
  const currentPage = page ? parseInt(page) : currentSavedPageValue;
  const { juzNumber } = getJuzPositionByPage(thumnData, currentPage);

  return {
    isTemporary: temporary === 'true',
    currentPage,
    surahDisplayName: formatSurahDisplayName(
      getSurahNameByPage(surahData, currentPage),
    ),
    currentSurahNumber: getSurahNumberByPage(surahData, currentPage),
    juzNumber,
    juzOrdinalName: getJuzOrdinalName(juzNumber),
  };
}
