import { imagesMapHafs, imagesMapWarsh } from '@/constants';
import { Riwaya } from '@/types/riwaya';

/**
 * Resolves the page image module map for the active Riwaya.
 *
 * @param riwaya - The selected Riwaya ('hafs' | 'warsh' | undefined).
 * @returns The image module map for the Riwaya, or `undefined` when no
 * Riwaya has been selected yet.
 */
export function getImagesMap(riwaya: Riwaya) {
  switch (riwaya) {
    case 'hafs':
      return imagesMapHafs;
    case 'warsh':
      return imagesMapWarsh;
    default:
      return undefined;
  }
}
