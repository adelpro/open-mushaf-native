import { Surah, Thumn } from '@/types';

/**
 * Returns the Arabic name of the surah that contains the given page.
 *
 * Scans the ordered `surahs` array and returns the name of the last surah
 * whose `startingPage` is less than or equal to `page`. Returns an empty
 * string when no matching surah is found.
 *
 * @param surahs - Ordered array of surah metadata.
 * @param page   - Mushaf page number (1-based).
 * @returns The Arabic surah name, or `''` if not found.
 */
export function getSurahNameByPage(surahs: Surah[], page: number): string {
  const surah = surahs.find(
    (s, index) =>
      page >= s.startingPage &&
      (index === surahs.length - 1 || page < surahs[index + 1].startingPage),
  );
  return surah ? surah.name : '';
}

/**
 * Returns the surah number (as a string) for the surah that contains the
 * given page.
 *
 * Falls back to `1` when no matching surah is found.
 *
 * @param surahs - Ordered array of surah metadata.
 * @param page   - Mushaf page number (1-based).
 * @returns The surah number string, or `1` as a default fallback.
 */
export function getSurahNumberByPage(surahs: Surah[], page: number): string {
  const surah = surahs.find(
    (s, index) =>
      page >= s.startingPage &&
      (index === surahs.length - 1 || page < surahs[index + 1].startingPage),
  );
  return surah ? surah.number : 1;
}

/**
 * Returns the Juz number and the thumn position within that Juz for a given
 * mushaf page.
 *
 * Each Juz comprises 2 hizbs, and each hizb is divided into 8 thumns,
 * giving 16 thumns per Juz.
 *
 * @param thumns - Ordered array of thumn metadata.
 * @param page   - Mushaf page number (1-based).
 * @returns An object with `juzNumber` (1-based) and `thumnInJuz` (1–16).
 *          Defaults to `{ thumnInJuz: 1, juzNumber: 1 }` when not found.
 */
export function getJuzPositionByPage(thumns: Thumn[], page: number) {
  const thumn = thumns.find(
    (t, index) =>
      page >= t.startingPage &&
      (index === thumns.length - 1 || page < thumns[index + 1].startingPage),
  );

  if (!thumn) return { thumnInJuz: 1, juzNumber: 1 };

  // Calculate position within Juz (each Juz has 2 hizbs = 16 thumns)
  const juzNumber = Math.ceil(thumn.hizb_number / 2);
  const thumnInJuz = ((thumn.hizb_number - 1) * 8 + thumn.thumn) % 16 || 16;

  return { thumnInJuz, juzNumber };
}

/**
 * Generates SEO metadata (title, description, keywords) for a mushaf page,
 * incorporating the surah name and Juz number where available.
 *
 * @param surahs - Ordered array of surah metadata.
 * @param thumns - Ordered array of thumn metadata.
 * @param page   - Mushaf page number (1-based).
 * @returns An object with `title`, `description`, and `keywords` strings in Arabic.
 */
export function getSEOMetadataByPage(
  surahs: Surah[],
  thumns: Thumn[],
  page: number,
) {
  const surah = surahs.find(
    (s, index) =>
      page >= s.startingPage &&
      (index === surahs.length - 1 || page < surahs[index + 1].startingPage),
  );

  const { juzNumber } = getJuzPositionByPage(thumns, page);

  return {
    title: surah
      ? `سورة ${surah.name} - صفحة ${page} - المصحف المفتوح`
      : `صفحة ${page} - المصحف المفتوح`,
    description: surah
      ? `قراءة سورة ${surah.name} من صفحة ${page} في الجزء ${juzNumber} من القرآن الكريم`
      : `قراءة صفحة ${page} من القرآن الكريم - المصحف المفتوح`,
    keywords: surah
      ? `سورة ${surah.name}, صفحة ${page}, جزء ${juzNumber}, قرآن, مصحف`
      : `صفحة ${page}, جزء ${juzNumber}, قرآن, مصحف`,
  };
}
