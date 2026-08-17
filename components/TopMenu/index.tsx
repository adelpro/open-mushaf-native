/**
 * Mushaf reader TopMenu overlay — Surah/Juz context plus compact actions
 * (daily progress, navigation, search, fullscreen).
 *
 * Shown when `topMenuState` is true (soft tap on the Mushaf page).
 * Used from `app/(tabs)/index.tsx` above `MushafPage`.
 * Re-exported via `components/index.ts` as `TopMenu`.
 */
import React, { useEffect, useState } from 'react';
import { Text, useColorScheme, useWindowDimensions, View } from 'react-native';

import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAtom, useAtomValue } from 'jotai/react';
import * as Progress from 'react-native-progress';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IslamicMarkSVG from '@/assets/svgs/islamic-mark.svg';
import { useColors, useQuranMetadata } from '@/hooks';
import {
  bottomMenuState,
  currentSavedPage,
  dailyTrackerCompleted,
  dailyTrackerGoal,
  topMenuState,
} from '@/jotai/atoms';
import {
  formatSurahDisplayName,
  getJuzPositionByPage,
  getSurahNameByPage,
  getSurahNumberByPage,
} from '@/utils/quranMetadataUtils';

import { ActionButton } from './ActionButton';
import { getJuzOrdinalName } from './juzOrdinals';
import { styles } from './styles';
import { withAlpha } from './withAlpha';

const ICON_SIZE = 20;
const PROGRESS_SIZE = 22;

/**
 * Overlay control panel typically accessible via a soft tap on the Mushaf view.
 * Exposes Surah/Juz context and core actions (progress, navigation, search, fullscreen).
 *
 * @returns The TopMenu bar when `topMenuState` is true; otherwise `null`.
 */
export function TopMenu() {
  const {
    primaryColor,
    primaryLightColor,
    secondaryColor,
    ivoryColor,
    cardColor,
    textColor,
  } = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { surahData, thumnData } = useQuranMetadata();
  const [progressValue, setProgressValue] = useState<number>(0);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 380;

  // Dark mode: prefer primaryLight for primary UI chrome; secondary for accents.

  const [showBottomMenuState, setBottomMenuState] = useAtom(bottomMenuState);
  const [showTopMenuState, setShowTopMenuState] = useAtom(topMenuState);
  const currentSavedPageValue = useAtomValue(currentSavedPage);

  const dailyTrackerGoalValue = useAtomValue(dailyTrackerGoal);
  const dailyTrackerCompletedValue = useAtomValue(dailyTrackerCompleted);

  useEffect(() => {
    const newProgress =
      dailyTrackerGoalValue > 0
        ? Math.min(
            1,
            dailyTrackerCompletedValue.value / 8 / (dailyTrackerGoalValue / 8),
          )
        : 0;
    setProgressValue(newProgress);
  }, [dailyTrackerGoalValue, dailyTrackerCompletedValue.value]);

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
  const currentSurahNumber = getSurahNumberByPage(surahData, currentPage);
  const { juzNumber } = getJuzPositionByPage(thumnData, currentPage);
  const juzOrdinalName = getJuzOrdinalName(juzNumber);
  const surahDisplayName = formatSurahDisplayName(currentSurahName);

  // Theme tokens mapped for light/dark hierarchy (Open Mushaf palette).
  const barBackground = withAlpha(ivoryColor, isDark ? 0.72 : 0.78);
  const accentColor = secondaryColor;
  const iconColor = isDark ? primaryLightColor : primaryColor;
  const primaryText = isDark ? textColor : primaryColor;
  const actionLabelColor = isDark ? textColor : primaryColor;
  const actionIconBackground = withAlpha(cardColor, isDark ? 0.55 : 0.7);
  const dividerColor = accentColor;
  const progressTrack = isDark
    ? 'rgba(98, 164, 155, 0.35)'
    : 'rgba(30, 82, 67, 0.2)';

  if (!showTopMenuState) {
    return null;
  }

  return (
    <Animated.View
      entering={SlideInUp.duration(320)}
      exiting={SlideOutUp.duration(220)}
      style={styles.container}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.topMenu,
          {
            backgroundColor: barBackground,
            borderColor: withAlpha(isDark ? primaryColor : accentColor, 0.35),
            paddingTop: Math.max(insets.top, 8),
            paddingLeft: Math.max(insets.left, 12),
            paddingRight: Math.max(insets.right, 12),
          },
          styles.menuShadow,
        ]}
      >
        {/* RTL: first child sits on the right — Surah name above number */}
        <View style={styles.surahSection}>
          <Text
            style={[
              styles.surahName,
              compact && styles.surahNameCompact,
              { color: primaryText },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
            accessibilityLabel={`السورة الحالية: ${surahDisplayName}`}
            accessibilityRole="header"
          >
            {surahDisplayName}
          </Text>
          <View style={styles.surahBadge}>
            <IslamicMarkSVG
              width={compact ? 30 : 34}
              height={compact ? 30 : 34}
              style={styles.surahBadgeMark}
            />
            <Text
              style={[
                styles.surahNumber,
                compact && styles.surahNumberCompact,
                { color: isDark ? textColor : accentColor },
              ]}
            >
              {currentSurahNumber}
            </Text>
          </View>
        </View>

        <View style={styles.ornamentDivider}>
          <View
            style={[styles.dividerLine, { backgroundColor: dividerColor }]}
          />
          <View
            style={[styles.dividerDiamond, { backgroundColor: dividerColor }]}
          />
          <View
            style={[styles.dividerLine, { backgroundColor: dividerColor }]}
          />
        </View>

        {/* Juz */}
        <View
          style={styles.juzSection}
          accessibilityLabel={`الجزء ${juzNumber}، الجزء ${juzOrdinalName}`}
        >
          <Text style={[styles.juzLabel, { color: accentColor }]}>الجزء</Text>
          <Text
            style={[
              styles.juzNumber,
              compact && styles.juzNumberCompact,
              { color: primaryText },
            ]}
          >
            {juzNumber}
          </Text>
          <Text
            style={[
              styles.juzName,
              compact && styles.juzNameCompact,
              { color: accentColor },
            ]}
            numberOfLines={1}
          >
            {`(الجزء ${juzOrdinalName})`}
          </Text>
        </View>

        <View
          style={[styles.plainDivider, { backgroundColor: dividerColor }]}
        />

        {/* Actions — visual LTR: تكبير، بحث، انتقال، التقدم */}
        <View style={styles.actionsSection}>
          {!isTemporary && (
            <ActionButton
              label="التقدم"
              accessibilityLabel="الورد اليومي"
              accessibilityHint="اضغط لفتح متتبع الورد اليومي"
              onPress={() => {
                setShowTopMenuState(false);
                router.push('/tracker');
              }}
              iconBackground={actionIconBackground}
              labelColor={actionLabelColor}
              compact={compact}
            >
              <View style={styles.progressContainer}>
                <Progress.Circle
                  size={PROGRESS_SIZE}
                  progress={progressValue}
                  color={iconColor}
                  showsText={false}
                  thickness={3}
                  borderWidth={0}
                  unfilledColor={progressTrack}
                />
                {progressValue === 1 && (
                  <View style={styles.checkmarkContainer}>
                    <Feather name="check" size={12} color={iconColor} />
                  </View>
                )}
              </View>
            </ActionButton>
          )}

          <ActionButton
            label="انتقال"
            accessibilityLabel="التنقل"
            accessibilityHint="اضغط لفتح صفحة التنقل بين السور والأجزاء"
            onPress={() => {
              setShowTopMenuState(false);
              router.push('/navigation');
            }}
            iconBackground={actionIconBackground}
            labelColor={actionLabelColor}
            compact={compact}
          >
            <Ionicons
              name="navigate-circle-outline"
              size={ICON_SIZE}
              color={iconColor}
            />
          </ActionButton>

          <ActionButton
            label="بحث"
            accessibilityLabel="البحث"
            accessibilityHint="اضغط لفتح صفحة البحث في القرآن"
            onPress={() => {
              setShowTopMenuState(false);
              router.push('/search');
            }}
            iconBackground={actionIconBackground}
            labelColor={actionLabelColor}
            compact={compact}
          >
            <Ionicons name="search" size={ICON_SIZE} color={iconColor} />
          </ActionButton>

          <ActionButton
            label="تكبير"
            accessibilityLabel={
              showBottomMenuState ? 'وضع ملء الشاشة' : 'إظهار القائمة'
            }
            accessibilityState={{ expanded: showBottomMenuState }}
            onPress={() => {
              setShowTopMenuState(false);
              toggleMenu();
            }}
            iconBackground={actionIconBackground}
            labelColor={actionLabelColor}
            compact={compact}
          >
            {showBottomMenuState ? (
              <MaterialCommunityIcons
                name="fit-to-screen-outline"
                size={ICON_SIZE}
                color={iconColor}
              />
            ) : (
              <MaterialIcons
                name="fullscreen-exit"
                size={ICON_SIZE}
                color={iconColor}
              />
            )}
          </ActionButton>
        </View>
      </View>
    </Animated.View>
  );
}
