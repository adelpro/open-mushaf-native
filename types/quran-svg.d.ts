/**
 * quranpedia/quran-svg per-page JSON shape.
 *
 * Example entry (one of 7 on page 1 — Al-Fatiha):
 *   { ayahNumber: 1, surahNumber: 1, x: 66.48, y: 34.46,
 *     polygon: "181.08,18.31 57.54,18.31 57.54,48.94 181.08,48.94" }
 *
 * `x` and `y` are the center of the ayah medallion (decorative
 * verse-number circle) in the page's viewBox space.
 *
 * `polygon` is a string of space-separated "x,y" vertices that
 * describe the hit region for this ayah.
 */
export type QuranSvgPageAyah = {
  ayahNumber: number;
  surahNumber: number;
  x: number;
  y: number;
  polygon: string;
};

export type QuranSvgPageJson = QuranSvgPageAyah[];

export type QuranSvgSurah = {
  ayahCount: number;
  headerPosition: number;
  juzNumber: number;
  nameArabic: string;
  nameEnglish: string;
  nameTranslation: string;
  number: number;
  pageNumber: number;
};

export type QuranSvgMarker = {
  page: number;
  ayah: number;
  x: number;
  y: number;
};
