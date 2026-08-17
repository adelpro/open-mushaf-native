/**
 * TopMenu bar layout: Surah, Juz, dividers, and compact actions.
 *
 * Used only by `components/TopMenu/index.tsx`.
 */
import React from 'react';
import { useWindowDimensions, View } from 'react-native';

import { TopMenuActions } from './Actions';
import { JuzSection } from './JuzSection';
import { OrnamentDivider } from './OrnamentDivider';
import { styles } from './styles';
import { SurahSection } from './SurahSection';
import { useTopMenuTheme } from './theme';
import { useMushafContext } from './useMushafContext';

export function TopMenuBar() {
  const theme = useTopMenuTheme();
  const compact = useWindowDimensions().width < 380;
  const context = useMushafContext();

  return (
    <View style={[styles.topMenu, theme.barContainerStyle, styles.menuShadow]}>
      <SurahSection
        name={context.surahDisplayName}
        number={context.currentSurahNumber}
        compact={compact}
        theme={theme}
      />
      <OrnamentDivider color={theme.dividerColor} />
      <JuzSection
        juzNumber={context.juzNumber}
        ordinalName={context.juzOrdinalName}
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
