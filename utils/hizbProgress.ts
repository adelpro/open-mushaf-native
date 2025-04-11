import hizbJson from '@/assets/quran-metadata/mushaf-elmadina-hafs-assim/hizb.json';
import { Hizb } from '@/types';

/**
 * حساب عدد الأحزاب المقروءة بناءً على الصفحة الحالية
 * @param currentPage الصفحة الحالية التي وصل إليها المستخدم
 * @returns عدد الأحزاب المقروءة
 */
export const calculateHizbProgress = (currentPage: number): number => {
  const hizbData = hizbJson as Hizb[];

  // تحديد الأحزاب التي تم قراءتها بالكامل
  // (الأحزاب التي تبدأ صفحتها قبل أو تساوي الصفحة الحالية)
  const completedHizbs = hizbData.filter(
    (hizb) => hizb.startingPage <= currentPage,
  );

  return completedHizbs.length;
};

/**
 * Calculate the percentage progress of Hizb reading
 * @param completedHizbs Number of completed Hizbs
 * @param totalHizbs Total target number of Hizbs
 * @returns Progress percentage
 */
export const calculateHizbProgressPercentage = (
  completedHizbs: number,
  totalHizbs: number,
): number => {
  if (totalHizbs <= 0) return 0;
  return Math.min(100, (completedHizbs / totalHizbs) * 100);
};

/**
 * Update Hizb reading progress based on saved page
 * @param savedPage The currently saved page
 * @param setDailyProgress Function to update daily reading progress
 * @param dailyTarget Daily target number of Hizbs
 */
export const updateHizbProgressFromPage = (
  savedPage: number,
  setDailyProgress: (value: number) => void,
  dailyTarget: number,
): void => {
  const completedHizbs = calculateHizbProgress(savedPage);
  setDailyProgress(Math.min(completedHizbs, dailyTarget));
};

/**
 * Calculate the number of hizbs between two page numbers
 * @param startPage The starting page number
 * @param endPage The ending page number
 * @returns The number of hizbs between the two pages
 */
export const calculateHizbFromPages = (
  startPage: number,
  endPage: number,
): number => {
  if (startPage >= endPage) return 0;

  // Get hizb numbers for both pages
  const startHizb = getHizbNumberFromPage(startPage);
  const endHizb = getHizbNumberFromPage(endPage);

  // Calculate difference
  return endHizb - startHizb;
};

/**
 * Get the hizb number for a given page
 * @param page The page number
 * @returns The hizb number (1-60)
 */
const getHizbNumberFromPage = (page: number): number => {
  // This is a simplified mapping - you may need to adjust based on your Quran edition
  // For a standard 604-page Quran, each hizb is approximately 10 pages
  // More accurate mapping would require a lookup table
  return Math.ceil(page / 10);
};
