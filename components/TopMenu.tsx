import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Progress from 'react-native-progress';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecoilState, useRecoilValue } from 'recoil';

import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import {
  bottomMenuState,
  currentSavedPage,
  dailyHizbCompleted,
  dailyHizbGoal,
  topMenuState,
} from '@/recoil/atoms';
import { getSurahNameByPage } from '@/utils/quranMetadata';
import { getJuzPositionByPage } from '@/utils/quranMetadata';

import { ThemedSafeAreaView } from './ThemedSafeAreaView';

export default function TopMenu() {
  const { tintColor, primaryColor } = useColors();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const [progressValue, setProgressValue] = useState<number>(0);

  const [showBottomMenuState, setBottomMenuState] =
    useRecoilState<boolean>(bottomMenuState);
  const [showTopMenuState, setShowTopMenuState] =
    useRecoilState<boolean>(topMenuState);
  const currentSavedPageValue = useRecoilValue(currentSavedPage);

  const dailyHizbGoalValue = useRecoilValue(dailyHizbGoal);
  const dailyHizbCompletedValue = useRecoilValue(dailyHizbCompleted);

  useEffect(() => {
    const newProgress =
      dailyHizbGoalValue > 0
        ? Math.min(1, dailyHizbCompletedValue / 8 / (dailyHizbGoalValue / 8))
        : 0;
    setProgressValue(newProgress);
  }, [dailyHizbGoalValue, dailyHizbCompletedValue]);

  const toggleMenu = () => {
    setBottomMenuState((state: boolean) => !state);
  };

  const { page } = useLocalSearchParams<{ page: string }>();
  const currentPage = page ? parseInt(page) : currentSavedPageValue;
  const currentSurahName = getSurahNameByPage(currentPage);
  const { thumnInJuz, juzNumber } = getJuzPositionByPage(currentPage);

  return showTopMenuState ? (
    <ThemedSafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView
        style={[
          styles.topMenu,
          isDarkMode
            ? { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
            : { backgroundColor: 'rgba(255, 255, 255, 0.5)' },
        ]}
      >
        {/* Reverted rightSection layout to keep elements grouped */}
        <ThemedView style={[styles.rightSection, { alignItems: 'center' }]}>
          <Text
            style={[
              styles.surahName,
              {
                color: tintColor,
                includeFontPadding: false,
                textAlignVertical: 'center',
              },
            ]}
            accessibilityLabel={`السورة الحالية: ${currentSurahName}`}
            accessibilityRole="header"
          >
            {currentSurahName}
          </Text>
          <Text
            style={[
              styles.separator,
              { color: tintColor, lineHeight: 18, textAlignVertical: 'center' },
            ]}
          >
            -
          </Text>
          <Text
            style={[
              styles.juzPosition,
              {
                color: tintColor,
                includeFontPadding: false,
                textAlignVertical: 'center',
              },
            ]}
          >
            الجزء {juzNumber}
          </Text>
          <Text
            style={[
              styles.separator,
              { color: tintColor, lineHeight: 18, textAlignVertical: 'center' },
            ]}
          >
            -
          </Text>
          <View style={[styles.positionContainer, { alignItems: 'center' }]}>
            <Text
              style={[
                styles.thumnPosition,
                {
                  color: tintColor,
                  includeFontPadding: false,
                  textAlignVertical: 'center',
                  lineHeight: 18,
                },
              ]}
            >
              {thumnInJuz}
              <Text style={[styles.thumnSeparator, { lineHeight: 18 }]}>/</Text>
              <Text style={[styles.thumnTotal, { lineHeight: 18 }]}>16</Text>
            </Text>
          </View>
        </ThemedView>

        <ThemedView style={styles.leftIconsContainer}>
          <TouchableOpacity
            style={styles.icon}
            onPress={() => {
              setShowTopMenuState(false);
              router.push('/tracker');
            }}
          >
            <View style={styles.progressContainer}>
              <Progress.Circle
                size={32}
                progress={progressValue}
                color={primaryColor}
                showsText={false}
                thickness={5}
                borderWidth={0}
                unfilledColor={'rgba(128, 128, 128, 0.4)'}
              />
              {progressValue === 1 && (
                <View style={styles.checkmarkContainer}>
                  <Feather name="check" size={20} color={primaryColor} />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.icon}
            onPress={() => {
              setShowTopMenuState(false);
              router.push('/navigation');
            }}
          >
            <Ionicons
              name="navigate-circle-outline"
              size={40}
              color={tintColor}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.icon}
            onPress={() => {
              setShowTopMenuState(false);
              router.push('/search');
            }}
          >
            <Ionicons name="search" size={40} color={tintColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.icon}
            onPress={() => {
              setShowTopMenuState(false);
              toggleMenu();
            }}
          >
            {showBottomMenuState ? (
              <MaterialCommunityIcons
                name="fit-to-screen-outline"
                size={40}
                color={tintColor}
              />
            ) : (
              <MaterialIcons
                name="fullscreen-exit"
                size={40}
                color={tintColor}
              />
            )}
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedSafeAreaView>
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
    top: 1,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  topMenu: {
    height: 60,
    borderRadius: 5,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    maxWidth: 640,
  },
  icon: {
    padding: 5,
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
  },
  checkmarkContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSection: {
    // Reverted justifyContent and flex properties
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 10, // Keep some margin
  },
  surahName: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 18,
  },
  // Restore separator style
  separator: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  // Restore position container style
  positionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  // Restore thumn related styles
  thumnPosition: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 18,
  },
  thumnSeparator: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 18,
    opacity: 0.6,
  },
  thumnTotal: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 18,
    opacity: 0.7,
  },
  juzPosition: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 18,
  },
});
