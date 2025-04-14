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

  const { page, temporary } = useLocalSearchParams<{
    page: string;
    temporary: string;
  }>();
  const currentPage = page ? parseInt(page) : currentSavedPageValue;
  const isTemporary = temporary === 'true';
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
        <View style={styles.rightSection}>
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
          <View style={styles.secondLineContainer}>
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
            <Text style={[styles.subtleSeparator, { color: tintColor }]}>
              {' '}
              |{' '}
            </Text>
            <View style={styles.positionContainer}>
              <Text
                style={[
                  styles.thumnPosition,
                  {
                    color: tintColor,
                    includeFontPadding: false,
                    textAlignVertical: 'center',
                  },
                ]}
              >
                {thumnInJuz}
                <Text style={styles.thumnSeparator}>/</Text>
                <Text style={styles.thumnTotal}>16</Text>
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
          )}

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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 15,
    flexShrink: 1,
    paddingVertical: 5,
    gap: 10,
  },
  surahName: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 18,
    lineHeight: 22,
  },
  secondLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  juzPosition: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 18,
  },
  subtleSeparator: {
    fontSize: 14,
    opacity: 0.7,
    marginHorizontal: 4,
    lineHeight: 18,
  },
  positionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumnPosition: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 18,
  },
  thumnSeparator: {
    opacity: 0.6,
  },
  thumnTotal: {
    opacity: 0.7,
  },
});
