import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import { FlashList, FlashListRef, ViewToken } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useAtomValue } from 'jotai/react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { READING_THEMES } from '@/constants/readingThemes';
import { useColors, usePageAsset } from '@/hooks';
import { mushafContrast, readingTheme } from '@/jotai/atoms';
import { resolvePrimaryVisiblePage } from '@/utils/verticalReading';

import { PageOverlay } from './PageOverlay';
import { ThemedText } from './ThemedText';

/** Intentional no-op used for deferred callbacks and ignored rejections. */
const noop = () => undefined;

/**
 * Props for the VerticalMushafList component.
 */
interface Props {
  /** The current page (single shared source of truth across reading modes). */
  currentPage: number;
  /** Total number of Mushaf pages to render. */
  totalPages: number;
  /** Whether the reader is in a temporary (non-saved) navigation session. */
  isTemporaryNavigation: boolean;
  /** Background color applied behind the pages (theme / night mode). */
  backgroundColor: string;
  /** Called when the primary visible page changes while scrolling. */
  onVisiblePageChange: (page: number) => void;
}

/**
 * Continuous vertical Mushaf reading mode.
 *
 * Renders the full page range in a virtualized FlashList so only a bounded
 * window of pages is ever mounted or downloading at once. The primary visible
 * page is resolved from `onViewableItemsChanged` and reported through the same
 * page-update path used by the horizontal reader (`currentPage` remains the
 * single source of truth).
 */
export function VerticalMushafList({
  currentPage,
  totalPages,
  isTemporaryNavigation,
  backgroundColor,
  onVisiblePageChange,
}: Props) {
  const listRef = useRef<FlashListRef<number>>(null);
  const visiblePageRef = useRef(currentPage);
  const onVisiblePageChangeRef = useRef<(page: number) => void>(noop);
  const [listHeight, setListHeight] = useState(0);

  useEffect(() => {
    onVisiblePageChangeRef.current = onVisiblePageChange;
  }, [onVisiblePageChange]);

  const pages = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    (info: {
      viewableItems: ViewToken<number>[];
      changed: ViewToken<number>[];
    }) => {
      const page = resolvePrimaryVisiblePage(info.viewableItems);
      if (page === null || page === visiblePageRef.current) return;
      visiblePageRef.current = page;
      onVisiblePageChangeRef.current(page);
    },
  ).current;

  // Follow external currentPage changes (search, bookmarks, jump-to-page,
  // route navigation, or switching into vertical mode). Skipped when the
  // change originated from a user scroll, which already synced currentPage.
  useEffect(() => {
    if (currentPage === visiblePageRef.current) return;
    visiblePageRef.current = currentPage;
    listRef.current
      ?.scrollToIndex({
        index: currentPage - 1,
        animated: false,
      })
      .catch(noop);
  }, [currentPage]);

  const handleListLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && height !== listHeight) {
      setListHeight(height);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={isTemporaryNavigation ? [] : ['top']}
    >
      <View style={styles.listContainer} onLayout={handleListLayout}>
        {listHeight > 0 && (
          <FlashList
            ref={listRef}
            data={pages}
            renderItem={({ item }) => (
              <VerticalPageItem page={item} itemHeight={listHeight} />
            )}
            keyExtractor={(item) => item.toString()}
            initialScrollIndex={currentPage - 1}
            drawDistance={listHeight * 4}
            extraData={listHeight}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

/**
 * A single page rendered inside the vertical list. Downloads its own image
 * asset (virtualized, so only nearby pages are ever loading) and renders the
 * interactive verse overlay on top.
 */
function VerticalPageItem({
  page,
  itemHeight,
}: {
  page: number;
  itemHeight: number;
}) {
  const { asset, isLoading, error } = usePageAsset(page);
  const readingThemeValue = useAtomValue(readingTheme);
  const mushafContrastValue = useAtomValue(mushafContrast);
  const themeConfig =
    READING_THEMES[readingThemeValue] || READING_THEMES.default;
  const colorScheme = useColorScheme();
  const { tintColor } = useColors();
  const [dimensions, setDimensions] = useState({
    customPageWidth: 0,
    customPageHeight: 0,
  });

  const handleImageLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ customPageWidth: width, customPageHeight: height });
  };

  return (
    <View style={[styles.itemContainer, { height: itemHeight }]}>
      {asset?.localUri && !isLoading ? (
        <Image
          style={[
            styles.itemImage,
            colorScheme === 'dark' && {
              opacity: mushafContrastValue,
            },
            colorScheme !== 'dark' &&
              themeConfig.imageOpacity < 1 && {
                opacity: themeConfig.imageOpacity,
              },
          ]}
          source={{ uri: asset.localUri }}
          contentFit="fill"
          onLayout={handleImageLayout}
        />
      ) : !isLoading && error ? (
        <View style={styles.itemLoading}>
          <ThemedText type="defaultSemiBold">{error}</ThemedText>
        </View>
      ) : (
        <View style={styles.itemLoading}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      )}
      <PageOverlay index={page} dimensions={dimensions} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
  },
  listContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
  },
  itemContainer: {
    width: '100%',
    maxWidth: 640,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
