import { Stack } from 'expo-router';

export default function MoreLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        headerTitleStyle: {
          fontFamily: 'Amiri_400Regular',
        },
      }}
    >
      <Stack.Screen
        name="about"
        options={{ headerShown: true, title: 'حول' }}
      />
      <Stack.Screen
        name="privacy"
        options={{ headerShown: true, title: 'الخصوصية' }}
      />
      <Stack.Screen
        name="settings"
        options={{ headerShown: true, title: 'الاعدادات' }}
      />
    </Stack>
  );
}
