/**
 * Single source of truth for every riwaya the app supports.
 *
 * Adding/removing a riwaya = edit one place. The type, Arabic label,
 * CDN upstream path, and page-count maps are all derived from the
 * `RIWAYAS` tuple below; nothing else in the codebase should hardcode
 * riwaya data.
 *
 * - `RIWAYAS` is `as const` so the literal-union types `Riwaya` and
 *   `RiwayaArabic` stay narrow (each `id`/`arabic` is a literal string,
 *   not `string`).
 * - The derived `Record<Riwaya, …>` objects are cast from
 *   `Object.fromEntries(...)` because TS can't infer the narrow key
 *   type through `Object.fromEntries`; the cast is sound because the
 *   tuple covers every member of the union exactly once.
 *
 * **Phase 1 update:** `qalon-libya-awqaf` was removed. It was a
 * Libyan Awqaf publisher mushaf (612 pages) with no qurani.ai
 * equivalent — keeping it would have meant mixing our 604-page
 * Madinah layout with a publisher-specific page count. The remaining
 * 5 riwayas all map 1:1 to qurani.ai narrations (see
 * `constants/quraniEditions.ts`).
 */
export const RIWAYAS = [
  {
    id: 'hafs',
    arabic: 'حفص',
    upstream: 'hafs/kfqc',
    pages: 604,
  },
  {
    id: 'warsh',
    arabic: 'ورش',
    upstream: 'warsh/kfqc',
    pages: 604,
  },
  {
    id: 'qalon-kfqc',
    arabic: 'قالون',
    upstream: 'qalon/kfqc',
    pages: 604,
  },
  {
    id: 'douri-kfqc',
    arabic: 'الدوري',
    upstream: 'douri/kfqc',
    pages: 604,
  },
  {
    id: 'shubah-kfqc',
    arabic: 'شعبة',
    upstream: 'shubah/kfqc',
    pages: 604,
  },
] as const;

export type Riwaya = (typeof RIWAYAS)[number]['id'];
export type RiwayaArabic = (typeof RIWAYAS)[number]['arabic'];

export const RIWAYA_ARABIC_LABEL: Record<Riwaya, string> = Object.fromEntries(
  RIWAYAS.map((r) => [r.id, r.arabic]),
) as Record<Riwaya, string>;

export const RIWAYA_TO_UPSTREAM_PATH: Record<Riwaya, string> =
  Object.fromEntries(RIWAYAS.map((r) => [r.id, r.upstream])) as Record<
    Riwaya,
    string
  >;

/** Page count per riwaya. `qalon-libya-awqaf` is the only non-604 edition. */
export const RIWAYA_PAGE_COUNTS: Record<Riwaya, number> = Object.fromEntries(
  RIWAYAS.map((r) => [r.id, r.pages]),
) as Record<Riwaya, number>;

/** Canonical display order (matches `RIWAYAS` insertion order). */
export const RIWAYAT_LIST: readonly Riwaya[] = RIWAYAS.map(
  (r) => r.id,
) as readonly Riwaya[];
