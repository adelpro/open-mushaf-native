import ayas from '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/aya.json';
import hizbJson from '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/Hizb.json';
import { Aya, Hizb, Page } from '@/types';

export default function useHizbOverlay(index: number) {
  const coordinates = ayas.coordinates as Page[];
  const page: Aya[] = coordinates[index - 1];
  const hizbArray: Hizb[] = hizbJson as Hizb[];

  const ayaMarker = page.find((aya) => {
    const suraaya = `${aya[0]}:${aya[1]}`;
    const hizb = hizbArray.find((hizb) => {
      return hizb.last_verse_key === suraaya;
    });
    if (hizb) {
      return aya;
    }
    return null;
  });
  return { ayaMarker };
}
