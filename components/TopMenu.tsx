import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View, // Import View
} from 'react-native';

import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Progress from 'react-native-progress';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecoilState, useRecoilValue } from 'recoil';

import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import {
  bottomMenuState,
  dailyHizbProgress,
  dailyHizbTarget,
  topMenuState,
} from '@/recoil/atoms';

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

  // --- Access Recoil State for Progress ---
  const dailyHizbGoal = useRecoilValue(dailyHizbTarget);
  const dailyHizbCompleted = useRecoilValue(dailyHizbProgress);

  // --- Calculate Progress ---
  const dailyProgressDecimal =
    dailyHizbGoal > 0
      ? Math.min(1, dailyHizbCompleted / dailyHizbGoal) // Use decimal (0 to 1)
      : 0;

  const toggleMenu = () => {
    setBottomMenuState((state: boolean) => !state);
  };

  return showTopMenuState ? (
    <ThemedSafeAreaView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      <ThemedView
        style={[
          styles.topMenu,
          isDarkMode
            ? { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
            : { backgroundColor: 'rgba(255, 255, 255, 0.5)' },
        ]}
      >
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
            <MaterialIcons name="fullscreen-exit" size={40} color={tintColor} />
          )}
        </TouchableOpacity>
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
    padding: 10,
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
});
