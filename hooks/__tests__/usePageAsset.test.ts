import { describe, expect, it, vi } from 'vitest';

import { getPageSource } from '@/utils/pages';

vi.mock('@/constants', () => ({
  quranPngPageUrl: (riwaya: string, page: number) =>
    `https://cdn.example.test/${riwaya}/${page}.png`,
}));

vi.mock('react-native-mmkv', () => ({
  MMKV: class {
    getString = vi.fn(() => null);
    set = vi.fn();
    delete = vi.fn();
    addOnValueChangedListener = vi.fn(() => ({ remove: vi.fn() }));
  },
}));

describe('page source resolution', () => {
  it('returns a CDN PNG URL for the active riwaya and page', () => {
    const result = getPageSource('hafs', 1);

    expect(result).toEqual({
      kind: 'png-uri',
      source: 'https://cdn.example.test/hafs/1.png',
    });
  });

  it('returns undefined when no riwaya is selected', () => {
    expect(getPageSource(undefined, 1)).toBeUndefined();
  });
});
