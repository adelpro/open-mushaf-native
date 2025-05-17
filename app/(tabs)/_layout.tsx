import React from 'react';

import {
  Feather,
  FontAwesome6,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useRecoilValue } from 'recoil';

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
          justifyContent: 'center',
          flexDirection: 'column-reverse',
          height: 60,
          width: '100%',
          maxWidth: 640,
          marginHorizontal: 'auto',
        },
        tabBarLabelStyle: {
          fontFamily: 'Tajawal_400Regular',
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
              size={28}
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
              size={28}
              style={{ marginBottom: -3 }}
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
