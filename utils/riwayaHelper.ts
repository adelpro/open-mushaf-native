import {
  type Riwaya,
  RIWAYA_ARABIC_LABEL,
  RIWAYAT_LIST,
} from '@/constants/riwayas';

// Re-export so existing consumers that import `RIWAYAT_LIST` /
// `RIWAYA_ARABIC_LABEL` from `@/utils/riwayaHelper` keep working
// without changes.
export { RIWAYA_ARABIC_LABEL, RIWAYAT_LIST };

/** Options for pickers – each with a human‑readable label. */
export const RIWAYAT_OPTIONS: { value: Riwaya; label: string }[] =
  RIWAYAT_LIST.map((value) => ({
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
