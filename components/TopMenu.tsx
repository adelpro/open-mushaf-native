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
  const { textColor } = useColors();
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
              ? 'rgba(255, 255, 255, 0.2)'
              : 'rgba(0, 0, 0, 0.1)',
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
          <SimpleLineIcons name="size-fullscreen" size={25} color={textColor} />
        ) : (
          <MaterialIcons name="fullscreen-exit" size={25} color={textColor} />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.topMenuButton}
        onPress={() => {
          setShowTopMenuState(false);
          router.push('/search');
        }}
      >
        <Ionicons name="search" size={25} color={textColor} />
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
