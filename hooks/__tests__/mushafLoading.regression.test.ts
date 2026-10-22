import { describe, expect, it, vi } from 'vitest';

import { getPageSource } from '@/utils/pages';

vi.mock('@/constants', () => ({
  quranPngPageUrl: (riwaya: string, page: number) =>
    `https://cdn.example.test/${riwaya}/${page}.png`,
}));

describe('mushaf loading/error regression', () => {
  it('resolves the current page to a CDN PNG URL', () => {
    const source = getPageSource('hafs', 5);

    expect(source).toEqual({
      kind: 'png-uri',
      source: 'https://cdn.example.test/hafs/5.png',
    });
  });

  it('returns undefined when no riwaya is active', () => {
    expect(getPageSource(undefined, 5)).toBeUndefined();
  });
});
