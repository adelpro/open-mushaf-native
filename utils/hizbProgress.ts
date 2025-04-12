import { Hizb, Thumn } from '@/types';

/**
 *
 * @param previousPage the page number of the previous page
 * @param currentPage the page number of the current page
 * @returns the number of hizbs between the two pages
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

// Add this function to your existing hizbProgress.ts file

export function calculateThumnsBetweenPages(
  startPage: number,
  endPage: number,
  thumnData: Thumn[],
): number {
  if (!startPage || !endPage || startPage >= endPage) return 0;

  // Find the thumn positions for start and end pages
  let startThumnIndex = -1;
  let endThumnIndex = -1;

  // Find the last thumn that starts on or before the start page
  for (let i = thumnData.length - 1; i >= 0; i--) {
    if (thumnData[i].starting_page <= startPage) {
      startThumnIndex = i;
      break;
    }
  }

  // Find the last thumn that starts on or before the end page
  for (let i = thumnData.length - 1; i >= 0; i--) {
    if (thumnData[i].starting_page <= endPage) {
      endThumnIndex = i;
      break;
    }
  }

  if (startThumnIndex === -1 || endThumnIndex === -1) return 0;

  // Calculate the number of thumns between the two pages
  return endThumnIndex - startThumnIndex;
}
