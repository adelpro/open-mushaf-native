import { describe, it } from 'vitest';

describe('import probe', () => {
  it('loads android-layout (pure helpers)', async () => {
    await import('../android-layout');
  });
  it('loads android widget (TSX)', async () => {
    await import('../android');
  });
  it('loads widget-task-handler (TSX with JSX)', async () => {
    await import('../widget-task-handler');
  });
});
