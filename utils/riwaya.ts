import { Riwaya } from '@/types/riwaya';

// Array mapping indices to Riwaya values (no undefined)
const riwayaArray: Riwaya[] = ['hafs', 'warsh'];

/**
 * Resolves the numeric index corresponding to a given Riwaya value.
 *
 * @param value - The Riwaya string value (e.g., 'hafs' or 'warsh').
 * @returns The integer index position of the Riwaya in the configuration array.
 */
export function RiwayaByIndice(value: Riwaya): number {
  const index = riwayaArray.indexOf(value ?? 'hafs');
  return index !== -1 ? index : 0;
}

/**
 * Retrieves the Riwaya string by its numeric index.
 *
 * @param index - The index number of the requested Riwaya.
 * @throws {Error} If the provided index is out of array bounds.
 * @returns The string value for the Riwaya.
 */
export function RiwayaByValue(index: number): Riwaya {
  if (index < 0 || index >= riwayaArray.length) {
    throw new Error(`Invalid index: ${index}`);
  }
  return riwayaArray[index];
}
