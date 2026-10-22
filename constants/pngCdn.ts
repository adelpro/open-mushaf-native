import { type Riwaya, RIWAYA_TO_ASSET_DIRECTORY } from '@/constants/riwayas';

const PNG_SOURCE_SHA = '439f1cfeea4d40fe0a6cb8644c1deb088ea84629';
const DEFAULT_PNG_CDN_BASE = `https://cdn.jsdelivr.net/gh/adelpro/open-mushaf-native@${PNG_SOURCE_SHA}/assets/mushaf-data`;

export const QURAN_PNG_CDN_BASE: string =
  typeof process !== 'undefined'
    ? (process.env?.EXPO_PUBLIC_QURAN_PNG_CDN ?? DEFAULT_PNG_CDN_BASE)
    : DEFAULT_PNG_CDN_BASE;

export function quranPngPageUrl(riwaya: Riwaya, page: number): string {
  const directory = RIWAYA_TO_ASSET_DIRECTORY[riwaya];
  return `${QURAN_PNG_CDN_BASE}/${directory}/${page}.png`;
}
