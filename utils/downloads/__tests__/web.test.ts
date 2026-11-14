import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { quranTafseerUrl } from '@/constants/TafseerCdn';

import * as downloads from '../downloads.web';
import { parseTafseer, utf8ByteLength, validatePng } from '../validation';

const png = new Uint8Array(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
    'base64',
  ),
);
const json = JSON.stringify(
  Array.from({ length: 6236 }, (_, i) => ({
    id: i + 1,
    sura: Math.floor(i / 286) + 1,
    aya: (i % 286) + 1,
    text: 'تفسير',
  })),
);
let entries: Map<string, Response>;
let put: ReturnType<typeof vi.fn>;
beforeEach(() => {
  entries = new Map();
  put = vi.fn(async (request: Request, response: Response) => {
    entries.set(request.url, response.clone());
  });
  vi.stubGlobal('caches', {
    open: async () => ({
      put,
      match: async (request: string | Request) =>
        entries
          .get(typeof request === 'string' ? request : request.url)
          ?.clone(),
      delete: async (url: string) => entries.delete(url),
      keys: async () => [...entries.keys()].map((url) => new Request(url)),
    }),
    delete: vi.fn(),
  });
});
afterEach(() => vi.unstubAllGlobals());
describe('cache data integrity', () => {
  it('treats malformed and incomplete legacy tafseer files as cache misses', async () => {
    for (const raw of [
      '<html>error</html>',
      'null',
      '[{"sura":1,"aya":1,"text":"partial"}]',
    ]) {
      entries.set(quranTafseerUrl('muyassar'), new Response(raw));
      expect(await downloads.isTafseerCached('muyassar')).toBe(false);
    }
    entries.set(quranTafseerUrl('muyassar'), new Response(json));
    expect(await downloads.isTafseerCached('muyassar')).toBe(true);
  });
  it('rejects valid JSON containing an incomplete dataset', async () => {
    const partial = JSON.stringify([{ sura: 1, aya: 1, text: 'partial' }]);
    await expect(downloads.persistTafseer('muyassar', partial)).rejects.toThrow(
      'Incomplete tafseer',
    );
    expect(put).not.toHaveBeenCalled();
  });
  it('rejects corrupt PNG checksums and cleans up invalid cache readbacks', async () => {
    const corrupt = png.slice();
    corrupt[45] ^= 1;
    expect(() => validatePng(corrupt)).toThrow('checksum');
    put.mockImplementation(async (request: Request) => {
      entries.set(request.url, new Response(corrupt));
    });
    await expect(downloads.persistMushafPage('hafs', 1, png)).rejects.toThrow(
      'checksum',
    );
    expect(entries.size).toBe(0);
  });
  it('rejects truncated PNGs, HTML and malformed tafseer', () => {
    expect(() => validatePng(png)).not.toThrow();
    expect(() => validatePng(png.slice(0, -8))).toThrow();
    expect(() => validatePng(new Uint8Array([1]))).toThrow();
    for (const value of [
      '{}',
      'null',
      '[]',
      '[{"sura":1}]',
      '<html>error</html>',
    ])
      expect(() => parseTafseer(value)).toThrow();
  });
  it('persists only the typed array view and counts UTF-8 bytes', async () => {
    const larger = new Uint8Array(png.length + 10);
    larger.set(png, 5);
    expect(
      await downloads.persistMushafPage('hafs', 1, larger.subarray(5, -5)),
    ).toBe(png.length);
    expect(await downloads.readMushafPageFromDisk('hafs', 1)).toEqual(png);
    expect(await downloads.persistTafseer('muyassar', json)).toBe(
      Buffer.byteLength(json),
    );
    expect(utf8ByteLength('تفسير')).toBe(Buffer.byteLength('تفسير'));
  });
  it('rejects unavailable storage and quota failures instead of reporting downloaded', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(png)),
    );
    vi.stubGlobal('caches', undefined);
    await expect(downloads.downloadMushafPage('hafs', 1)).rejects.toThrow(
      'unavailable',
    );
  });
  it('propagates persistence errors', async () => {
    put.mockRejectedValue(new Error('quota exceeded'));
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(json)),
    );
    await expect(downloads.downloadTafseer('muyassar')).rejects.toThrow(
      'quota exceeded',
    );
    expect(await downloads.isTafseerCached('muyassar')).toBe(false);
  });
  it('does not persist cancellation after response consumption', async () => {
    const controller = new AbortController();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        text: async () => {
          controller.abort();
          return json;
        },
      })),
    );
    await expect(
      downloads.downloadTafseer('muyassar', controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(put).not.toHaveBeenCalled();
  });
  it('removes a cache write cancelled while put is in flight', async () => {
    const controller = new AbortController();
    const original = put.getMockImplementation()!;
    put.mockImplementation(async (...args) => {
      await (original as (...values: unknown[]) => Promise<void>)(...args);
      controller.abort();
    });
    await expect(
      downloads.persistTafseer('muyassar', json, controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(await downloads.isTafseerCached('muyassar')).toBe(false);
  });
  it('ignores invalid legacy entries and unexpected page keys in completion counts', async () => {
    await downloads.persistMushafPage('hafs', 1, png);
    entries.set('https://unexpected.test/999.png', new Response(png));
    entries.set(
      'https://unexpected.test/error',
      new Response('<html>error</html>'),
    );
    expect(await downloads.getMushafRiwayaDownloadedPages('hafs')).toBe(1);
  });
});
