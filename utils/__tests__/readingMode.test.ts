import { describe, expect, it } from 'vitest';

import type { ReadingMode } from '@/types/reading-mode';

import { getReadingModeByIndex, getReadingModeIndex } from '../readingMode';

describe('getReadingModeIndex', () => {
  it('returns 0 for horizontal', () => {
    expect(getReadingModeIndex('horizontal')).toBe(0);
  });

  it('returns 1 for vertical', () => {
    expect(getReadingModeIndex('vertical')).toBe(1);
  });

  it('returns 0 for an unknown value (fallback)', () => {
    const invalidInput: string = 'unknown';
    expect(getReadingModeIndex(invalidInput as ReadingMode)).toBe(0);
  });
});

describe('getReadingModeByIndex', () => {
  it('returns horizontal for index 0', () => {
    expect(getReadingModeByIndex(0)).toBe('horizontal');
  });

  it('returns vertical for index 1', () => {
    expect(getReadingModeByIndex(1)).toBe('vertical');
  });

  it('throws for negative index', () => {
    expect(() => getReadingModeByIndex(-1)).toThrow('Invalid index: -1');
  });

  it('throws for out-of-bounds index', () => {
    expect(() => getReadingModeByIndex(2)).toThrow('Invalid index: 2');
  });
});
