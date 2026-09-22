import { describe, expect, it } from 'vitest';

import { getPanThreshold, PAN_GESTURE_CONFIG } from '@/constants/panGesture';

describe('getPanThreshold', () => {
  it('scales the threshold with the screen width', () => {
    const small = getPanThreshold(320, false);
    const large = getPanThreshold(430, false);

    expect(small).toBeLessThan(large);
    expect(small).toBe(320 * PAN_GESTURE_CONFIG.PORTRAIT_THRESHOLD_RATIO);
    expect(large).toBe(430 * PAN_GESTURE_CONFIG.PORTRAIT_THRESHOLD_RATIO);
  });

  it('uses the landscape ratio when in landscape', () => {
    const width = 844;

    expect(getPanThreshold(width, true)).toBe(
      width * PAN_GESTURE_CONFIG.LANDSCAPE_THRESHOLD_RATIO,
    );
    expect(getPanThreshold(width, false)).toBe(
      width * PAN_GESTURE_CONFIG.PORTRAIT_THRESHOLD_RATIO,
    );
  });

  it('clamps the threshold to a usable range', () => {
    expect(getPanThreshold(10, false)).toBe(PAN_GESTURE_CONFIG.MIN_THRESHOLD);
    expect(getPanThreshold(10_000, false)).toBe(
      PAN_GESTURE_CONFIG.MAX_THRESHOLD,
    );
  });

  it('requires less travel than the old fixed 100px on small screens', () => {
    expect(getPanThreshold(360, false)).toBeLessThan(100);
  });
});
