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

interface SurahNameLabelProps {
  name: string;
  compact: boolean;
  color: string;
}

interface SurahNumberBadgeProps {
  number: number;
  compact: boolean;
  color: string;
}

interface JuzCaptionProps {
  label: string;
  compact: boolean;
  color: string;
}

export function ReadingContextSection(props: ReadingContextSectionProps) {
  const { surahName, surahNumber, juzOrdinalName, compact, theme } = props;
  const juzLabel = `الجزء ${juzOrdinalName}`;

  return (
    <View
      style={styles.contextSection}
      accessibilityLabel={`${surahName}، ${juzLabel}`}
    >
      <View style={styles.contextCluster}>
        <View style={styles.surahRow}>
          <SurahNameLabel
            name={surahName}
            compact={compact}
            color={theme.primaryText}
          />
          <SurahNumberBadge
            number={surahNumber}
            compact={compact}
            color={theme.surahNumberColor}
          />
        </View>
        <JuzCaption
          label={juzLabel}
          compact={compact}
          color={theme.juzLabelColor}
        />
      </View>
    </View>
  );
}

function SurahNameLabel(props: SurahNameLabelProps) {
  const { name, compact, color } = props;

  return (
    <Text
      style={[styles.surahName, compact && styles.surahNameCompact, { color }]}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.72}
      accessibilityLabel={`السورة الحالية: ${name}`}
      accessibilityRole="header"
    >
      {name}
    </Text>
  );
}

function SurahNumberBadge(props: SurahNumberBadgeProps) {
  const { number, compact, color } = props;
  const badgeSize = compact ? 30 : 34;

  return (
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
          { color },
        ]}
      >
        {number}
      </Text>
    </View>
  );
}

function JuzCaption(props: JuzCaptionProps) {
  const { label, compact, color } = props;

  return (
    <Text
      style={[
        styles.juzCaption,
        compact && styles.juzCaptionCompact,
        { color },
      ]}
      numberOfLines={1}
    >
      {label}
    </Text>
  );
}
