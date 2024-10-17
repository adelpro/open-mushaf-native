import tafaseer from '@/assets/tafaseer';
import { TafseerAya, TafseerTabs } from '@/types';

export async function loadTafseerChunk(
  tafseerType: TafseerTabs,
  surah: number,
  aya: number,
): Promise<TafseerAya | null> {
  try {
    // Access the specific tafseer based on the selected tab
    const selectedTafseer = tafaseer['baghawy'] as TafseerAya[];

    const ayaTafseer = selectedTafseer?.find(
      (t) => t.aya === aya && t.sura === surah,
    );

    return ayaTafseer || null;
  } catch (error) {
    console.error('Error loading tafseer chunk:', error);
    return null;
  }
}
