import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  Feather,
  FontAwesome6,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useAtomValue } from 'jotai/react';
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { bottomMenuState } from '@/jotai/atoms';

import { ThemedText } from './ThemedText';

const BottomMenuOverlay = () => {
  const colorScheme = useColorScheme();
  const menuStateValue = useAtomValue<boolean>(bottomMenuState);
  const router = useRouter();
  const pathname = usePathname();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(menuStateValue ? 1 : 0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      transform: [
        {
          translateY: withTiming(menuStateValue ? 0 : 100, {
            duration: 300,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
        },
      ],
    };
  }, [menuStateValue]);

  const tabBarIconColor = Colors[colorScheme ?? 'light'].tint;
  const backgroundColor = Colors[colorScheme ?? 'light'].background;

  const tabs = [
    {
      name: '/(tabs)/lists',
      title: 'الفهرس',
      icon: (focused: boolean) => (
        <MaterialCommunityIcons
          name={focused ? 'view-list' : 'view-list-outline'}
          size={24}
          color={tabBarIconColor}
        />
      ),
    },
    {
      name: '/(tabs)/',
      title: 'المصحف',
      icon: () => (
        <FontAwesome6
          name="book-quran"
          size={24}
          style={{ marginBottom: -3 }}
          color={tabBarIconColor}
        />
      ),
    },
    {
      name: '/(tabs)/(more)',
      title: 'المزيد',
      icon: () => (
        <Feather name="more-horizontal" size={24} color={tabBarIconColor} />
      ),
    },
  ];

  if (!menuStateValue) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, animatedStyle]}>
      <View style={[styles.container, { backgroundColor }]}>
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.name ||
            (tab.name === '/(tabs)/' && pathname === '/');

          return (
            <Pressable
              key={tab.name}
              style={styles.tabButton}
              onPress={() => router.push(tab.name as any)}
            >
              <View style={styles.tabContent}>
                {tab.icon(isActive)}
                <ThemedText style={styles.tabLabel}>{tab.title}</ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    zIndex: 1000,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
});

export default BottomMenuOverlay;
