import { Surah, Thumn } from '@/types';

export function getSurahNameByPage(surahs: Surah[], page: number): string {
  const surah = surahs.find(
    (s, index) =>
      page >= s.startingPage &&
      (index === surahs.length - 1 || page < surahs[index + 1].startingPage),
  );
  return surah ? surah.name : '';
}

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
