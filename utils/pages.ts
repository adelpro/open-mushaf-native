import { quranPngPageUrl } from '@/constants';
import { Riwaya } from '@/types/riwaya';

/**
 * Resolves the page image module map for the active Riwaya.
 *
 * @param riwaya - The selected Riwaya ('hafs' | 'warsh' | undefined).
 * @returns The image module map for the Riwaya, or `undefined` when no
 * Riwaya has been selected yet.
 */
export function getPageSource(riwaya: Riwaya | undefined, page: number) {
  if (!riwaya) return undefined;
  return {
    kind: 'png-uri',
    source: quranPngPageUrl(riwaya, page),
  };
}
