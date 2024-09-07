import { useEffect } from 'react';

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
// eslint-disable-next-line import/order
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { RecoilRoot } from 'recoil';

import { useColorScheme } from '@/hooks/useColorScheme';

import TopMenu from './(tabs)/TopMenu';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <RecoilRoot>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <TopMenu />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: true }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </RecoilRoot>
  );
}
