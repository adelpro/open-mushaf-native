import { describe, expect, it } from 'vitest';

import { resolvePrimaryVisiblePage } from '../verticalReading';

describe('resolvePrimaryVisiblePage', () => {
  it('returns null when there are no viewable items', () => {
    expect(resolvePrimaryVisiblePage([])).toBeNull();
  });

  it('returns null when no item has a valid index', () => {
    expect(
      resolvePrimaryVisiblePage([{ index: null }, { index: undefined }]),
    ).toBeNull();
  });

  it('resolves the lowest-index viewable item as the primary page', () => {
    expect(
      resolvePrimaryVisiblePage([{ index: 4 }, { index: 3 }, { index: 5 }]),
    ).toBe(4);
  });

  it('ignores items without an index when a valid one exists', () => {
    expect(resolvePrimaryVisiblePage([{ index: null }, { index: 0 }])).toBe(1);
  });

  it('maps a single viewable item to its 1-based page number', () => {
    expect(resolvePrimaryVisiblePage([{ index: 10 }])).toBe(11);
  });
});
