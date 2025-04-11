import { Hizb } from '@/types';

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
