/**
 * Single source of truth for every translation the app supports.
 *
 * Adding/removing a translation = edit one place. The type, label,
 * download URL, and the gid-keyed JSON shape are all derived from
 * the `TRANSLATIONS` tuple below.
 *
 * qurani.ai exposes ~100+ translations; we curate a small,
 * high-quality subset for the Downloads UI. Phase 4 starts with
 * English, Urdu, French, Indonesian, and Turkish — the languages
 * with the most active user base in the app's install region. The
 * user can also pick `null` (no translation) on a per-tap basis
 * without downloading anything.
 *
 * Each translation downloads as a single ~2-3 MB JSON from
 * `/quran/<edition>` and persists at
 * `Paths.document/open-mushaf/translation/<id>.json`. Lookup uses
 * the qurani.ai gid as the canonical key.
 *
 * Reference: https://qurani.ai/en/docs/1-general-apis
 */

export const TRANSLATIONS = [
  { id: 'en.sahih', label: 'English (Saheeh International)' },
  { id: 'en.pickthall', label: 'English (Pickthall)' },
  { id: 'en.yusufali', label: 'English (Yusuf Ali)' },
  { id: 'fr.hamidullah', label: 'Français (Hamidullah)' },
  { id: 'id.indonesian', label: 'Bahasa Indonesia' },
  { id: 'tr.diyanet', label: 'Türkçe (Diyanet)' },
  { id: 'ur.jalandhry', label: 'اردو (Jalandhry)' },
] as const;

export type TranslationKey = (typeof TRANSLATIONS)[number]['id'];
export type TranslationArabic = (typeof TRANSLATIONS)[number]['label'];

export const TRANSLATION_ARABIC_LABEL: Record<TranslationKey, string> =
  Object.fromEntries(TRANSLATIONS.map((t) => [t.id, t.label])) as Record<
    TranslationKey,
    string
  >;

export const TRANSLATIONS_LIST: readonly TranslationKey[] = TRANSLATIONS.map(
  (t) => t.id,
) as readonly TranslationKey[];

/** Canonical display order (matches `TRANSLATIONS` insertion order). */
export const TRANSLATION_SIZE_ESTIMATE_BYTES = 2_500_000; // ~2.5 MB
