import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
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
import { QIRA_TO_UPSTREAM_PATH, type Qiraa } from '@/constants/svgCdn';
import {
  useColors,
  useCurrentPage,
  usePanGestureHandler,
  useQuranMetadata,
  useSvgText,
} from '@/hooks';
import { mushafContrast, readingTheme } from '@/jotai/atoms';
import { parseAyahPolygonsFromSvg } from '@/utils/svgPolygon';

import { PageOverlaySvg, PageOverlaySvgFallback } from './PageOverlaySvg';
import { TafseerPopup } from './TafseerPopup';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Props = {
  qiraa: Qiraa;
  activeSurah?: number;
};

export function MushafPageSvg({ qiraa, activeSurah }: Props) {
  const colorScheme = useColorScheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { currentPage, setCurrentPage } = useCurrentPage();
  const { tintColor, ivoryColor } = useColors();
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
  } = useSvgText({ qiraa, page: currentPage, activeSurah });

  // ✅ Ayah hit‑regions extracted directly from the SVG’s own `<path class="ayahPolygon">`
  // elements – this avoids the broken JSON data (surahNumber: 0, ayahNumber: 0) that
  // plagued the separate per‑page JSON files.
  const ayahs = useMemo(
    () => (svgText ? parseAyahPolygonsFromSvg(svgText) : []),
    [svgText],
  );

  const [selectedAya, setSelectedAya] = useState<{
    aya: number;
    surah: number;
  } | null>(null);
  const [showTafseer, setShowTafseer] = useState(false);

  const handlePolygonPress = useCallback((surah: number, ayah: number) => {
    setSelectedAya({ surah, aya: ayah });
    setShowTafseer(true);
  }, []);

  // Pan‑to‑next‑page handler
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

  const aspectRatio = viewBox ? viewBox.height / viewBox.width : 1.4286;
  const widthByWindowCap = Math.min(windowWidth, 640);
  const widthByHeightCap = windowHeight / aspectRatio;
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
          qiraa={qiraa} ({QIRA_TO_UPSTREAM_PATH[qiraa]}) page={currentPage}
          {' — '}check that `useMushafDownload` finished for this qiraat.
        </ThemedText>
      </ThemedView>
    );
  }

  // ✅ Only wait for the SVG – polygons are derived synchronously from it.
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
      <GestureDetector gesture={panGestureHandler}>
        <Animated.View style={{ transform: [{ translateX }] }}>
          <View style={svgWrapStyle ?? undefined}>
            <SvgXml
              xml={svgText}
              width={pageWidth}
              height={pageHeight}
              preserveAspectRatio="xMidYMid meet"
              pointerEvents="none"
            />
          </View>
          <PageOverlaySvg
            polygons={ayahs}
            viewBox={viewBox}
            activeAyah={
              selectedAya
                ? { surah: selectedAya.surah, ayah: selectedAya.aya }
                : null
            }
            highlightColor={highlightColor}
            onLongPressAyah={handlePolygonPress}
          />
        </Animated.View>
      </GestureDetector>

      {ayahs.length === 0 ? (
        <PageOverlaySvgFallback message="No polygons for this page" />
      ) : null}

      <TafseerPopup
        show={showTafseer}
        setShow={setShowTafseer}
        aya={selectedAya?.aya ?? 0}
        surah={selectedAya?.surah ?? 0}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, width: '100%', height: '100%' },
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
