import { Riwaya } from '@/types/riwaya';

// Array mapping indices to Riwaya values
const riwayaArray: Riwaya[] = ['hafs', 'warsh', undefined];

// Function to get the index of a Riwaya value
export function RiwayaByIndice(value: Riwaya): number | undefined {
  const index = riwayaArray.indexOf(value);
  return index !== -1 ? index : undefined;
}

// Function to get the Riwaya value by index
export function RiwayaByValue(index: number): Riwaya {
  if (index < 0 || index >= riwayaArray.length) {
    throw new Error(`Invalid index: ${index}`);
  }
  return riwayaArray[index];
}
