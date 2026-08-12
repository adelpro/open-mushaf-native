/**
 * Applies the persisted app appearance preference to the native Appearance API
 * and, on web, to the document `color-scheme` style.
 * Used by jotai/atoms.ts on hydrate and whenever the preference changes.
 */

import { Appearance, Platform } from 'react-native';

import {
  type AppColorScheme,
  colorSchemeFromPreference,
} from '@/constants/appColorScheme';

/**
 * Pushes the user's appearance preference into the platform color-scheme APIs.
 * Safe to call during SSR: missing APIs and storage errors are ignored.
 */
export function applyAppColorScheme(preference: AppColorScheme): void {
  const scheme = colorSchemeFromPreference(preference);

  if (typeof Appearance.setColorScheme === 'function') {
    try {
      Appearance.setColorScheme(scheme);
    } catch {
      // NativeAppearance is unavailable on web and during static rendering.
    }
  }

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.documentElement.style.colorScheme =
      preference === 'system' ? 'normal' : preference;
  }
}
