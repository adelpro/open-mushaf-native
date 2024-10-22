import { useCallback, useEffect, useRef } from 'react';

import { useLocalSearchParams } from 'expo-router';
import { useRecoilState } from 'recoil';

import { currentSavedPage } from '@/recoil/atoms';

export default function useCurrentPage() {
  const { page: pageParam } = useLocalSearchParams();
  const [currentSavedPageValue, setCurrentSavedPageValue] =
    useRecoilState(currentSavedPage);
  const isInitialMount = useRef(true);

  const setNewCurrentPage = useCallback(
    (page: number) => {
      console.log(
        'setCurrentPage: page:',
        page,
        'pageParam:',
        pageParam,
        'currentSavedPageValue:',
        currentSavedPageValue,
      ); // Only update if the new page is different and valid

      if (page !== currentSavedPageValue && page > 0) {
        setCurrentSavedPageValue(page);
      }
    },
    [currentSavedPageValue, pageParam, setCurrentSavedPageValue],
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    } // Parse pageParam

    const parsedPage = Array.isArray(pageParam)
      ? parseInt(pageParam[0])
      : parseInt(pageParam);

    if (!isNaN(parsedPage)) {
      setNewCurrentPage(parsedPage);
    }
  }, [pageParam, setNewCurrentPage]);

  return {
    currentPage: currentSavedPageValue || 1,
    setCurrentPage: setNewCurrentPage,
  };
}
