/**
 * Resolves the effective light/dark scheme from the persisted app preference
 * and the system color scheme. Used by useColors, useThemeColor, root/tab
 * layouts, and screens that previously called React Native's useColorScheme.
 */

import { useColorScheme } from 'react-native';

import { useAtomValue } from 'jotai/react';

import { resolveAppColorScheme } from '@/constants/appColorScheme';
import { appColorScheme } from '@/jotai/atoms';

/**
 * Returns the color scheme the UI should render.
 * Honors an explicit dark/light preference and follows the system when set to automatic.
 */
export const useAppColorScheme = (): 'light' | 'dark' => {
  const systemScheme = useColorScheme();
  const preference = useAtomValue(appColorScheme);

  return resolveAppColorScheme(preference, systemScheme);
};
