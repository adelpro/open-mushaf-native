import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRecoilValue } from 'recoil';
import { menuState } from '@/recoil/atoms';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const menuStateValue = useRecoilValue(menuState);

  return (
    <Tabs
      screenOptions={() => ({
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: {
          display: menuStateValue ? 'flex' : 'none',
        },
        headerShown: false,
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'home' : 'home-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'cog' : 'cog-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'alert-circle' : 'alert-circle-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="fullscreen"
        options={{
          title: 'Fullscreen',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'square' : 'square-outline'}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
