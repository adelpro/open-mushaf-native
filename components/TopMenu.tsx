import React from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecoilState } from 'recoil';

import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import { bottomMenuState, topMenuState } from '@/recoil/atoms';
import { isRTL } from '@/utils';

import { ThemedSafeAreaView } from './ThemedSafeAreaView';

export default function TopMenu() {
  const { tintColor } = useColors();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const [showBottomMenuState, setBottomMenuState] =
    useRecoilState<boolean>(bottomMenuState);
  const [showTopMenuState, setShowTopMenuState] =
    useRecoilState<boolean>(topMenuState);

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
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
  },
});
