import { createStore } from 'jotai/vanilla';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  downloadProgressAtom,
  useMushafDownload,
} from '@/hooks/useMushafDownload';
import { useTafseerDownload } from '@/hooks/useTafseerDownload';
import { downloadedRiwayat, downloadedTafseers } from '@/jotai/atoms';
import {
  downloadMushafPage,
  downloadTafseer,
  isMushafPageCached,
  isTafseerCached,
} from '@/utils/downloads';

const state = vi.hoisted(() => ({
  store: null as ReturnType<typeof createStore> | null,
}));
vi.mock('react', () => ({
  useCallback: (fn: unknown) => fn,
  useMemo: (fn: () => unknown) => fn(),
}));
vi.mock('jotai', async () => {
  const actual =
    await vi.importActual<typeof import('jotai/vanilla')>('jotai/vanilla');
  return {
    ...actual,
    useStore: () => state.store!,
    useAtom: (atom: never) => [
      state.store!.get(atom),
      (update: never) => state.store!.set(atom, update),
    ],
    useAtomValue: (atom: never) => state.store!.get(atom),
    useSetAtom: (atom: never) => (update: never) =>
      state.store!.set(atom, update),
  };
});
vi.mock('@/jotai/atoms', async () => {
  const { atom } = await import('jotai/vanilla');
  return {
    downloadedRiwayat: atom<string[]>([]),
    downloadedTafseers: atom<string[]>([]),
  };
});
vi.mock('@/utils/downloads', () => ({
  downloadMushafPage: vi.fn(),
  downloadTafseer: vi.fn(),
  isMushafPageCached: vi.fn(),
  isTafseerCached: vi.fn(),
  riwayaTotalPages: () => 3,
  readMushafPageFromDisk: vi.fn(),
  deleteTafseer: vi.fn(),
}));

beforeEach(() => {
  state.store = createStore();
  vi.resetAllMocks();
  vi.mocked(isMushafPageCached).mockResolvedValue(false);
  vi.mocked(isTafseerCached).mockResolvedValue(false);
  vi.mocked(downloadMushafPage).mockResolvedValue({ bytes: 42 });
  vi.mocked(downloadTafseer).mockResolvedValue({ bytes: 42 });
});
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

describe('shared download lifecycle', () => {
  it.each([true, false])(
    'preserves an old marker only if no missing page was observed (%s)',
    async (cached) => {
      state.store!.set(downloadedRiwayat, ['hafs']);
      const scan = deferred<boolean>();
      vi.mocked(isMushafPageCached).mockReturnValueOnce(scan.promise);
      const operation = useMushafDownload().startRiwaya('hafs');
      useMushafDownload().cancel();
      scan.resolve(cached);
      await expect(operation).rejects.toMatchObject({ name: 'AbortError' });
      expect(state.store!.get(downloadedRiwayat)).toEqual(
        cached ? ['hafs'] : [],
      );
      expect(
        Object.values(state.store!.get(downloadProgressAtom))[0].status,
      ).toBe(cached ? 'done' : 'cancelled');
      expect(downloadMushafPage).not.toHaveBeenCalled();
    },
  );
  it('preserves verified cached tafseer when cancelled during its cache probe', async () => {
    state.store!.set(downloadedTafseers, ['muyassar']);
    const scan = deferred<boolean>();
    vi.mocked(isTafseerCached).mockReturnValueOnce(scan.promise);
    const operation = useTafseerDownload().startTafseer('muyassar');
    useTafseerDownload().cancel();
    scan.resolve(true);
    await expect(operation).rejects.toMatchObject({ name: 'AbortError' });
    expect(state.store!.get(downloadedTafseers)).toEqual(['muyassar']);
    expect(
      Object.values(state.store!.get(downloadProgressAtom))[0],
    ).toMatchObject({ status: 'done', downloaded: 1 });
    expect(downloadTafseer).not.toHaveBeenCalled();
  });
  it('cancels retry backoff without waiting for its timer', async () => {
    vi.useFakeTimers();
    vi.mocked(downloadMushafPage).mockRejectedValue(new Error('offline'));
    const operation = useMushafDownload({ concurrency: 1 }).startRiwaya('hafs');
    const rejected = expect(operation).rejects.toMatchObject({
      name: 'AbortError',
    });
    await vi.advanceTimersByTimeAsync(0);
    useMushafDownload().cancel();
    await rejected;
    expect(downloadMushafPage).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });
  it('rejects a zero-byte persistence result', async () => {
    vi.mocked(downloadTafseer).mockResolvedValueOnce({ bytes: 0 });
    await expect(useTafseerDownload().startTafseer('muyassar')).rejects.toThrow(
      'persistence failed',
    );
    expect(state.store!.get(downloadedTafseers)).toEqual([]);
  });
  it('releases a mushaf cache probe failure', async () => {
    vi.mocked(isMushafPageCached).mockRejectedValueOnce(
      new Error('cache scan failed'),
    );
    await expect(useMushafDownload().startRiwaya('hafs')).rejects.toThrow(
      'cache scan failed',
    );
    await useMushafDownload().startRiwaya('hafs');
  });
  it('rejects partial downloads and never records completion', async () => {
    vi.useFakeTimers();
    vi.mocked(downloadMushafPage).mockImplementation(async (_r, page) => {
      if (page === 2) throw new Error('disk full');
      return { bytes: 42 };
    });
    const result = useMushafDownload().startRiwaya('hafs');
    const rejected = expect(result).rejects.toThrow('Some pages');
    await vi.runAllTimersAsync();
    await rejected;
    vi.useRealTimers();
    expect(
      vi.mocked(downloadMushafPage).mock.calls.filter(([, page]) => page === 2),
    ).toHaveLength(3);
    expect(state.store!.get(downloadedRiwayat)).toEqual([]);
    expect(
      Object.values(state.store!.get(downloadProgressAtom))[0],
    ).toMatchObject({ downloaded: 2, status: 'error' });
  });
  it('cancels during cache scanning from a different hook instance and releases the lease', async () => {
    const scan = deferred<boolean>();
    vi.mocked(isMushafPageCached).mockReturnValueOnce(scan.promise);
    const first = useMushafDownload().startRiwaya('hafs');
    useMushafDownload().cancel();
    scan.resolve(false);
    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    expect(downloadMushafPage).not.toHaveBeenCalled();
    expect(state.store!.get(downloadedRiwayat)).toEqual([]);
    await useMushafDownload().startRiwaya('hafs');
  });
  it('prevents concurrent attempts across instances and resource kinds until workers settle', async () => {
    const pending = deferred<{ bytes: number }>();
    vi.mocked(downloadTafseer).mockReturnValueOnce(pending.promise);
    const first = useTafseerDownload().startTafseer('muyassar');
    await vi.waitFor(() => expect(downloadTafseer).toHaveBeenCalled());
    await expect(useMushafDownload().startRiwaya('hafs')).rejects.toThrow();
    useMushafDownload().cancel();
    await expect(useTafseerDownload().startTafseer('saady')).rejects.toThrow();
    pending.resolve({ bytes: 42 });
    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    expect(state.store!.get(downloadedTafseers)).toEqual([]);
    await useTafseerDownload().startTafseer('saady');
  });
  it('releases cached tafseer and failed cache scans through finally', async () => {
    vi.mocked(isTafseerCached)
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(new Error('cache read failed'));
    await useTafseerDownload().startTafseer('muyassar');
    await expect(useTafseerDownload().startTafseer('saady')).rejects.toThrow(
      'cache read failed',
    );
    await useTafseerDownload().startTafseer('saady');
    expect(state.store!.get(downloadedTafseers)).toEqual(['muyassar', 'saady']);
  });
  it('does not mark tafseer complete on persistence failure', async () => {
    vi.mocked(downloadTafseer).mockRejectedValueOnce(
      new Error('QuotaExceededError'),
    );
    await expect(useTafseerDownload().startTafseer('muyassar')).rejects.toThrow(
      'QuotaExceededError',
    );
    expect(state.store!.get(downloadedTafseers)).toEqual([]);
  });
  it.each([0, -1, 1.5, NaN, Infinity])(
    'rejects invalid concurrency %s',
    async (concurrency) => {
      await expect(
        useMushafDownload({ concurrency }).startRiwaya('hafs'),
      ).rejects.toThrow('concurrency');
      expect(downloadMushafPage).not.toHaveBeenCalled();
    },
  );
});
