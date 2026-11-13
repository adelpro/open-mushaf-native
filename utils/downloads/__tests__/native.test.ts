import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as downloads from '../downloads.native';
const disk = vi.hoisted(() => ({
  files: new Map<string, Uint8Array>(),
  dirs: new Set<string>(),
  failWrite: false,
  failMove: false,
  failCommit: false,
  failDelete: false,
  failRead: false,
  truncate: false,
}));
vi.mock('expo-file-system', () => {
  const path = (parts: (string | { uri: string })[]) =>
    parts.map((p) => (typeof p === 'string' ? p : p.uri)).join('/');
  class Directory {
    uri: string;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = path(parts);
    }
    get exists() {
      return disk.dirs.has(this.uri);
    }
    create() {
      disk.dirs.add(this.uri);
    }
    list() {
      return [...disk.files.keys()]
        .filter((p) => p.startsWith(this.uri + '/'))
        .map((p) => new File(p));
    }
    delete() {
      if (disk.failDelete) throw new Error('delete denied');
      for (const p of disk.files.keys())
        if (p.startsWith(this.uri + '/')) disk.files.delete(p);
      disk.dirs.delete(this.uri);
    }
  }
  class File {
    uri: string;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = path(parts);
    }
    get exists() {
      return disk.files.has(this.uri);
    }
    get size() {
      return disk.files.get(this.uri)?.length ?? 0;
    }
    info() {
      return { exists: this.exists, size: this.size };
    }
    create() {
      disk.files.set(this.uri, new Uint8Array());
    }
    write(data: string | Uint8Array) {
      if (disk.failWrite) throw new Error('disk full');
      const bytes =
        typeof data === 'string'
          ? new Uint8Array(Buffer.from(data))
          : data.slice();
      disk.files.set(this.uri, disk.truncate ? bytes.slice(0, 4) : bytes);
    }
    bytesSync() {
      return disk.files.get(this.uri)!;
    }
    async bytes() {
      if (disk.failRead) throw new Error('read denied');
      return this.bytesSync();
    }
    textSync() {
      return Buffer.from(this.bytesSync()).toString('utf8');
    }
    async text() {
      return this.textSync();
    }
    delete() {
      if (disk.failDelete) throw new Error('delete denied');
      disk.files.delete(this.uri);
    }
    move(destination: File) {
      if (disk.failMove || (disk.failCommit && this.uri.endsWith('.part')))
        throw new Error('move denied');
      disk.files.set(destination.uri, this.bytesSync());
      disk.files.delete(this.uri);
      this.uri = destination.uri;
    }
  }
  return { Directory, File, Paths: { document: 'document' } };
});
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
beforeEach(() => {
  disk.files.clear();
  disk.dirs.clear();
  disk.failWrite =
    disk.failMove =
    disk.failCommit =
    disk.failDelete =
    disk.failRead =
    disk.truncate =
      false;
  vi.unstubAllGlobals();
});
describe('native staged persistence', () => {
  it('returns only validated URIs and handles missing, corrupt and rejected reads', async () => {
    expect(await downloads.getMushafPageUri('hafs', 1)).toBeUndefined();
    await downloads.persistMushafPage('hafs', 1, png);
    expect(await downloads.getMushafPageUri('hafs', 1)).toBe(
      'document/mushaf/hafs/1.png',
    );
    disk.failRead = true;
    expect(await downloads.getMushafPageUri('hafs', 1)).toBeUndefined();
    disk.failRead = false;
    disk.files.set('document/mushaf/hafs/1.png', png.slice(0, 20));
    expect(await downloads.getMushafPageUri('hafs', 1)).toBeUndefined();
  });
  it('restores the previous cache if the final replacement move fails', async () => {
    await downloads.persistTafseer('muyassar', json);
    disk.failCommit = true;
    await expect(downloads.persistTafseer('muyassar', json)).rejects.toThrow(
      'move denied',
    );
    expect(await downloads.readTafseerFromDisk('muyassar')).toBe(json);
    expect(disk.files.size).toBe(1);
  });
  it('commits validated files with actual UTF-8 sizes and no staging residue', async () => {
    expect(await downloads.persistMushafPage('hafs', 1, png)).toBe(png.length);
    expect(await downloads.isMushafPageCached('hafs', 1)).toBe(true);
    expect(await downloads.persistTafseer('muyassar', json)).toBe(
      Buffer.byteLength(json),
    );
    expect(await downloads.readTafseerFromDisk('muyassar')).toBe(json);
    expect([...disk.files.keys()].some((p) => p.endsWith('.part'))).toBe(false);
  });
  it.each(['failWrite', 'failMove', 'truncate'] as const)(
    'rejects %s and never exposes partial final files',
    async (failure) => {
      disk[failure] = true;
      await expect(
        downloads.persistMushafPage('hafs', 1, png),
      ).rejects.toThrow();
      expect(await downloads.isMushafPageCached('hafs', 1)).toBe(false);
      expect(disk.files.size).toBe(0);
    },
  );
  it('keeps an existing valid file when replacement cannot be written', async () => {
    await downloads.persistTafseer('muyassar', json);
    disk.failWrite = true;
    await expect(downloads.persistTafseer('muyassar', json)).rejects.toThrow();
    expect(await downloads.readTafseerFromDisk('muyassar')).toBe(json);
  });
  it('ignores legacy invalid files, staging files and out-of-range pages', async () => {
    await downloads.persistMushafPage('hafs', 1, png);
    disk.files.set('document/mushaf/hafs/2.png', png.slice(0, 20));
    disk.files.set('document/mushaf/hafs/3.png.part', png);
    disk.files.set('document/mushaf/hafs/999.png', png);
    disk.files.set(
      'document/tafseer/muyassar.json',
      new Uint8Array(Buffer.from('{}')),
    );
    expect(await downloads.getMushafRiwayaDownloadedPages('hafs')).toBe(1);
    expect(await downloads.isTafseerCached('muyassar')).toBe(false);
  });
  it('does not commit cancelled responses after the body finishes', async () => {
    const controller = new AbortController();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        arrayBuffer: async () => {
          controller.abort();
          return png.buffer;
        },
      })),
    );
    await expect(
      downloads.downloadMushafPage('hafs', 1, controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(disk.files.size).toBe(0);
  });
  it('propagates deletion failures so UI cannot report successful deletion', async () => {
    await downloads.persistTafseer('muyassar', json);
    disk.failDelete = true;
    await expect(downloads.deleteTafseer('muyassar')).rejects.toThrow(
      'delete denied',
    );
    expect(await downloads.isTafseerCached('muyassar')).toBe(true);
  });
});
