import React from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

import { Ionicons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRecoilState } from 'recoil';

import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import { bottomMenuState, topMenuState } from '@/recoil/atoms';

export default function TopMenu() {
  const colorScheme = useColorScheme();
  const { iconColor } = useColors();
  const [showBottomMenuState, setBottomMenuState] =
    useRecoilState<boolean>(bottomMenuState);
  const [showTopMenuState, setShowTopMenuState] =
    useRecoilState<boolean>(topMenuState);

  const toggleMenu = () => {
    setBottomMenuState((state: boolean) => !state);
  };

  return showTopMenuState ? (
    <ThemedView style={styles.container}>
      <ThemedView
        style={[
          styles.topMenu,
          {
            backgroundColor:
              colorScheme === 'dark'
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(0, 0, 0, 0.1)',
          },
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
            <SimpleLineIcons
              name="size-fullscreen"
              size={30}
              color={iconColor}
            />
          ) : (
            <MaterialIcons name="fullscreen-exit" size={30} color={iconColor} />
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
              size={30}
              color={iconColor}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.icon}
            onPress={() => {
              setShowTopMenuState(false);
              router.push('/search');
            }}
          >
            <Ionicons name="search" size={30} color={iconColor} />
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
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  topMenu: {
    marginVertical: 10,
    paddingHorizontal: 10,
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
    marginHorizontal: 3,
    padding: 3,
  },
  leftIconsContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
  },
});
