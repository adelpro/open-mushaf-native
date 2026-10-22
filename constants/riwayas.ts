/**
 * Single source of truth for the two riwayat the app supports.
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
 */
export const RIWAYAS = [
  {
    id: 'hafs',
    arabic: 'حفص',
    assetDirectory: 'mushaf-elmadina-hafs-assim',
    pages: 604,
  },
  {
    id: 'warsh',
    arabic: 'ورش',
    assetDirectory: 'mushaf-elmadina-warsh-azrak',
    pages: 604,
  },
] as const;

export type Riwaya = (typeof RIWAYAS)[number]['id'];
export type RiwayaArabic = (typeof RIWAYAS)[number]['arabic'];

export const RIWAYA_ARABIC_LABEL: Record<Riwaya, string> = Object.fromEntries(
  RIWAYAS.map((r) => [r.id, r.arabic]),
) as Record<Riwaya, string>;

export const RIWAYA_TO_ASSET_DIRECTORY: Record<Riwaya, string> =
  Object.fromEntries(RIWAYAS.map((r) => [r.id, r.assetDirectory])) as Record<
    Riwaya,
    string
  >;

/** Page count per supported riwaya. */
export const RIWAYA_PAGE_COUNTS: Record<Riwaya, number> = Object.fromEntries(
  RIWAYAS.map((r) => [r.id, r.pages]),
) as Record<Riwaya, number>;

/** Canonical display order (matches `RIWAYAS` insertion order). */
export const RIWAYAT_LIST: readonly Riwaya[] = RIWAYAS.map(
  (r) => r.id,
) as readonly Riwaya[];
