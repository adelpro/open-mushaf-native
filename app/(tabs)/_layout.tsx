import React from 'react';
import { Platform, useColorScheme } from 'react-native';

import {
  Feather,
  FontAwesome6,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useAtomValue } from 'jotai/react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';
import { bottomMenuState } from '@/jotai/atoms';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const menuStateValue = useAtomValue<boolean>(bottomMenuState);
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={() => ({
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          display: menuStateValue ? 'flex' : 'none',
          justifyContent: 'center',
          flexDirection: 'column-reverse',
          height:
            Platform.OS === 'ios' ? 45 + insets.bottom : 65 + insets.bottom,
          paddingBottom: insets.bottom,
          borderWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontFamily: 'Tajawal_400Regular',
          marginTop: 8,
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
              size={24}
              color={color}
              accessible={true}
              accessibilityLabel="فهرس السور والأجزاء"
              accessibilityHint="انتقل إلى صفحة الفهرس لعرض قائمة السور والأجزاء"
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
              size={24}
              color={color}
              accessible={true}
              accessibilityLabel="المصحف"
              accessibilityHint="انتقل إلى صفحة المصحف للقراءة"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(more)"
        options={{
          title: 'المزيد',
          tabBarIcon: ({ color }) => (
            <Feather
              name="more-horizontal"
              size={24}
              color={color}
              accessible={true}
              accessibilityLabel="المزيد"
              accessibilityHint="انتقل إلى صفحة المزيد للإعدادات وخيارات أخرى"
            />
          ),
        }}
      />
    </Tabs>
  );
}
