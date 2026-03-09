import { Surah, Thumn } from '@/types';

/**
 * Retrieves the name of a Surah based on a specific page number.
 *
 * @param surahs - The array of Surah metadata.
 * @param page - The page number to search for.
 * @returns The name of the Surah found, or an empty string if not found.
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
 * Retrieves the number of a Surah based on a specific page number.
 *
 * @param surahs - The array of Surah metadata.
 * @param page - The page number to search for.
 * @returns The number of the Surah found, or 1 if not found.
 */
export function getSurahNumberByPage(surahs: Surah[], page: number): number {
  const surah = surahs.find(
    (s, index) =>
      page >= s.startingPage &&
      (index === surahs.length - 1 || page < surahs[index + 1].startingPage),
  );
  return surah ? surah.number : 1;
}

/**
 * Calculates the position within a Juz (the thumn index and juz number) based on a page number.
 *
 * @param thumns - The array of Thumn metadata.
 * @param page - The page number to evaluate.
 * @returns An object containing the 1-indexed `thumnInJuz` and `juzNumber`.
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
 * Generates localized SEO metadata for a specific Quran page.
 *
 * @param surahs - The array of Surah metadata.
 * @param thumns - The array of Thumn metadata.
 * @param page - The page number being viewed.
 * @returns An object containing `title`, `description`, and `keywords` for SEO purposes.
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
