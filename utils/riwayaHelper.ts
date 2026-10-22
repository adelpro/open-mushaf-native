import { Riwaya } from '@/types/riwaya';

const RIWAYA_OPTIONS: Riwaya[] = ['hafs', 'warsh'];

export function getRiwayaIndex(riwaya: Riwaya): number {
  const index = RIWAYA_OPTIONS.indexOf(riwaya);
  return index >= 0 ? index : 0;
}

export function getRiwayaByIndex(index: number): Riwaya {
  return RIWAYA_OPTIONS[index] ?? RIWAYA_OPTIONS[0];
}
