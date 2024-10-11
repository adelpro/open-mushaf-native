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
        style={styles.icon}
        onPress={() => {
          setShowTopMenuState(false);
          toggleMenu();
        }}
      >
        {showBottomMenuState ? (
          <SimpleLineIcons name="size-fullscreen" size={30} color={textColor} />
        ) : (
          <MaterialIcons name="fullscreen-exit" size={30} color={textColor} />
        )}
      </TouchableOpacity>
      <ThemedView style={styles.leftIconsContainer}>
        <TouchableOpacity
          style={styles.icon}
          onPress={() => {
            setShowTopMenuState(false);
            router.push('/search');
          }}
        >
          <Ionicons name="search" size={30} color={textColor} />
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
            size={30}
            color={textColor}
          />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  ) : null;
}
const styles = StyleSheet.create({
  topMenu: {
    marginVertical: 10,
    paddingHorizontal: 10,
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
