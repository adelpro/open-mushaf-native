import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
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
  const { ivoryColor, tintColor, primaryColor } = useColors();
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
    errorKind: svgErrorKind,
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
            {svgError ? (
              <ThemedView
                style={[
                  styles.errorContainer,
                  {
                    backgroundColor: ivoryColor,
                    width: pageWidth,
                    height: pageHeight,
                  },
                ]}
              >
                <Feather
                  name={
                    svgErrorKind === 'not-cached-offline'
                      ? 'cloud-off'
                      : 'alert-circle'
                  }
                  size={36}
                  color={primaryColor + 'AA'}
                  style={{ marginBottom: 8 }}
                />
                <ThemedText type="defaultSemiBold">
                  {svgErrorKind === 'not-cached-offline'
                    ? 'هذه الصفحة غير محمّلة للقراءة دون اتصال'
                    : 'تعذّر تحميل الصفحة'}
                </ThemedText>
                <ThemedText style={styles.errorHint}>
                  {svgErrorKind === 'not-cached-offline'
                    ? 'افتح التنزيلات لتحميل محتوى هذه الرواية على جهازك.'
                    : svgError}
                </ThemedText>
                <ThemedText style={styles.errorHint}>
                  الرواية: {RIWAYA_ARABIC_LABEL[riwaya]} · الصفحة: {currentPage}
                </ThemedText>
                {svgErrorKind === 'not-cached-offline' && (
                  <Pressable
                    onPress={() => router.push('/downloads')}
                    style={({ pressed }) => [
                      styles.errorCta,
                      {
                        backgroundColor: primaryColor + '15',
                        borderColor: primaryColor + '55',
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="افتح صفحة التنزيلات"
                  >
                    <Feather name="download" size={16} color={primaryColor} />
                    <ThemedText
                      style={[styles.errorCtaLabel, { color: primaryColor }]}
                    >
                      افتح التنزيلات
                    </ThemedText>
                  </Pressable>
                )}
                <ThemedText style={styles.errorHint}>
                  مرّر يمينًا أو يسارًا لتجربة صفحة أخرى.
                </ThemedText>
              </ThemedView>
            ) : svgIsLoading || !svgText || !viewBox ? (
              <ThemedView
                style={[
                  styles.loadingContainer,
                  {
                    backgroundColor: ivoryColor,
                    width: pageWidth,
                    height: pageHeight,
                  },
                ]}
              >
                <ActivityIndicator size="large" color={tintColor} />
              </ThemedView>
            ) : (
              <View style={{ width: pageWidth, height: pageHeight }}>
                <View style={svgWrapStyle ?? undefined}>
                  <SvgXml
                    xml={svgText}
                    width={pageWidth}
                    height={pageHeight}
                    preserveAspectRatio="xMidYMid meet"
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
            )}
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
  errorCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    alignSelf: 'center',
  },
  errorCtaLabel: {
    fontSize: 14,
    fontFamily: 'Tajawal_500Medium',
  },
});
