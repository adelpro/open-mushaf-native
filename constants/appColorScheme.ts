/**
 * App appearance preference keys, Arabic labels, and resolution helpers.
 * Used by jotai/atoms.ts, utils/applyAppColorScheme.ts, hooks/useAppColorScheme.ts,
 * and the Settings screen theme selector.
 */

export type AppColorScheme = 'light' | 'dark' | 'system';

/** Segment order is RTL-first: dark appears on the right. */
export const APP_COLOR_SCHEME_KEYS: AppColorScheme[] = [
  'dark',
  'light',
  'system',
];

export const APP_COLOR_SCHEME_LABELS = ['داكن', 'فاتح', 'تلقائي (النظام)'];

/**
 * Resolves the scheme at a given selector index (0 = dark, 1 = light,
 * 2 = system), defaulting to the system scheme for out-of-range indices.
 */
export const appColorSchemeAt = (index: number): AppColorScheme => {
  return APP_COLOR_SCHEME_KEYS.at(index) ?? 'system';
};

/**
 * Maps a stored appearance preference to the value expected by
 * `Appearance.setColorScheme`. `null` means follow the system setting.
 */
export const colorSchemeFromPreference = (
  preference: AppColorScheme,
): 'light' | 'dark' | null => {
  return preference === 'system' ? null : preference;
};

/**
 * Resolves the effective light/dark scheme from a stored preference and the
 * current system color scheme.
 */
export const resolveAppColorScheme = (
  preference: AppColorScheme,
  systemScheme: 'light' | 'dark' | null | undefined,
): 'light' | 'dark' => {
  if (preference === 'light' || preference === 'dark') {
    return preference;
  }

  return systemScheme === 'dark' ? 'dark' : 'light';
};
