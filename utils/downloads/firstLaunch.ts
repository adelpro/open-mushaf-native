import type { Riwaya } from '@/types';

/** Resume cached pages through startRiwaya; never finish an incomplete batch. */
export async function downloadFirstLaunchBatch(
  riwayas: readonly Riwaya[],
  start: (riwaya: Riwaya) => Promise<void>,
  isActive: () => boolean,
): Promise<boolean> {
  let complete = true;
  for (const riwaya of riwayas) {
    if (!isActive()) return false;
    try {
      await start(riwaya);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return false;
      complete = false;
    }
  }
  return complete && isActive();
}
