import { Hizb, Thumn } from '@/types';

/**
 * Calculates the number of hizb markers passed between two pages.
 *
 * @param previousPage - The page number of the previous page
 * @param currentPage - The page number of the current page
 * @param hizbs - Array of Hizb metadata to check against
 * @returns The number of hizbs between the two pages
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
 * Calculates the total number of thumns (1/8 of a hizb) read between two specific pages.
 *
 * @param startPage - The page where the user started reading (inclusive).
 * @param endPage - The page the user reached.
 * @param thumnData - The array of thumn metadata records to calculate the difference against.
 *
 * @returns The total thumns difference between the start and end pages. Returns 0 if startPage >= endPage.
 */
export function calculateThumnsBetweenPages(
  startPage: number,
  endPage: number,
  thumnData: Thumn[],
): number {
  // Ensure we have valid data
  if (!thumnData || thumnData.length === 0) return 0;

  // Handle case where pages are the same or in reverse order
  if (startPage >= endPage) return 0;

  // Find the thumn positions for start and end pages
  let startThumnIndex = -1;
  let endThumnIndex = -1;

  // Find the last thumn that starts on or before the start page
  for (let i = 0; i < thumnData.length; i++) {
    if (thumnData[i].startingPage > startPage) {
      startThumnIndex = i - 1;
      break;
    }
  }
  // If we didn't find a thumn before the start page, use the first thumn
  if (startThumnIndex === -1) startThumnIndex = 0;

  // Find the thumn that contains the end page
  for (let i = 0; i < thumnData.length; i++) {
    if (thumnData[i].startingPage > endPage) {
      endThumnIndex = i - 1;
      break;
    }
  }
  // If we didn't find a thumn after the end page, use the last thumn
  if (endThumnIndex === -1) endThumnIndex = thumnData.length - 1;

  // Calculate the number of thumns between the two pages
  const thumnCount = endThumnIndex - startThumnIndex;

  // Ensure we don't return negative values
  return Math.max(0, thumnCount);
}
