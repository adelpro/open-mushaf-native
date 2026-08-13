/**
 * Applies the persisted app appearance preference to the native Appearance API
 * and, on web, to the document `color-scheme` style and `html.light` / `html.dark`
 * classes (react-native-web has no Appearance.setColorScheme).
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
    const root = document.documentElement;
    root.style.colorScheme = preference === 'system' ? 'normal' : preference;
    root.classList.remove('light', 'dark');
    if (preference === 'light' || preference === 'dark') {
      root.classList.add(preference);
    }
  }
}
