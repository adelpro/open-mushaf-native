import { useCurrentPage } from './useCurrentPage';
import { usePageAsset } from './usePageAsset';

/**
 * Hook to load the image asset for the current page based on the selected Riwaya.
 * Returns the downloaded asset along with loading and error states.
 *
 * @returns An object containing the downloaded `asset`, an `isLoading` boolean, and an `error` string (if any).
 */
export function useImagesArray() {
  const { currentPage: page } = useCurrentPage();

  return usePageAsset(page);
}
