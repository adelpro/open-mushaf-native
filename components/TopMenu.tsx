import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAtom, useAtomValue } from 'jotai/react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Circle, Svg } from 'react-native-svg';

import { ThemedView } from '@/components/ThemedView';
import {} from '@/constants';
import { useColors, useQuranMetadata } from '@/hooks';
import {
  bottomMenuState,
  currentSavedPage,
  dailyTrackerGoal,
  topMenuState,
  yesterdayPage,
} from '@/jotai/atoms';
import { getTodayProgressFraction } from '@/utils/dailyTracker';
import {
  getJuzPositionByPage,
  getSurahNameByPage,
} from '@/utils/quranMetadataUtils';

/**
 * Strip Arabic tashkeel (diacritical marks) so the surah name
 * renders cleanly inside the small top-menu bar. Replaces the
 * drop-tashkeel utility from `quran-search-engine` which is being
 * removed in Phase 5.
 */
const TASHKEEL_RANGE = /[ؐ-ًؚ-ٟۖ-ٰۭ]/g;
function removeTashkeel(input: string): string {
  return input.replace(TASHKEEL_RANGE, '');
}

const ICON_SIZE = 32;

type DailyProgressRingProps = {
  size: number;
  thickness: number;
  progress: number;
  color: string;
  unfilledColor: string;
};

/**
 * Tiny circular progress ring for the daily-tracker badge in the top menu.
 * Pure react-native-svg (no Animated wrappers) so React 19 + react-native-web
 * does not see a `collapsable={false}` prop on the DOM `path` element.
 */
function DailyProgressRing({
  size,
  thickness,
  progress,
  color,
  unfilledColor,
}: DailyProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const radius = (size - thickness) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped);
  return (
    <Svg width={size} height={size}>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={unfilledColor}
        strokeWidth={thickness}
        fill="none"
      />
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={color}
        strokeWidth={thickness}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />
    </Svg>
  );
}

/**
 * Overlay control panel typically accessible via a soft tap on the Mushaf view.
 * Exposes core interaction triggers (Search, Bookmarks, and Settings navigators).
 *
 * @returns A structurally mapped interface block or null based on the global `topMenuState`.
 */
export function TopMenu() {
  const { tintColor, backgroundColor } = useColors();
  const { surahData, thumnData } = useQuranMetadata();
  const [progressValue, setProgressValue] = useState<number>(0);
  const insets = useSafeAreaInsets();

  const [showBottomMenuState, setBottomMenuState] = useAtom(bottomMenuState);
  const [showTopMenuState, setShowTopMenuState] = useAtom(topMenuState);
  const currentSavedPageValue = useAtomValue(currentSavedPage);
  const yesterdayPageValue = useAtomValue(yesterdayPage);

  const dailyTrackerGoalValue = useAtomValue(dailyTrackerGoal);

  useEffect(() => {
    const newProgress = getTodayProgressFraction(
      currentSavedPageValue as number,
      yesterdayPageValue.value,
      dailyTrackerGoalValue,
    );
    setProgressValue(newProgress);
  }, [currentSavedPageValue, yesterdayPageValue.value, dailyTrackerGoalValue]);

  const toggleMenu = () => {
    setBottomMenuState((state) => !state);
  };

  const { page, temporary = 'false' } = useLocalSearchParams<{
    page?: string;
    temporary?: string;
  }>();
  const currentPage = page ? parseInt(page) : currentSavedPageValue;
  const isTemporary = temporary === 'true';
  const currentSurahName = getSurahNameByPage(surahData, currentPage);
  const { thumnInJuz, juzNumber } = getJuzPositionByPage(
    thumnData,
    currentPage,
  );

  return showTopMenuState ? (
    <ThemedView style={styles.container}>
      <ThemedView
        style={[
          styles.topMenu,
          {
            backgroundColor,
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <View style={styles.rightSection}>
          <Text
            style={[styles.surahName, { color: tintColor }]}
            accessibilityLabel={`السورة الحالية: ${currentSurahName}`}
            accessibilityRole="header"
          >
            {removeTashkeel(currentSurahName)}
          </Text>
          <View style={styles.secondLineContainer}>
            <Text style={[styles.juzPosition, { color: tintColor }]}>
              الجزء - {juzNumber}
            </Text>
            <View style={styles.positionContainer}>
              <Text style={[styles.thumnPosition, { color: tintColor }]}>
                {thumnInJuz}
              </Text>
              <Text
                style={[
                  styles.thumnSeparator,
                  {
                    color: tintColor,
                    includeFontPadding: false,
                    textAlignVertical: 'center',
                  },
                ]}
              >
                /
              </Text>
              <Text
                style={[
                  styles.thumnTotal,
                  {
                    color: tintColor,
                    includeFontPadding: false,
                    textAlignVertical: 'center',
                  },
                ]}
              >
                16
              </Text>
            </View>
          </View>
        </View>

        <ThemedView style={styles.leftIconsContainer}>
          {!isTemporary && (
            <TouchableOpacity
              style={styles.icon}
              onPress={() => {
                setShowTopMenuState(false);
                router.push('/tracker');
              }}
              accessibilityLabel="الورد اليومي"
              accessibilityHint="اضغط لفتح متتبع الورد اليومي"
              accessibilityRole="button"
            >
              <View style={styles.progressContainer}>
                <DailyProgressRing
                  size={26}
                  thickness={3.5}
                  progress={progressValue}
                  color={tintColor}
                  unfilledColor={'rgba(128, 128, 128, 0.4)'}
                />
                {progressValue === 1 && (
                  <View style={styles.checkmarkContainer}>
                    <Feather name="check" size={16} color={tintColor} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.icon}
            onPress={() => {
              setShowTopMenuState(false);
              router.push('/navigation');
            }}
            accessibilityLabel="التنقل"
            accessibilityHint="اضغط لفتح صفحة التنقل بين السور والأجزاء"
            accessibilityRole="button"
          >
            <Ionicons
              name="navigate-circle-outline"
              size={ICON_SIZE}
              color={tintColor}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.icon}
            onPress={() => {
              setShowTopMenuState(false);
              router.push('/search');
            }}
            accessibilityLabel="البحث"
            accessibilityHint="اضغط لفتح صفحة البحث في القرآن"
            accessibilityRole="button"
          >
            <Ionicons name="search" size={ICON_SIZE} color={tintColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.icon}
            onPress={() => {
              setShowTopMenuState(false);
              toggleMenu();
            }}
            accessibilityRole="button"
            accessibilityLabel={
              showBottomMenuState ? 'وضع ملء الشاشة' : 'إظهار القائمة'
            }
            accessibilityState={{ expanded: showBottomMenuState }}
          >
            {showBottomMenuState ? (
              <MaterialCommunityIcons
                name="fit-to-screen-outline"
                size={ICON_SIZE}
                color={tintColor}
              />
            ) : (
              <MaterialIcons
                name="fullscreen-exit"
                size={ICON_SIZE}
                color={tintColor}
              />
            )}
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    zIndex: 2,
    display: 'flex',
    marginHorizontal: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    maxWidth: 640,
    opacity: 0.8,
  },
  topMenu: {
    height: 'auto',
    //marginTop: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    maxWidth: 640,
  },
  icon: {
    padding: 2,
    margin: 2,
  },
  leftIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
  },
  progressContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    margin: 2,
  },
  checkmarkContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 15,
    flexShrink: 1,
    gap: 10,
  },
  surahName: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 16,
    lineHeight: 20,
  },
  secondLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  juzPosition: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 16,
    lineHeight: 20,
  },
  positionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  thumnPosition: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 16,
    lineHeight: 20,
  },
  thumnSeparator: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 16,
    lineHeight: 20,
  },
  thumnTotal: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 16,
    lineHeight: 20,
  },
});
