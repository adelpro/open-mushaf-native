import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Ionicons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRecoilState } from 'recoil';

import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import { bottomMenuState, topMenuState } from '@/recoil/atoms';

export default function TopMenu() {
  const iconColor = '#0a7ea4';
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
          /*  {
            backgroundColor:
              colorScheme === 'dark'
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(0, 0, 0, 0.1)',
          }, */
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
              size={45}
              color={iconColor}
            />
          ) : (
            <MaterialIcons name="fullscreen-exit" size={45} color={iconColor} />
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
              size={45}
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
            <Ionicons name="search" size={45} color={iconColor} />
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
    paddingHorizontal: 30,
    height: 0,
    borderRadius: 5,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    maxWidth: 640,
    backgroundColor: 'transparent',
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
