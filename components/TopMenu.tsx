import React from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

import { Ionicons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRecoilState } from 'recoil';

import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { bottomMenuState, topMenuState } from '@/recoil/atoms';

export default function TopMenu() {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? 'light'].icon;
  const [showBottomMenuState, setBottomMenuState] =
    useRecoilState<boolean>(bottomMenuState);
  const [showTopMenuState, setShowTopMenuState] =
    useRecoilState<boolean>(topMenuState);

  const toggleMenu = () => {
    setBottomMenuState((state: boolean) => !state);
  };

  return showTopMenuState ? (
    <ThemedView
      style={[
        styles.topMenu,
        {
          backgroundColor:
            colorScheme === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.01)',
        },
      ]}
    >
      <TouchableOpacity
        style={styles.topMenuButton}
        onPress={() => {
          setShowTopMenuState(false);
          toggleMenu();
        }}
      >
        {showBottomMenuState ? (
          <SimpleLineIcons name="size-fullscreen" size={40} color={color} />
        ) : (
          <MaterialIcons name="fullscreen-exit" size={40} color={color} />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.topMenuButton}
        onPress={() => {
          setShowTopMenuState(false);
          router.push('/search');
        }}
      >
        <Ionicons name="search" size={40} color={color} />
      </TouchableOpacity>
    </ThemedView>
  ) : null;
}
const styles = StyleSheet.create({
  topMenu: {
    marginVertical: 10,
    height: 60,
    borderRadius: 5,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 2,
    alignSelf: 'center',
    margin: 'auto',
    maxWidth: 430,
  },
  topMenuButton: {
    marginHorizontal: 10,
    padding: 10,
  },
});
