import { Hizb, Thumn } from '@/types';

/**
 * Counts the number of hizb boundaries crossed when navigating between two
 * mushaf pages.
 *
 * A hizb boundary is crossed when a hizb's `startingPage` lies strictly
 * between `previousPage` and `currentPage` (exclusive lower, inclusive upper).
 *
 * @param previousPage - The page the reader was on before navigation.
 * @param currentPage  - The page the reader navigated to.
 * @param hizbs        - Ordered array of hizb metadata.
 * @returns The number of hizb boundaries crossed (always ≥ 0).
 */
export const calculateHizbsBetweenPages = (
  previousPage: number,
  currentPage: number,
  hizbs: Hizb[],
): number => {
  const min = Math.min(previousPage, currentPage);
  const max = Math.max(previousPage, currentPage);

  return hizbs.filter((h) => h.startingPage > min && h.startingPage <= max)
    .length;
};

/**
 * Counts the number of thumn (eighth-of-hizb) units between two mushaf pages.
 *
 * Finds the thumn sections that contain `startPage` and `endPage`
 * respectively, then returns the difference in their indices within the
 * `thumnData` array.  Returns `0` when `startPage ≥ endPage` or when
 * `thumnData` is empty.
 *
 * @param startPage - The starting mushaf page (inclusive).
 * @param endPage   - The ending mushaf page (inclusive).
 * @param thumnData - Ordered array of thumn metadata.
 * @returns The number of thumns between the two pages (always ≥ 0).
 */
export function calculateThumnsBetweenPages(
  startPage: number,
  endPage: number,
  thumnData: Thumn[],
): number {
  if (!thumnData || thumnData.length === 0) return 0;

  if (startPage >= endPage) return 0;

  let startThumnIndex = -1;
  let endThumnIndex = -1;

  // Find the last thumn that starts on or before the start page
  for (let i = 0; i < thumnData.length; i++) {
    if (thumnData[i].startingPage > startPage) {
      startThumnIndex = i - 1;
      break;
    }
  }
  if (startThumnIndex === -1) startThumnIndex = 0;

  // Find the thumn that contains the end page
  for (let i = 0; i < thumnData.length; i++) {
    if (thumnData[i].startingPage > endPage) {
      endThumnIndex = i - 1;
      break;
    }
  }
  if (endThumnIndex === -1) endThumnIndex = thumnData.length - 1;

  return Math.max(0, endThumnIndex - startThumnIndex);
}
