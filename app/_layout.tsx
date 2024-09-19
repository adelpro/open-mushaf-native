import { useEffect } from 'react';

import {
  Amiri_400Regular,
  Amiri_400Regular_Italic,
  Amiri_700Bold,
  Amiri_700Bold_Italic,
  useFonts,
} from '@expo-google-fonts/amiri';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import ReactNativeRecoilPersist, {
  ReactNativeRecoilPersistGate,
} from 'react-native-recoil-persist';
import { RecoilRoot } from 'recoil';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
    Amiri_400Regular_Italic,
    Amiri_700Bold_Italic,
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
      <ReactNativeRecoilPersistGate store={ReactNativeRecoilPersist}>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </ReactNativeRecoilPersistGate>
    </RecoilRoot>
  );
}
