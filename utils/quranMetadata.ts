import surahs from '@/assets/quran-metadata/mushaf-elmadina-hafs-assim/surah.json';
import thumnJson from '@/assets/quran-metadata/mushaf-elmadina-hafs-assim/thumn.json';

export function getSurahNameByPage(page: number): string {
  const surah = surahs.find(
    (s, index) =>
      page >= s.startingPage &&
      (index === surahs.length - 1 || page < surahs[index + 1].startingPage),
  );
  return surah ? surah.name : '';
}

export function getJuzPositionByPage(page: number) {
  const thumn = thumnJson.find(
    (t, index) =>
      page >= t.starting_page &&
      (index === thumnJson.length - 1 ||
        page < thumnJson[index + 1].starting_page),
  );

  if (!thumn) return { thumnInJuz: 1, juzNumber: 1 };

  // Calculate position within Juz (each Juz has 2 hizbs = 16 thumns)
  const juzNumber = Math.ceil(thumn.hizb_number / 2);
  const thumnInJuz = ((thumn.hizb_number - 1) * 8 + thumn.thumn) % 16 || 16;

  return { thumnInJuz, juzNumber };
}
