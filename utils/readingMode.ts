import { ReadingMode } from '@/types/reading-mode';

// Array mapping indices to ReadingMode values
const readingModeArray: ReadingMode[] = ['horizontal', 'vertical'];

/**
 * Resolves the numeric index corresponding to a given ReadingMode value.
 *
 * @param value - The ReadingMode value (e.g., 'horizontal' or 'vertical').
 * @returns The integer index of the ReadingMode in the configuration array.
 */
export function getReadingModeIndex(value: ReadingMode): number {
  const index = readingModeArray.indexOf(value);
  return index !== -1 ? index : 0;
}

/**
 * Retrieves the ReadingMode value by its numeric index.
 *
 * @param index - The index number of the requested ReadingMode.
 * @throws {Error} If the provided index is out of array bounds.
 * @returns The ReadingMode value for the given index.
 */
export function getReadingModeByIndex(index: number): ReadingMode {
  if (index < 0 || index >= readingModeArray.length) {
    throw new Error(`Invalid index: ${index}`);
  }
  return readingModeArray[index];
}
