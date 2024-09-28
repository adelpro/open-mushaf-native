import { useEffect } from 'react';
import { I18nManager } from 'react-native';

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
import * as Updates from 'expo-updates';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReactNativeRecoilPersist, {
  ReactNativeRecoilPersistGate,
} from 'react-native-recoil-persist';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
    async function forceRTL() {
      if (!I18nManager.isRTL) {
        I18nManager.forceRTL(true);
        I18nManager.allowRTL(true);

        if (__DEV__) {
          console.log(
            'In development, please reload the app to see the changes',
          );
        } else {
          // Updates.reloadAsync() only available in production
          await Updates.reloadAsync();
        }
      }
    }

    forceRTL();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
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
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
