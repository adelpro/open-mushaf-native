/**
 * TopMenu Surah label coverage — asserts all 114 Surah display names are
 * complete (no empty/partial labels) after `formatSurahDisplayName`.
 *
 * Run via `yarn test`. Related production helper:
 * `utils/quranMetadataUtils.ts` → used by `components/TopMenu/index.tsx`.
 */
import { removeTashkeel } from 'quran-search-engine';
import { describe, expect, it } from 'vitest';

import hafsSurahs from '../../assets/quran-metadata/mushaf-elmadina-hafs-assim/surah.json';
import warshSurahs from '../../assets/quran-metadata/mushaf-elmadina-warsh-azrak/surah.json';
import { Surah } from '../../types';
import { formatSurahDisplayName } from '../quranMetadataUtils';

/** Smallest phone width the TopMenu must still fit on. */
const MIN_SCREEN_WIDTH = 320;
/**
 * Approximate reserved width (px) for actions + juz + dividers + padding.
 * Surah number badge sits below the name, so the name uses this leftover width.
 */
const RESERVED_CHROME_WIDTH = 200;
/** Tajawal_700Bold ~15px glyph width before `adjustsFontSizeToFit`. */
const AVG_GLYPH_WIDTH = 9;
/** Matches TopMenu `minimumFontScale` so long names can shrink instead of ellipsis. */
const MIN_FONT_SCALE = 0.72;

function assertAllSurahNamesFullyVisible(surahs: Surah[], riwaya: string) {
  expect(surahs, `${riwaya} should list 114 surahs`).toHaveLength(114);

  const availableNameWidth = MIN_SCREEN_WIDTH - RESERVED_CHROME_WIDTH;
  const maxCharsThatFit = Math.floor(
    availableNameWidth / (AVG_GLYPH_WIDTH * MIN_FONT_SCALE),
  );

  const incomplete: string[] = [];
  const tooLongForNarrowScreens: string[] = [];
  const seenNumbers = new Set<number>();

  for (const surah of surahs) {
    seenNumbers.add(surah.number);

    const cleaned = removeTashkeel(surah.name).trim();
    const displayName = formatSurahDisplayName(surah.name);

    if (!cleaned || !displayName) {
      incomplete.push(`#${surah.number} empty name`);
      continue;
    }

    if (!displayName.startsWith('سورة ')) {
      incomplete.push(`#${surah.number} missing سورة prefix: ${displayName}`);
    }

    if (displayName !== `سورة ${cleaned}`) {
      incomplete.push(
        `#${surah.number} truncated or altered: got "${displayName}", expected "سورة ${cleaned}"`,
      );
    }

    if (displayName.includes('…') || displayName.includes('...')) {
      incomplete.push(`#${surah.number} contains ellipsis: ${displayName}`);
    }

    if (displayName.length > maxCharsThatFit) {
      tooLongForNarrowScreens.push(
        `#${surah.number} "${displayName}" (${displayName.length} chars > ${maxCharsThatFit})`,
      );
    }
  }

  for (let n = 1; n <= 114; n += 1) {
    if (!seenNumbers.has(n)) {
      incomplete.push(`missing surah number ${n}`);
    }
  }

  expect(incomplete, incomplete.join('\n')).toEqual([]);
  expect(
    tooLongForNarrowScreens,
    `Surah labels exceed estimated narrow-screen budget (${maxCharsThatFit} chars / ${availableNameWidth}px at minFontScale ${MIN_FONT_SCALE}):\n${tooLongForNarrowScreens.join('\n')}`,
  ).toEqual([]);
}

describe('TopMenu Surah display names', () => {
  it('shows the full name for all 114 Hafs surahs', () => {
    assertAllSurahNamesFullyVisible(hafsSurahs as Surah[], 'Hafs');
  });

  it('shows the full name for all 114 Warsh surahs', () => {
    assertAllSurahNamesFullyVisible(warshSurahs as Surah[], 'Warsh');
  });

  it('formatSurahDisplayName strips tashkeel and prefixes سورة', () => {
    expect(formatSurahDisplayName('البَقَرَةِ')).toBe('سورة البقرة');
    expect(formatSurahDisplayName('')).toBe('');
  });
});
