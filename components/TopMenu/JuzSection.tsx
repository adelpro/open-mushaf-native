/**
 * Juz number and Arabic ordinal caption in the TopMenu center.
 *
 * Used by `components/TopMenu/TopMenuBar.tsx`.
 */
import React from 'react';
import { Text, View } from 'react-native';

import { styles } from './styles';
import { TopMenuTheme } from './theme';

interface JuzSectionProps {
  juzNumber: number;
  ordinalName: string;
  compact: boolean;
  theme: TopMenuTheme;
}

export function JuzSection(props: JuzSectionProps) {
  const { juzNumber, ordinalName, compact, theme } = props;

  return (
    <View
      style={styles.juzSection}
      accessibilityLabel={`الجزء ${juzNumber}، الجزء ${ordinalName}`}
    >
      <Text style={[styles.juzLabel, { color: theme.accentColor }]}>الجزء</Text>
      <Text
        style={[
          styles.juzNumber,
          compact && styles.juzNumberCompact,
          { color: theme.primaryText },
        ]}
      >
        {juzNumber}
      </Text>
      <Text
        style={[
          styles.juzName,
          compact && styles.juzNameCompact,
          { color: theme.accentColor },
        ]}
        numberOfLines={1}
      >
        {`(الجزء ${ordinalName})`}
      </Text>
    </View>
  );
}
