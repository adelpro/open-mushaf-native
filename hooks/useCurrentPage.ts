import { useEffect } from 'react';

import { useLocalSearchParams } from 'expo-router';
import { useRecoilState } from 'recoil';

import { defaultNumberOfPages } from '@/constants';
import { currentSavedPage } from '@/recoil/atoms';

export default function useCurrentPage() {
  const { page: pageParam, temporary } = useLocalSearchParams();
  const [currentSavedPageValue, setCurrentSavedPageValue] =
    useRecoilState(currentSavedPage);

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
    const parsedPage = Array.isArray(pageParam)
      ? parseInt(pageParam[0])
      : parseInt(pageParam);

    if (!isNaN(parsedPage) && temporary !== 'true') {
      setCurrentSavedPageValue(parsedPage);
    }
  }, [pageParam, setCurrentSavedPageValue, temporary]);

  // Parse the current page from URL params or use saved page
  const parsedPage = (() => {
    if (pageParam) {
      const parsed = Array.isArray(pageParam)
        ? parseInt(pageParam[0])
        : parseInt(pageParam);
      return !isNaN(parsed) ? parsed : currentSavedPageValue || 1;
    }
    return currentSavedPageValue || 1;
  })();

  // Check if we're viewing a temporary page different from saved position
  const isTemporaryNavigation =
    temporary === 'true' && parsedPage !== currentSavedPageValue;

  return {
    currentPage: currentSavedPageValue || 1,
    setCurrentPage: setNewCurrentPage,
    isTemporaryNavigation,
  };
}
