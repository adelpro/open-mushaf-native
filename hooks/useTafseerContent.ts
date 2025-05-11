import { TafseerAya } from '@/types';

type UseFormattedTafseerParams = {
  tafseerData: TafseerAya[] | null;
  surah: number;
  aya: number;
};

/**
 * Custom hook to find and format Tafseer text for a specific aya and surah.
 * It replicates the logic for determining the display string for tafseer content.
 *
 * @param tafseerData - The array of TafseerAya objects, or null if data is not yet loaded.
 * @param surah - The surah number.
 * @param aya - The aya number.
 * @returns The HTML string for the Tafseer text, or a default message if not found or data is null.
 */
export function useTafseerContent({
  tafseerData,
  surah,
  aya,
}: UseFormattedTafseerParams): string {
  const ayaTafseer = tafseerData?.find(
    (t) => t.sura === surah && t.aya === aya,
  );

  let tafseerText = '';
  if (!ayaTafseer?.text || ayaTafseer?.text === '<p></p>') {
    tafseerText = '<p>لا يوجد تفسير.</p>';
  } else {
    // If !ayaTafseer?.text is false, ayaTafseer and ayaTafseer.text are guaranteed to be defined.
    tafseerText = `<div>${ayaTafseer.text}</div>`;
  }
  return tafseerText;
}

/**
 * Custom hook to check if Tafseer text is available for a specific aya and surah.
 *
 * @param tafseerData - The array of TafseerAya objects, or null if data is not yet loaded.
 * @param surah - The surah number.
 * @param aya - The aya number.
 * @returns `true` if no Tafseer text is found or if the text is empty, `false` otherwise.
 */
export function hasNoTafseerContent({
  tafseerData,
  surah,
  aya,
}: UseFormattedTafseerParams): boolean {
  const ayaTafseer = tafseerData?.find(
    (t) => t.sura === surah && t.aya === aya,
  );

  if (
    !ayaTafseer?.text ||
    ayaTafseer.text.trim() === '' ||
    ayaTafseer.text === '<p></p>'
  ) {
    return true; // No tafseer content
  }
  return false; // Tafseer content exists
}
