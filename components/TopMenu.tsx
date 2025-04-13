import React from 'react';
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
  dailyHizbProgress,
  dailyHizbTarget,
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

  const [showBottomMenuState, setBottomMenuState] =
    useRecoilState<boolean>(bottomMenuState);
  const [showTopMenuState, setShowTopMenuState] =
    useRecoilState<boolean>(topMenuState);
  const currentSavedPageValue = useRecoilValue(currentSavedPage);

  // --- Access Recoil State for Progress ---
  const dailyHizbGoal = useRecoilValue(dailyHizbTarget);
  const dailyHizbCompleted = useRecoilValue(dailyHizbProgress);

  // --- Calculate Progress ---
  const dailyProgressDecimal =
    dailyHizbGoal > 0
      ? Math.min(1, dailyHizbCompleted / 8 / (dailyHizbGoal / 8))
      : 0;

  const toggleMenu = () => {
    setBottomMenuState((state: boolean) => !state);
  };

  const { page } = useLocalSearchParams<{ page: string }>();
  const currentPage = page ? parseInt(page) : currentSavedPageValue;
  const currentSurahName = getSurahNameByPage(currentPage);
  const { thumnInJuz } = getJuzPositionByPage(currentPage);

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
        <ThemedView style={styles.rightSection}>
          <Text style={[styles.surahName, { color: tintColor }]}>
            {currentSurahName}
          </Text>
          <Text style={[styles.separator, { color: tintColor }]}> - </Text>
          <View style={styles.positionContainer}>
            <Text style={[styles.thumnPosition, { color: tintColor }]}>
              {thumnInJuz}/16
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
                progress={dailyProgressDecimal}
                color={primaryColor}
                showsText={false}
                thickness={5}
                borderWidth={0}
                unfilledColor={'rgba(128, 128, 128, 0.4)'}
              />
              {dailyProgressDecimal === 1 && (
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 10,
  },
  surahName: {
    fontFamily: ' Amiri_400Regular',
    fontSize: 18,
  },
  separator: {
    fontSize: 18,
  },
  positionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  thumnPosition: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 18,
    lineHeight: 18,
  },
});
