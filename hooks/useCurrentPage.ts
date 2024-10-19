import { useEffect, useState } from 'react';

import { useLocalSearchParams } from 'expo-router';
import { useRecoilState } from 'recoil';

import { currentSavedPage } from '@/recoil/atoms';

export default function useCurrentPage() {
  const { page: pageParam } = useLocalSearchParams();
  const [currentSavedPageValue, setCurrentSavedPageValue] =
    useRecoilState(currentSavedPage);
  const [currentPage, setCurrentPage] = useState<number>(
    currentSavedPageValue ?? 1,
  );

  useEffect(() => {
    let page = currentSavedPageValue ?? 1;

    if (typeof pageParam === 'string' && !isNaN(parseInt(pageParam))) {
      page = parseInt(pageParam);
    } else if (Array.isArray(pageParam) && pageParam.length > 0) {
      const parsedPage = parseInt(pageParam[0]);
      if (!isNaN(parsedPage)) {
        page = parsedPage;
      }
    }
    setCurrentPage(page);

    if (page !== currentSavedPageValue) {
      setCurrentSavedPageValue(page);
    }
  }, [currentSavedPageValue, pageParam, setCurrentSavedPageValue]);

  // Will Save the current page to local storage and to the current state
  const setNewCurrentPage = (page: number) => {
    setCurrentPage(page);
    setCurrentSavedPageValue(page);
  };

  return { currentPage, setCurrentPage: setNewCurrentPage };
}
