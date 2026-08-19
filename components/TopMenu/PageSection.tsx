/**
 * Current page number in a scalloped medallion on the TopMenu right (RTL start).
 *
 * Used by `components/TopMenu/TopMenuBar.tsx`.
 */
import React from 'react';
import { Text, View } from 'react-native';

import PageMarkSVG from '@/assets/svgs/page-mark.svg';

import { styles } from './styles';
import { TopMenuTheme } from './theme';

interface PageSectionProps {
  page: number;
  compact: boolean;
  theme: TopMenuTheme;
}

export function PageSection(props: PageSectionProps) {
  const { page, compact, theme } = props;
  const badgeSize = compact ? 56 : 64;
  const contentInset = Math.round(badgeSize * 0.24);

  return (
    <View
      style={styles.pageSection}
      accessibilityLabel={`الصفحة ${page}`}
      accessibilityRole="text"
    >
      <View style={[styles.pageBadge, { width: badgeSize, height: badgeSize }]}>
        <PageMarkSVG
          width={badgeSize}
          height={badgeSize}
          color={theme.pageBadgeFill}
          fill={theme.pageBadgeFill}
          style={styles.pageBadgeMark}
        />
        <View
          style={[
            styles.pageBadgeContent,
            { paddingHorizontal: contentInset, paddingVertical: contentInset },
          ]}
        >
          <Text
            style={[
              styles.pageLabel,
              compact && styles.pageLabelCompact,
              { color: theme.pageLabelColor },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            الصفحة
          </Text>
          <Text
            style={[
              styles.pageNumber,
              compact && styles.pageNumberCompact,
              { color: theme.pageNumberColor },
            ]}
          >
            {page}
          </Text>
        </View>
      </View>
    </View>
  );
}
