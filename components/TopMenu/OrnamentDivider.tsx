/**
 * Vertical ornament (line + diamond) between Surah and Juz in the TopMenu.
 *
 * Used by `components/TopMenu/TopMenuBar.tsx`.
 */
import React from 'react';
import { View } from 'react-native';

import { styles } from './styles';

interface OrnamentDividerProps {
  color: string;
}

export function OrnamentDivider(props: OrnamentDividerProps) {
  const { color } = props;

  return (
    <View style={styles.ornamentDivider}>
      <View style={[styles.dividerLine, { backgroundColor: color }]} />
      <View style={[styles.dividerDiamond, { backgroundColor: color }]} />
      <View style={[styles.dividerLine, { backgroundColor: color }]} />
    </View>
  );
}
