import { useEffect } from 'react';

import { useLocalSearchParams } from 'expo-router';
import { useAtom } from 'jotai';

import { defaultNumberOfPages } from '@/constants';
import { currentSavedPage } from '@/jotai/atoms';

export default function useCurrentPage() {
  const { page: pageParam } = useLocalSearchParams();
  const [currentSavedPageValue, setCurrentSavedPageValue] =
    useAtom(currentSavedPage);

  useEffect(() => {
    const parsedPage = Array.isArray(pageParam)
      ? parseInt(pageParam[0])
      : parseInt(pageParam);

    if (!isNaN(parsedPage) && parsedPage === currentSavedPageValue) {
      return;
    }
    if (parsedPage < 1) {
      setCurrentSavedPageValue(1);
      return;
    }

    if (parsedPage > defaultNumberOfPages) {
      setCurrentSavedPageValue(defaultNumberOfPages);
      return;
    }
    setCurrentSavedPageValue(parsedPage);
  }, [currentSavedPageValue, pageParam, setCurrentSavedPageValue]);

  return {
    currentPage: currentSavedPageValue || 1,
    setCurrentPage: setCurrentSavedPageValue,
  };
}
