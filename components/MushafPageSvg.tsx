import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtomValue } from 'jotai/react';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { READING_THEMES } from '@/constants/readingThemes';
import {
  useColors,
  useCurrentPage,
  usePanGestureHandler,
  useQuranMetadata,
  useSvgText,
} from '@/hooks';
import { mushafContrast, readingTheme } from '@/jotai/atoms';
import { Riwaya } from '@/types';
import { parseAyahPolygonsFromSvg } from '@/utils/svgParser';

import { PageOverlaySvg } from './PageOverlaySvg';
import { TafseerPopup } from './TafseerPopup';

type Props = { riwaya: Riwaya; activeSurah?: number };

export function MushafPageSvg({ riwaya, activeSurah }: Props) {
  const colorScheme = useColorScheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { currentPage, setCurrentPage } = useCurrentPage();
  const { ivoryColor } = useColors();
  const { specsData } = useQuranMetadata();
  const { defaultNumberOfPages = 604 } = specsData ?? {};
  const router = useRouter();
  const { temporary } = useLocalSearchParams<{ temporary?: string }>();

  const mushafContrastValue = useAtomValue(mushafContrast);
  const readingThemeValue = useAtomValue(readingTheme);
  const themeConfig =
    READING_THEMES[readingThemeValue] || READING_THEMES.default;
  const highlightColor = themeConfig.backgroundColor ?? '#f5e6a3';

  const {
    text: svgText,
    viewBox,
    isLoading: svgIsLoading,
    error: svgError,
  } = useSvgText({ riwaya, page: currentPage, activeSurah });

  // Parse ayah polygons from SVG (metadata + d-string)
  const ayahs = useMemo(
    () => (svgText ? parseAyahPolygonsFromSvg(svgText) : []),
    [svgText],
  );

  const [selectedAya, setSelectedAya] = useState<{
    surah: number;
    ayah: number;
  } | null>(null);
  const [showTafseer, setShowTafseer] = useState(false);

  const handlePolygonPress = useCallback((surah: number, ayah: number) => {
    setSelectedAya({ surah, ayah });
    setShowTafseer(true);
  }, []);

  // NEW: closes popup and clears selection
  const handleClosePopup = useCallback(() => {
    setShowTafseer(false);
    setSelectedAya(null);
  }, []);

  const handlePageChange = useCallback(
    (delta: number) => {
      const next = currentPage + delta;
      if (next < 1 || next > defaultNumberOfPages) return;
      if (next === currentPage) return;
      setCurrentPage(next);
      router.setParams({
        page: next.toString(),
        ...(temporary ? { temporary: temporary.toString() } : {}),
      });
    },
    [currentPage, defaultNumberOfPages, setCurrentPage, router, temporary],
  );
  const { translateX, panGestureHandler } = usePanGestureHandler(
    handlePageChange,
    1.0,
  );

  const aspectRatio = viewBox ? viewBox.height / viewBox.width : 1.4286;
  const widthByWindowCap = Math.min(windowWidth, 640);
  const widthByHeightCap = windowHeight / aspectRatio;
  const pageWidth = Math.min(widthByWindowCap, widthByHeightCap);
  const pageHeight = pageWidth * aspectRatio;

  if (svgError) {
    /* error UI */
  }
  if (svgIsLoading || !svgText || !viewBox) {
    /* loading UI */
  }

  const bg =
    colorScheme === 'dark'
      ? `rgba(26, 26, 26, ${1 - mushafContrastValue})`
      : themeConfig.backgroundColor || ivoryColor;

  return (
    <SafeAreaView
      style={[styles.fill, { backgroundColor: bg }]}
      edges={['top']}
    >
      <GestureDetector gesture={panGestureHandler}>
        <Animated.View style={{ transform: [{ translateX }] }}>
          <View style={{ width: pageWidth, height: pageHeight }}>
            {/* Original SVG – display only */}
            <SvgXml
              xml={svgText}
              width={pageWidth}
              height={pageHeight}
              preserveAspectRatio="xMidYMid meet"
              pointerEvents="none"
            />
            {/* Interactive overlay – same viewBox, same size */}
            {viewBox && (
              <PageOverlaySvg
                polygons={ayahs}
                viewBox={viewBox}
                width={pageWidth}
                height={pageHeight}
                activeAyah={selectedAya}
                highlightColor={highlightColor}
                onLongPressAyah={handlePolygonPress}
              />
            )}
          </View>
        </Animated.View>
      </GestureDetector>
      <TafseerPopup
        show={showTafseer}
        setShow={handleClosePopup}
        aya={selectedAya?.ayah ?? 0}
        surah={selectedAya?.surah ?? 0}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, width: '100%', height: '100%' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorHint: { marginTop: 8, fontSize: 12, opacity: 0.6, textAlign: 'center' },
});
