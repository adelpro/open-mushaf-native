import { Stack } from 'expo-router';

import { RtlHeaderBackButton } from '@/components';

/**
 * Nested stack for the More tab: index (hub), settings, contact, about,
 * privacy, reminders. Uses the RTL-flipped back button in the header.
 */
const MoreLayout = () => {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        headerBackVisible: false,
        headerLeft: (props) => <RtlHeaderBackButton {...props} />,
        headerTitleStyle: {
          fontFamily: 'Tajawal_400Regular',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerShown: false, title: 'المزيد' }}
      />
      <Stack.Screen
        name="privacy"
        options={{ headerShown: true, title: 'الخصوصية' }}
      />
      <Stack.Screen
        name="settings"
        options={{ headerShown: true, title: 'الإعدادات' }}
      />
      <Stack.Screen
        name="contact"
        options={{ headerShown: true, title: 'تواصل معنا' }}
      />
      <Stack.Screen
        name="about"
        options={{ headerShown: true, title: 'حول' }}
      />
      <Stack.Screen
        name="reminders"
        options={{ headerShown: true, title: 'التذكيرات' }}
      />
    </Stack>
  );
};

export default MoreLayout;
