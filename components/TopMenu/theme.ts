/**
 * Light/dark color tokens and bar chrome styles for the Mushaf TopMenu.
 *
 * Used by `TopMenuBar`, `SurahSection`, `JuzSection`, and `Actions`.
 */
import { useColorScheme } from 'react-native';

import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks';

import { withAlpha } from './withAlpha';

export interface TopMenuTheme {
  accentColor: string;
  iconColor: string;
  primaryText: string;
  surahNumberColor: string;
  actionLabelColor: string;
  actionIconBackground: string;
  dividerColor: string;
  progressTrack: string;
  barContainerStyle: {
    backgroundColor: string;
    borderColor: string;
    paddingTop: number;
    paddingLeft: number;
    paddingRight: number;
  };
}

interface ChromePalette {
  iconColor: string;
  primaryText: string;
  surahNumberColor: string;
  actionLabelColor: string;
  borderBase: string;
  barAlpha: number;
  iconAlpha: number;
  progressTrack: string;
}

function getChromePalette(
  isDark: boolean,
  primaryColor: string,
  primaryLightColor: string,
  secondaryColor: string,
  textColor: string,
): ChromePalette {
  if (isDark) {
    return {
      iconColor: primaryLightColor,
      primaryText: textColor,
      surahNumberColor: textColor,
      actionLabelColor: textColor,
      borderBase: primaryColor,
      barAlpha: 0.72,
      iconAlpha: 0.55,
      progressTrack: 'rgba(98, 164, 155, 0.35)',
    };
  }
  return {
    iconColor: primaryColor,
    primaryText: primaryColor,
    surahNumberColor: secondaryColor,
    actionLabelColor: primaryColor,
    borderBase: secondaryColor,
    barAlpha: 0.78,
    iconAlpha: 0.7,
    progressTrack: 'rgba(30, 82, 67, 0.2)',
  };
}

function getBarContainerStyle(
  ivoryColor: string,
  chrome: ChromePalette,
  insets: EdgeInsets,
) {
  return {
    backgroundColor: withAlpha(ivoryColor, chrome.barAlpha),
    borderColor: withAlpha(chrome.borderBase, 0.35),
    paddingTop: Math.max(insets.top, 8),
    paddingLeft: Math.max(insets.left, 12),
    paddingRight: Math.max(insets.right, 12),
  };
}

export function useTopMenuTheme(): TopMenuTheme {
  const colors = useColors();
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const chrome = getChromePalette(
    isDark,
    colors.primaryColor,
    colors.primaryLightColor,
    colors.secondaryColor,
    colors.textColor,
  );

  return {
    accentColor: colors.secondaryColor,
    iconColor: chrome.iconColor,
    primaryText: chrome.primaryText,
    surahNumberColor: chrome.surahNumberColor,
    actionLabelColor: chrome.actionLabelColor,
    actionIconBackground: withAlpha(colors.cardColor, chrome.iconAlpha),
    dividerColor: colors.secondaryColor,
    progressTrack: chrome.progressTrack,
    barContainerStyle: getBarContainerStyle(colors.ivoryColor, chrome, insets),
  };
}
