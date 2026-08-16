/**
 * Mushaf reader TopMenu overlay — Surah/Juz context plus compact actions
 * (daily progress, navigation, search, fullscreen).
 *
 * Shown when `topMenuState` is true (soft tap on the Mushaf page).
 * Used from `app/(tabs)/index.tsx` above `MushafPage`.
 */
import React, { useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAtom, useAtomValue } from 'jotai/react';
import { removeTashkeel } from 'quran-search-engine';
import * as Progress from 'react-native-progress';
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
  getJuzPositionByPage,
  getSurahNameByPage,
  getSurahNumberByPage,
} from '@/utils/quranMetadataUtils';

const ICON_SIZE = 20;
const PROGRESS_SIZE = 22;

/** Arabic ordinal labels for Juz 1–30 (used as "(الجزء …)"). */
const JUZ_ORDINAL_NAMES = [
  'الأول',
  'الثاني',
  'الثالث',
  'الرابع',
  'الخامس',
  'السادس',
  'السابع',
  'الثامن',
  'التاسع',
  'العاشر',
  'الحادي عشر',
  'الثاني عشر',
  'الثالث عشر',
  'الرابع عشر',
  'الخامس عشر',
  'السادس عشر',
  'السابع عشر',
  'الثامن عشر',
  'التاسع عشر',
  'العشرون',
  'الحادي والعشرون',
  'الثاني والعشرون',
  'الثالث والعشرون',
  'الرابع والعشرون',
  'الخامس والعشرون',
  'السادس والعشرون',
  'السابع والعشرون',
  'الثامن والعشرون',
  'التاسع والعشرون',
  'الثلاثون',
] as const;

function getJuzOrdinalName(juzNumber: number): string {
  return JUZ_ORDINAL_NAMES[juzNumber - 1] ?? String(juzNumber);
}

type ActionButtonProps = {
  label: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityState?: { expanded?: boolean };
  onPress: () => void;
  iconBackground: string;
  labelColor: string;
  children: React.ReactNode;
  compact: boolean;
};

function ActionButton({
  label,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  onPress,
  iconBackground,
  labelColor,
  children,
  compact,
}: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
    >
      <View
        style={[styles.actionIconWrap, { backgroundColor: iconBackground }]}
      >
        {children}
      </View>
      {!compact && (
        <Text
          style={[styles.actionLabel, { color: labelColor }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

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
  const surahDisplayName = `سورة ${removeTashkeel(currentSurahName)}`;

  // Theme tokens mapped for light/dark hierarchy (Open Mushaf palette).
  const barBackground = ivoryColor;
  const accentColor = secondaryColor;
  const iconColor = isDark ? primaryLightColor : primaryColor;
  const primaryText = isDark ? textColor : primaryColor;
  const actionLabelColor = isDark ? textColor : primaryColor;
  const actionIconBackground = cardColor;
  const dividerColor = accentColor;
  const progressTrack = isDark
    ? 'rgba(98, 164, 155, 0.35)'
    : 'rgba(30, 82, 67, 0.2)';

  if (!showTopMenuState) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 8),
          paddingLeft: Math.max(insets.left, 10),
          paddingRight: Math.max(insets.right, 10),
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.topMenu,
          {
            backgroundColor: barBackground,
            borderColor: isDark ? primaryColor : accentColor,
          },
          styles.menuShadow,
        ]}
      >
        {/* RTL: first child sits on the right — Surah */}
        <View
          style={[styles.surahSection, compact && styles.surahSectionCompact]}
        >
          <Text
            style={[
              styles.surahName,
              compact && styles.surahNameCompact,
              { color: primaryText },
            ]}
            numberOfLines={1}
            accessibilityLabel={`السورة الحالية: ${surahDisplayName}`}
            accessibilityRole="header"
          >
            {surahDisplayName}
          </Text>
          <View style={styles.surahBadge}>
            <IslamicMarkSVG
              width={compact ? 34 : 40}
              height={compact ? 34 : 40}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 2,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    maxWidth: 640,
    marginHorizontal: 'auto',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  topMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 640,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 6,
  },
  menuShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
    }),
  },
  surahSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    flexShrink: 1,
    minWidth: 0,
    paddingHorizontal: 2,
  },
  surahSectionCompact: {
    maxWidth: '28%',
  },
  surahName: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 15,
    lineHeight: 22,
    flexShrink: 1,
    textAlign: 'right',
  },
  surahNameCompact: {
    fontSize: 13,
    lineHeight: 18,
  },
  surahBadge: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahBadgeMark: {
    position: 'absolute',
  },
  surahNumber: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 13,
    lineHeight: 16,
    zIndex: 1,
  },
  surahNumberCompact: {
    fontSize: 11,
  },
  ornamentDivider: {
    width: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    paddingVertical: 4,
  },
  dividerLine: {
    width: StyleSheet.hairlineWidth,
    flex: 1,
    opacity: 0.7,
  },
  dividerDiamond: {
    width: 7,
    height: 7,
    marginVertical: 3,
    transform: [{ rotate: '45deg' }],
    opacity: 0.9,
  },
  juzSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    minWidth: 56,
    flexShrink: 0,
  },
  juzLabel: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 11,
    lineHeight: 14,
  },
  juzNumber: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 22,
    lineHeight: 28,
  },
  juzNumberCompact: {
    fontSize: 18,
    lineHeight: 22,
  },
  juzName: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
  juzNameCompact: {
    fontSize: 9,
    lineHeight: 12,
  },
  plainDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: 6,
    opacity: 0.55,
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    flexShrink: 0,
    marginStart: 'auto',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    paddingHorizontal: 2,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  progressContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
