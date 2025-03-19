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

  return {
    currentPage: currentSavedPageValue || 1,
    setCurrentPage: setNewCurrentPage,
  };
}
