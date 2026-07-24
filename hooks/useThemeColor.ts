/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/Colors';

type ThemeName = 'light' | 'dark';

/**
 * Normalize the system color-scheme value (which can be `null`,
 * `'light'`, `'dark'`, or `'unspecified'`) to a two-key theme name.
 */
function resolveTheme(scheme: ReturnType<typeof useColorScheme>): ThemeName {
  return scheme === 'dark' ? 'dark' : 'light';
}

/**
 * Hook to resolve a theme-aware color safely.
 * Will prefer explicitly provided localized colors, otherwise falls back to calculating the active color scheme constant.
 *
 * @param props - Specific color overrides designated for light and dark modes.
 * @param colorName - The key name mapped in the standard `Colors` constant palette.
 * @returns The resolved hex color string.
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = resolveTheme(useColorScheme());
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
