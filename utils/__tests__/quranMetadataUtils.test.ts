import { describe, expect, it } from 'vitest';

import hafsSurahs from '@/assets/quran-metadata/mushaf-elmadina-hafs-assim/surah.json';
import hafsThumns from '@/assets/quran-metadata/mushaf-elmadina-hafs-assim/thumn.json';

import {
  getJuzPositionByPage,
  getSurahNumberByPage,
} from '../quranMetadataUtils';

describe('getJuzPositionByPage', () => {
  it('returns hizbNumber/thumnInJuz/juzNumber for page 1 (hizb 1, juz 1)', () => {
    const result = getJuzPositionByPage(hafsThumns, 1);
    expect(result.hizbNumber).toBe(1);
    expect(result.juzNumber).toBe(1);
    // Thumn 1 is the first thumn of hizb 1 (which is the first hizb of juz 1).
    expect(result.thumnInJuz).toBeGreaterThanOrEqual(1);
    expect(result.thumnInJuz).toBeLessThanOrEqual(16);
  });

  it('returns hizb 60 / juz 30 for the last page (604)', () => {
    const result = getJuzPositionByPage(hafsThumns, 604);
    expect(result.hizbNumber).toBe(60);
    expect(result.juzNumber).toBe(30);
  });

  it('returns hizb 30 (juz 15 boundary) when the page is in the second hizb of juz 15', () => {
    // Juz 15 is hizb 29-30. Page 300 in Hafs falls in hizb 30.
    const result = getJuzPositionByPage(hafsThumns, 300);
    expect(result.hizbNumber).toBe(30);
    expect(result.juzNumber).toBe(15);
  });

  it('returns hizb 40 / juz 20 for page 400', () => {
    const result = getJuzPositionByPage(hafsThumns, 400);
    expect(result.hizbNumber).toBe(40);
    expect(result.juzNumber).toBe(20);
  });

  it('falls back to { hizbNumber: 1, thumnInJuz: 1, juzNumber: 1 } when no thumn covers the page', () => {
    const result = getJuzPositionByPage([], 50);
    expect(result).toEqual({ hizbNumber: 1, thumnInJuz: 1, juzNumber: 1 });
  });

  it('keeps juzNumber and hizbNumber consistent (juzNumber === ceil(hizbNumber / 2))', () => {
    for (const page of [1, 50, 200, 300, 500, 604]) {
      const result = getJuzPositionByPage(hafsThumns, page);
      expect(result.juzNumber).toBe(Math.ceil(result.hizbNumber / 2));
    }
  });
});

describe('getSurahNumberByPage', () => {
  it('returns surah 1 for page 1', () => {
    expect(getSurahNumberByPage(hafsSurahs, 1)).toBe(1);
  });

  it('returns surah 114 (An-Nas) for page 604', () => {
    expect(getSurahNumberByPage(hafsSurahs, 604)).toBe(114);
  });

  it('falls back to 1 when metadata is empty', () => {
    expect(getSurahNumberByPage([], 50)).toBe(1);
  });
});
