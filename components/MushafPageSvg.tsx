import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai/react';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { RIWAYA_ARABIC_LABEL } from '@/constants';
import { READING_THEMES } from '@/constants/readingThemes';
import {
  useColors,
  useCurrentPage,
  usePanGestureHandler,
  useQuranMetadata,
  useSvgText,
} from '@/hooks';
import { mushafContrast, readingTheme, topMenuState } from '@/jotai/atoms';
import { Riwaya } from '@/types';
import { parseAyahPolygonsFromSvg } from '@/utils/svgParser';

import { PageOverlaySvg } from './PageOverlaySvg';
import { TafseerPopup } from './TafseerPopup';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Props = {
  riwaya: Riwaya;
  activeSurah?: number;
};

export function MushafPageSvg({ riwaya, activeSurah }: Props) {
  const colorScheme = useColorScheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { currentPage, setCurrentPage } = useCurrentPage();
  const { ivoryColor, tintColor } = useColors();
  const { specsData } = useQuranMetadata();
  const { defaultNumberOfPages = 604 } = specsData ?? {};
  const router = useRouter();
  const { temporary } = useLocalSearchParams<{ temporary?: string }>();

  const mushafContrastValue = useAtomValue(mushafContrast);
  const readingThemeValue = useAtomValue(readingTheme);
  const themeConfig =
    READING_THEMES[readingThemeValue] || READING_THEMES.default;
  const highlightColor = themeConfig.backgroundColor ?? '#f5e6a3';

  // --- Top menu toggle ---
  const setTopMenu = useSetAtom(topMenuState);

  const {
    text: svgText,
    viewBox,
    isLoading: svgIsLoading,
    error: svgError,
  } = useSvgText({ riwaya, page: currentPage, activeSurah });

  // Parse ayah polygons from SVG
  const ayahs = useMemo(
    () => (svgText ? parseAyahPolygonsFromSvg(svgText) : []),
    [svgText],
  );

  const [selectedAya, setSelectedAya] = useState<{
    surah: number;
    ayah: number;
  } | null>(null);
  const [showTafseer, setShowTafseer] = useState(false);

  // Track the available container height for the SVG
  const [containerHeight, setContainerHeight] = useState(windowHeight);

  const handlePolygonPress = useCallback((surah: number, ayah: number) => {
    setSelectedAya({ surah, ayah });
    setShowTafseer(true);
  }, []);

  const handleClosePopup = useCallback(() => {
    setShowTafseer(false);
    setSelectedAya(null);
  }, []);

  // --- Short press toggles the top menu ---
  const handlePagePress = useCallback(() => {
    setTopMenu((prev) => !prev);
  }, [setTopMenu]);

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

  void Platform.OS;

  // Calculate page dimensions based on the available container height
  const aspectRatio = viewBox ? viewBox.height / viewBox.width : 1.4286;
  const widthByWindowCap = Math.min(windowWidth, 640);
  const availableHeight = containerHeight || windowHeight;
  const widthByHeightCap = availableHeight / aspectRatio;
  const pageWidth = Math.min(widthByWindowCap, widthByHeightCap);
  const pageHeight = pageWidth * aspectRatio;

  if (svgError) {
    return (
      <ThemedView
        style={[styles.errorContainer, { backgroundColor: ivoryColor }]}
      >
        <ThemedText type="defaultSemiBold">
          Mushaf SVG unavailable: {svgError}
        </ThemedText>
        <ThemedText style={styles.errorHint}>
          riwaya={riwaya} ({RIWAYA_ARABIC_LABEL[riwaya]}) page={currentPage}
          {' — '}check that `useMushafDownload` finished for this riwaya.
        </ThemedText>
      </ThemedView>
    );
  }

  if (svgIsLoading || !svgText || !viewBox) {
    return (
      <ThemedView
        style={[styles.loadingContainer, { backgroundColor: ivoryColor }]}
      >
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  const bg =
    colorScheme === 'dark'
      ? `rgba(26, 26, 26, ${1 - mushafContrastValue})`
      : themeConfig.backgroundColor || ivoryColor;

  const svgWrapStyle =
    colorScheme === 'dark'
      ? { opacity: mushafContrastValue, filter: 'invert(1)' }
      : themeConfig.imageOpacity < 1
        ? { opacity: themeConfig.imageOpacity }
        : null;

  return (
    <SafeAreaView
      style={[styles.fill, { backgroundColor: bg }]}
      edges={['top']}
    >
      <View
        style={styles.svgContainer}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setContainerHeight(height);
        }}
      >
        <GestureDetector gesture={panGestureHandler}>
          <Animated.View style={{ transform: [{ translateX }] }}>
            <View style={{ width: pageWidth, height: pageHeight }}>
              <View style={svgWrapStyle ?? undefined}>
                <SvgXml
                  xml={svgText}
                  width={pageWidth}
                  height={pageHeight}
                  preserveAspectRatio="xMidYMid meet"
                  pointerEvents="none"
                />
              </View>
              {viewBox && (
                <PageOverlaySvg
                  polygons={ayahs}
                  viewBox={viewBox}
                  width={pageWidth}
                  height={pageHeight}
                  activeAyah={selectedAya}
                  highlightColor={highlightColor}
                  onPress={handlePagePress}
                  onLongPressAyah={handlePolygonPress}
                />
              )}
            </View>
          </Animated.View>
        </GestureDetector>
      </View>

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
  svgContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorHint: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
});
