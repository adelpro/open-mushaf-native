import React, { useCallback, useState } from 'react';
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
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { READING_THEMES } from '@/constants/readingThemes';
import { QIRA_TO_UPSTREAM_PATH, type Qiraa } from '@/constants/svgCdn';
import {
  useColors,
  useCurrentPage,
  usePanGestureHandler,
  useQuranMetadata,
  useSvgPolygons,
  useSvgText,
} from '@/hooks';
import { mushafContrast, readingTheme } from '@/jotai/atoms';

import { PageOverlaySvg, PageOverlaySvgFallback } from './PageOverlaySvg';
import { TafseerPopup } from './TafseerPopup';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

/**
 * SVG-based replacement for `MushafPage` (the PNG renderer).
 *
 * Renders one mushaf page as a vector SVG plus a transparent polygon
 * overlay for ayah hit testing. Hooks in to the same `useCurrentPage`
 * and pan gesture machinery as the original.
 *
 * This component does NOT yet integrate the page-flip sound,
 * hizb/goal notifications, keep-awake, or SEO head. Those are added
 * in a later step; for now the goal is to render Hafs page 1 with
 * polygon hit-testing so we can run the regression from plan step 4.
 */
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

  const { ayahs, isLoading: polygonsAreLoading } = useSvgPolygons({
    qiraa,
    page: currentPage,
  });

  const [selectedAya, setSelectedAya] = useState<{
    aya: number;
    surah: number;
  } | null>(null);
  const [showTafseer, setShowTafseer] = useState(false);

  const handlePolygonPress = useCallback((surah: number, ayah: number) => {
    setSelectedAya({ surah, aya: ayah });
    setShowTafseer(true);
  }, []);

  // Pan-to-next-page handler. Mirrors `handlePageChange` in the
  // original MushafPage minus audio + haptics (added later).
  const handlePageChange = useCallback(
    (delta: number) => {
      const next = currentPage + delta;
      if (next < 1 || next > defaultNumberOfPages) return;
      if (next === currentPage) return;
      setCurrentPage(next);
      // Mirror MushafPage.tsx: keep the URL in sync so the address bar
      // reflects the current page and deep-links work.
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

  // Pan/zoom use the page width as their reference frame.
  void Platform.OS; // mark unused-import tolerated for future web keyboard handler

  // The MushafPage original full-bleeds the image; we do the same for
  // the SVG. Size is constrained by BOTH windowWidth (cap at 640 so
  // very wide windows don't blow up the SVG) AND windowHeight (so the
  // SVG never overflows the viewport vertically). We solve by picking
  // the smaller of the two candidate widths.
  const aspectRatio = viewBox ? viewBox.height / viewBox.width : 1.4286; // matches 345x550 fallback
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

  if (svgIsLoading || polygonsAreLoading || !svgText || !viewBox) {
    return (
      <ThemedView
        style={[styles.loadingContainer, { backgroundColor: ivoryColor }]}
      >
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  // Background color reflects theme + dark mode contrast.
  const bg =
    colorScheme === 'dark'
      ? `rgba(26, 26, 26, ${1 - mushafContrastValue})`
      : themeConfig.backgroundColor || ivoryColor;

  // The upstream SVG paints glyphs with `fill="#231f20"` (near-black) on
  // a transparent background. On the dark theme the page background is
  // also dark, so the mushaf text becomes invisible. We invert the
  // rendered SVG so dark fills become light. The filter is applied to
  // a wrapper <View> (not directly to <SvgXml>) because react-native-svg's
  // web component does not reliably forward CSS `filter` to the underlying
  // <svg> DOM element — wrapping in a plain <View> ensures the filter
  // cascades via React Native Web's standard style pipeline. The polygon
  // overlay is rendered OUTSIDE this wrapper so its fills (transparent /
  // theme-driven) are unaffected.
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
          {/* Wrapper View applies the dark-mode `invert(1)` filter plus
              image opacity. Kept outside the polygon overlay so its
              transparent / theme-driven fills are not affected. */}
          <View style={svgWrapStyle ?? undefined}>
            <SvgXml
              xml={svgText}
              width={pageWidth}
              height={pageHeight}
              preserveAspectRatio="xMidYMid meet"
              // pan gesture comes from a wrapping View; SVG itself does
              // not need to receive touches (overlay handles those).
              pointerEvents="none"
            />
          </View>
          {/* Polygons sit on top of the rendered SVG and capture taps.
              We render them in screen-pixel space (no viewBox transform)
              by using the same width/height as SvgXml above. */}
          <SvgXmlOverlay
            ayahs={ayahs}
            viewBox={viewBox}
            width={pageWidth}
            height={pageHeight}
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

/**
 * Wraps the polygon overlay in a sized <Svg> so its viewBox maps to
 * the visible mushaf rect. Split into its own component to keep the
 * render path stable and re-render-free.
 */
function SvgXmlOverlay(props: {
  ayahs: ReturnType<typeof useSvgPolygons>['ayahs'];
  viewBox: {
    minX: number;
    minY: number;
    width: number;
    height: number;
  };
  width: number;
  height: number;
  activeAyah: { surah: number; ayah: number } | null;
  highlightColor: string;
  onLongPressAyah: (surah: number, ayah: number) => void;
}) {
  return (
    <PageOverlaySvg
      polygons={props.ayahs}
      viewBox={props.viewBox}
      activeAyah={props.activeAyah}
      highlightColor={props.highlightColor}
      onLongPressAyah={props.onLongPressAyah}
    />
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
