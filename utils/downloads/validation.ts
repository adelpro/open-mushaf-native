import type { TafseerKey } from '@/constants/TafseerCdn';
import type { TafseerAya } from '@/types';

const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, n) => {
  let crc = n;
  for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  return crc >>> 0;
});

/** Reject HTML, empty responses and truncated PNG chunks before committing. */
export function validatePng(bytes: Uint8Array): void {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!signature.every((value, i) => bytes[i] === value))
    throw new Error('Invalid PNG signature');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 8;
  let hasData = false;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    if (length > bytes.length - offset - 12) throw new Error('Truncated PNG');
    if (
      offset === 8 &&
      (type !== 'IHDR' ||
        length !== 13 ||
        !view.getUint32(offset + 8) ||
        !view.getUint32(offset + 12))
    )
      throw new Error('Invalid PNG header');
    if (type === 'IDAT' && length > 0) hasData = true;
    let crc = 0xffffffff;
    for (let i = offset + 4; i < offset + 8 + length; i++) {
      crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    }
    if ((crc ^ 0xffffffff) >>> 0 !== view.getUint32(offset + 8 + length))
      throw new Error('Corrupt PNG checksum');
    offset += length + 12;
    if (type === 'IEND') {
      if (length !== 0 || offset !== bytes.length || !hasData)
        throw new Error('Invalid PNG end');
      return;
    }
  }
  throw new Error('Incomplete PNG');
}

// Validate structure and completeness; preserve source metadata, including legacy typos.
export function parseTafseer(json: string, key?: TafseerKey): TafseerAya[] {
  const data: unknown = JSON.parse(json);
  if (
    !Array.isArray(data) ||
    data.length === 0 ||
    !data.every(
      (row) =>
        row &&
        Number.isInteger(row.sura) &&
        row.sura >= 1 &&
        Number.isInteger(row.aya) &&
        row.aya >= 1 &&
        typeof row.text === 'string',
    )
  )
    throw new Error('Invalid tafseer data');
  if (key && data.length !== (key === 'nozool-wahidy' ? 506 : 6236)) {
    throw new Error('Incomplete tafseer dataset');
  }
  return data as TafseerAya[];
}

// TextEncoder is not available on all React Native runtimes.
export function utf8ByteLength(text: string): number {
  let bytes = 0;
  for (const char of text) {
    const code = char.codePointAt(0)!;
    bytes += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
  }
  return bytes;
}
