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
import useQuranMetadata from '@/hooks/useQuranMetadata';
import {
  bottomMenuState,
  currentSavedPage,
  dailyHizbCompleted,
  dailyHizbGoal,
  topMenuState,
} from '@/recoil/atoms';
import { getSurahNameByPage } from '@/utils/quranMetadataUtils';
import { getJuzPositionByPage } from '@/utils/quranMetadataUtils';

import { ThemedSafeAreaView } from './ThemedSafeAreaView';

const ICON_SIZE = 32;
export default function TopMenu() {
  const { tintColor } = useColors();
  const { surahData, thumnData } = useQuranMetadata();
  const insets = useSafeAreaInsets();
  const [progressValue, setProgressValue] = useState<number>(0);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

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
  const currentSurahName = getSurahNameByPage(surahData, currentPage);
  const { thumnInJuz, juzNumber } = getJuzPositionByPage(
    thumnData,
    currentPage,
  );

  return showTopMenuState ? (
    <ThemedSafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView
        style={[
          styles.topMenu,
          {
            backgroundColor: isDarkMode
              ? 'rgba(0, 0, 0, 0.9)'
              : 'rgba(244, 244, 244, 0.9)',
          },
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
              الجزء - {juzNumber}
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
                  size={28}
                  progress={progressValue}
                  color={tintColor}
                  showsText={false}
                  thickness={4}
                  borderWidth={0}
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
          >
            <Ionicons name="search" size={ICON_SIZE} color={tintColor} />
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
    paddingVertical: 5,
  },
  surahName: {
    fontFamily: 'Amiri_700Bold',
    fontSize: 18,
    lineHeight: 20,
  },
  secondLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 5,
  },
  juzPosition: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 16,
    lineHeight: 18,
  },
  positionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderRadius: 5,
    paddingVertical: 2,
    backgroundColor: 'rgba(128, 128, 128, 0.4)',
    height: 24,
  },
  thumnPosition: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 16,
    lineHeight: 18,
    textAlignVertical: 'center',
    paddingTop: 2,
  },
  thumnSeparator: {
    paddingHorizontal: 2,
    opacity: 0.6,
  },
  thumnTotal: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 16,
    lineHeight: 18,
  },
});
