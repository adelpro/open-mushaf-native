/**
 * TopMenu bar layout: page (right), Surah/Juz context (left), and actions.
 *
 * Used only by `components/TopMenu/index.tsx`.
 */
import React from 'react';
import { useWindowDimensions, View } from 'react-native';

import { TopMenuActions } from './Actions';
import { PageSection } from './PageSection';
import { ReadingContextSection } from './ReadingContextSection';
import { styles } from './styles';
import { useTopMenuTheme } from './theme';
import { useMushafContext } from './useMushafContext';

export function TopMenuBar() {
  const theme = useTopMenuTheme();
  const compact = useWindowDimensions().width < 380;
  const context = useMushafContext();

  return (
    <View style={[styles.topMenu, theme.barContainerStyle, styles.menuShadow]}>
      {/* RTL: first child = right — page number */}
      <PageSection page={context.currentPage} compact={compact} theme={theme} />
      <ReadingContextSection
        surahName={context.surahDisplayName}
        surahNumber={context.currentSurahNumber}
        juzOrdinalName={context.juzOrdinalName}
        compact={compact}
        theme={theme}
      />
      <View
        style={[styles.plainDivider, { backgroundColor: theme.dividerColor }]}
      />
      <TopMenuActions
        isTemporary={context.isTemporary}
        compact={compact}
        theme={theme}
      />
    </View>
  );
}
