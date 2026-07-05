import { RIWAYA_ARABIC_LABEL } from '@/constants';
import { Riwaya } from '@/types';

/** List of all supported riwayat (order matters for indexing). */
export const RIWAYAT_LIST: Riwaya[] = [
  'hafs',
  'warsh',
  'qalon-kfqc',
  'qalon-libya-awqaf',
  'douri-kfqc',
  'shubah-kfqc',
];

/** Options for pickers – each with a human‑readable label. */
export const RIWAYAT_OPTIONS = RIWAYAT_LIST.map((value) => ({
  value,
  label: RIWAYA_ARABIC_LABEL[value],
}));

/** Get the numeric index of a riwaya (used by segmented controls). */
export function getRiwayaIndex(riwaya: Riwaya): number {
  return RIWAYAT_LIST.indexOf(riwaya);
}

/** Get the riwaya from a numeric index (safe). */
export function getRiwayaByIndex(index: number): Riwaya {
  if (index < 0 || index >= RIWAYAT_LIST.length) {
    throw new Error(`Invalid riwaya index: ${index}`);
  }
  return RIWAYAT_LIST[index];
}
