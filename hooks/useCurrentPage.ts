import { useEffect, useRef } from 'react';

import { useLocalSearchParams } from 'expo-router';
import { useAtom } from 'jotai';

import { defaultNumberOfPages } from '@/constants';
import { currentSavedPage } from '@/jotai/atoms';

export default function useCurrentPage() {
  const { page: pageParam } = useLocalSearchParams();
  const [currentSavedPageValue, setCurrentSavedPageValue] =
    useAtom(currentSavedPage);
  const isInitialMount = useRef(true);

  const setNewCurrentPage = (page: number) => {
    if (page < 1) {
      setCurrentSavedPageValue(1);
    } else if (page > defaultNumberOfPages) {
      setCurrentSavedPageValue(defaultNumberOfPages);
    } else {
      setCurrentSavedPageValue(page);
    }
  };

  useEffect(() => {
    // Skip the first render to prevent initial loop
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const parsedPage = Array.isArray(pageParam)
      ? parseInt(pageParam[0])
      : parseInt(pageParam);

    // Only update if the parsed page is valid and different from current value
    if (!isNaN(parsedPage) && parsedPage !== currentSavedPageValue) {
      setCurrentSavedPageValue(parsedPage);
    }
  }, [pageParam, setCurrentSavedPageValue, currentSavedPageValue]);

  return {
    currentPage: currentSavedPageValue || 1,
    setCurrentPage: setNewCurrentPage,
  };
}
