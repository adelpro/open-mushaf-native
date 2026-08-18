/**
 * Surah name and numbered badge shown on the right of the TopMenu (RTL).
 *
 * Used by `components/TopMenu/TopMenuBar.tsx`.
 */
import React from 'react';
import { Text, View } from 'react-native';

import IslamicMarkSVG from '@/assets/svgs/islamic-mark.svg';

import { styles } from './styles';
import { TopMenuTheme } from './theme';

interface SurahSectionProps {
  name: string;
  number: number;
  compact: boolean;
  theme: TopMenuTheme;
}

export function SurahSection(props: SurahSectionProps) {
  const { name, number, compact, theme } = props;
  const badgeSize = compact ? 30 : 34;

  return (
    <View style={styles.surahSection}>
      <Text
        style={[
          styles.surahName,
          compact && styles.surahNameCompact,
          { color: theme.primaryText },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        accessibilityLabel={`السورة الحالية: ${name}`}
        accessibilityRole="header"
      >
        {name}
      </Text>
      <View style={styles.surahBadge}>
        <IslamicMarkSVG
          width={badgeSize}
          height={badgeSize}
          style={styles.surahBadgeMark}
        />
        <Text
          style={[
            styles.surahNumber,
            compact && styles.surahNumberCompact,
            { color: theme.surahNumberColor },
          ]}
        >
          {number}
        </Text>
      </View>
    </View>
  );
}
