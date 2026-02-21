import { Riwaya } from '@/types/riwaya';

/** Ordered list of supported Riwaya (recitation tradition) values. */
const riwayaArray: Riwaya[] = ['hafs', 'warsh'];

/**
 * Returns the numeric index of a given Riwaya value within the supported list.
 *
 * Falls back to index `0` (Hafs) when the value is not found or is nullish.
 *
 * @param value - The Riwaya identifier to look up.
 * @returns The zero-based index of the Riwaya, or `0` as the default fallback.
 */
export function RiwayaByIndice(value: Riwaya): number {
  const index = riwayaArray.indexOf(value ?? 'hafs');
  return index !== -1 ? index : 0;
}

/**
 * Returns the Riwaya value at the given numeric index.
 *
 * @param index - Zero-based index into the supported Riwaya list.
 * @returns The corresponding Riwaya identifier.
 * @throws {Error} If `index` is out of the valid range `[0, riwayaArray.length)`.
 */
export function RiwayaByValue(index: number): Riwaya {
  if (index < 0 || index >= riwayaArray.length) {
    throw new Error(`Invalid index: ${index}`);
  }
  return riwayaArray[index];
}
