import React from 'react';

import { FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useRecoilValue } from 'recoil';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { bottomMenuState } from '@/recoil/atoms';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const menuStateValue = useRecoilValue<boolean>(bottomMenuState);

  return (
    <Tabs
      screenOptions={() => ({
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          display: menuStateValue ? 'flex' : 'none',
          height: 55,
        },
        tabBarLabelStyle: {
          fontFamily: 'Amiri_400Regular',
        },
        tabBarIconStyle: {},
        headerShown: false,
      })}
    >
      <Tabs.Screen
        name="lists"
        options={{
          title: 'الفهرس',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'view-list' : 'view-list-outline'}
              color={color}
              size={28}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'المصحف',
          tabBarIcon: ({ color }) => (
            <FontAwesome6
              name="book-quran"
              style={{ marginBottom: -3 }}
              size={28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'cog' : 'cog-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'حول التطبيق',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'alert-circle' : 'alert-circle-outline'}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
