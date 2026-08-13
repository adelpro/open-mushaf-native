/**
 * Keeps platform appearance APIs in sync with the persisted appColorScheme atom.
 * Mounted once in the root layout so web (no Appearance.setColorScheme) still
 * updates document classes and color-scheme when the user changes وضع التطبيق.
 */

import { useEffect } from 'react';

import { useAtomValue } from 'jotai/react';

import { appColorScheme } from '@/jotai/atoms';
import { applyAppColorScheme } from '@/utils/applyAppColorScheme';

/**
 * Client-side appearance sync. Renders nothing.
 */
export function AppColorSchemeSync() {
  const preference = useAtomValue(appColorScheme);

  useEffect(() => {
    applyAppColorScheme(preference);
  }, [preference]);

  return null;
}
