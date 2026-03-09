import { useEffect } from 'react';

import { useLocalSearchParams } from 'expo-router';
import { useAtom } from 'jotai/react';

import { currentSavedPage } from '@/jotai/atoms';

import { useQuranMetadata } from './useQuranMetadata';
import { useUpdateAndroidWidget } from './useUpdateAndroidWidget';

/**
 * Hook to manage the current page of the Mushaf.
 * Handles reading from URL parameters, falling back to the saved state,
 * updating the Jotai store, and syncing the Android widget.
 *
 * @returns An object with the current page, saved page, setter function, and a boolean flag for temporary navigation.
 */
export function useCurrentPage() {
  const { page: pageParam, temporary } = useLocalSearchParams();
  const [currentSavedPageValue, setCurrentSavedPageValue] =
    useAtom(currentSavedPage);
  const { specsData } = useQuranMetadata();

  const { updateAndroidWidget } = useUpdateAndroidWidget();

  const defaultNumberOfPages = specsData?.defaultNumberOfPages;
  const setNewCurrentPage = (page: number) => {
    if (!page) return;
    if (temporary === 'true') return;

    if (page < 1) {
      setCurrentSavedPageValue(1);
    } else if (page > defaultNumberOfPages) {
      setCurrentSavedPageValue(defaultNumberOfPages);
    } else {
      setCurrentSavedPageValue(page);
    }

    updateAndroidWidget();
  };

  useEffect(() => {
    const parsedPage = Array.isArray(pageParam)
      ? parseInt(pageParam[0])
      : parseInt(pageParam);

    if (!isNaN(parsedPage) && temporary !== 'true') {
      setCurrentSavedPageValue(parsedPage);
      updateAndroidWidget();
    }
  }, [pageParam, setCurrentSavedPageValue, temporary, updateAndroidWidget]);

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

  const currentPage = isTemporaryNavigation
    ? parsedPage
    : currentSavedPageValue || 1;

  return {
    currentPage,
    currentSavedPage: currentSavedPageValue,
    setCurrentPage: setNewCurrentPage,
    isTemporaryNavigation,
  };
}
