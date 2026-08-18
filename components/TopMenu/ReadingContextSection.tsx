/**
 * Grouped Surah name, badge, and Juz caption on the TopMenu left (RTL end).
 *
 * Used by `components/TopMenu/TopMenuBar.tsx`.
 */
import React from 'react';
import { Text, View } from 'react-native';

import IslamicMarkSVG from '@/assets/svgs/islamic-mark.svg';

import { styles } from './styles';
import { TopMenuTheme } from './theme';

interface ReadingContextSectionProps {
  surahName: string;
  surahNumber: number;
  juzOrdinalName: string;
  compact: boolean;
  theme: TopMenuTheme;
}

export function ReadingContextSection(props: ReadingContextSectionProps) {
  const { surahName, surahNumber, juzOrdinalName, compact, theme } = props;
  const badgeSize = compact ? 30 : 34;
  const juzLabel = `الجزء ${juzOrdinalName}`;

  return (
    <View
      style={styles.contextSection}
      accessibilityLabel={`${surahName}، ${juzLabel}`}
    >
      <View style={styles.contextCluster}>
        <View style={styles.surahRow}>
          <Text
            style={[
              styles.surahName,
              compact && styles.surahNameCompact,
              { color: theme.primaryText },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
            accessibilityLabel={`السورة الحالية: ${surahName}`}
            accessibilityRole="header"
          >
            {surahName}
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
              {surahNumber}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.juzCaption,
            compact && styles.juzCaptionCompact,
            { color: theme.juzLabelColor },
          ]}
          numberOfLines={1}
        >
          {juzLabel}
        </Text>
      </View>
    </View>
  );
}
