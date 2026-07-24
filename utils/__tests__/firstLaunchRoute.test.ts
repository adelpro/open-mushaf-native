import { describe, expect, it } from 'vitest';

import { getInitialRoute } from '../firstLaunchRoute';

describe('getInitialRoute', () => {
  it('routes an incomplete installation to the first-launch wizard', () => {
    expect(getInitialRoute(false)).toBe('/(first-launch)');
  });

  it('routes a completed installation to the tabs', () => {
    expect(getInitialRoute(true)).toBe('/(tabs)');
  });
});
