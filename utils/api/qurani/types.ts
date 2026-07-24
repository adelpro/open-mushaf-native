/**
 * Type definitions for the qurani.ai REST API client.
 *
 * The API base is `https://api.qurani.ai/gw/qh/v1/`. Every response
 * is wrapped in a `{ code, status, data }` envelope. Errors come back
 * as 4xx with `data: "Something wrong happened: ..."` or as 5xx
 * (the service has occasional `502` blips — see `QuranApiErrorKind`).
 *
 * Authentication: free tier, no API key required. Rate limits are not
 * documented; the client retries 5xx with backoff.
 *
 * Reference: https://qurani.ai/en/docs
 */

/* ────────── Response envelope ────────── */

/** Every successful response wraps its payload in this shape. */
export type QuranApiEnvelope<T> = {
  code: number; // 200 on success
  status: string; // "OK" | "Error" | ...
  data: T;
};

/* ────────── Surah + ayah payloads ────────── */

export type QuranApiSurahHeader = {
  number: number; // 1..114
  name: string; // Arabic
  englishName: string;
  englishNameTranslation?: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
};

/**
 * A single ayah. `number` is the global (Hafs-canonical) ayah index,
 * 1..6236. `numberInSurah` is the riwaya-aware per-surah number — in
 * Warsh / Qalon, Baqarah ends at `numberInSurah=285`, while Hafs ends
 * at `286`. `sajda` is `false` for non-sajda ayahs.
 */
export type QuranApiAyah = {
  number: number;
  text: string;
  surah: QuranApiSurahHeader;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: false | { id: number; recommended: boolean; obligatory: boolean };
};

export type QuranApiSurah = QuranApiSurahHeader & {
  ayahs: QuranApiAyah[];
};

export type QuranApiPage = {
  number: number;
  topPageSurah: QuranApiSurahHeader;
  topPageJuz: number;
  hizbNumbers: number[];
  ayahs: QuranApiAyah[];
  /** All surahs that have at least one ayah on this page (used for inline headers). */
  surahs: QuranApiSurahHeader[];
};

/* ────────── Edition payload (listEditions) ────────── */

export type QuranApiEditionFormat = 'text' | 'audio';

export type QuranApiEditionType =
  | 'quran'
  | 'translation'
  | 'tafsir'
  | 'narration'
  | 'versebyverse'
  | 'surah'
  | string;

export type QuranApiEdition = {
  identifier: string; // "quran-hafs", "en.sahih", "ar.muyassar", ...
  language: string; // "ar" | "en" | ...
  englishName: string;
  name?: string; // Arabic name where applicable
  format: QuranApiEditionFormat;
  type: QuranApiEditionType;
  direction?: 'rtl' | 'ltr' | null;
  /** Audio-only metadata */
  narratorIdentifier?: string | null;
  recitationType?: 'murattal' | 'mujawwad' | string | null;
  /** Tafseer-only metadata */
  level?: number | null;
  imageUrl?: string | null;
};

/* ────────── Error union ────────── */

export type QuranApiErrorKind =
  | 'offline' // network unreachable, DNS failure, etc.
  | 'timeout' // hit the 15s timeout (no caller abort)
  | 'http-4xx' // 4xx — bad reference, missing edition, etc.
  | 'http-5xx' // 5xx — qurani.ai server error (incl. the sporadic 502)
  | 'parse' // body wasn't a valid envelope
  | 'aborted'; // caller called AbortController.abort()

/**
 * Discriminated error class for qurani.ai failures. Consumers use
 * `error.kind` to pick the right UX path (retry / offline CTA / etc.).
 */
export class QuranApiError extends Error {
  readonly kind: QuranApiErrorKind;
  readonly status?: number;
  readonly url?: string;

  constructor(
    kind: QuranApiErrorKind,
    message: string,
    options?: { status?: number; url?: string },
  ) {
    super(message);
    this.kind = kind;
    this.status = options?.status;
    this.url = options?.url;
    this.name = 'QuranApiError';
  }
}
