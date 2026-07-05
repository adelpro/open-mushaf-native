import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createLongPressHandlers } from '../longPress';

describe('createLongPressHandlers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires the long press callback after the configured delay', () => {
    const onLongPress = vi.fn();
    const handlers = createLongPressHandlers({
      delay: 500,
      isWeb: true,
      onLongPress,
    });

    handlers.onPointerDown();
    vi.advanceTimersByTime(499);
    expect(onLongPress).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('cancels the pending long press when the gesture ends early', () => {
    const onLongPress = vi.fn();
    const handlers = createLongPressHandlers({
      delay: 500,
      isWeb: true,
      onLongPress,
    });

    handlers.onPointerDown();
    handlers.onPointerUp();
    vi.advanceTimersByTime(500);

    expect(onLongPress).not.toHaveBeenCalled();
  });
});
