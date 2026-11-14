import { describe, expect, it, vi } from 'vitest';

import { downloadFirstLaunchBatch } from '../firstLaunch';
describe('first launch downloads', () => {
  it('does not start another riwaya after cancellation', async () => {
    const error = new Error('cancelled');
    error.name = 'AbortError';
    const start = vi.fn().mockRejectedValue(error);
    expect(
      await downloadFirstLaunchBatch(['hafs', 'warsh'], start, () => true),
    ).toBe(false);
    expect(start).toHaveBeenCalledTimes(1);
  });
  it('continues after ordinary failures but leaves completion false', async () => {
    const start = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(undefined);
    expect(
      await downloadFirstLaunchBatch(['hafs', 'warsh'], start, () => true),
    ).toBe(false);
    expect(start).toHaveBeenCalledTimes(2);
  });
  it('only completes once every download has succeeded', async () => {
    let finish!: () => void;
    const start = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      );
    const done = vi.fn();
    const run = downloadFirstLaunchBatch(
      ['hafs', 'warsh'],
      start,
      () => true,
    ).then(done);
    await vi.waitFor(() => expect(start).toHaveBeenCalledTimes(2));
    expect(done).not.toHaveBeenCalled();
    finish();
    await run;
    expect(done).toHaveBeenCalledWith(true);
  });
  it('stops scheduling work after unmount', async () => {
    let active = true;
    const start = vi.fn(async () => {
      active = false;
    });
    expect(
      await downloadFirstLaunchBatch(['hafs', 'warsh'], start, () => active),
    ).toBe(false);
    expect(start).toHaveBeenCalledTimes(1);
  });
});
