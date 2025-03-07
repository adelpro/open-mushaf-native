import { useEffect, useState } from 'react';
import { I18nManager, InteractionManager, Platform } from 'react-native';

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
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { Provider, useAtom } from 'jotai';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ChangeLogModal from '@/components/ChangeLogModal';
import { useColorScheme } from '@/hooks/useColorScheme';
import { currentVersion } from '@/jotai/atoms';
import { getAppVersion } from '@/utils';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Add fade animation to splash screen
SplashScreen.setOptions({ fade: true, duration: 1000 });

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [currentVersionValue, setCurrentVersionValue] = useAtom(currentVersion);
  const [showChangeLogModal, setShowChangeLogModal] = useState(false);
  const [loaded] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
    Amiri_400Regular_Italic,
    Amiri_700Bold_Italic,
  });

  useEffect(() => {
    const appVersion = getAppVersion();
    if (currentVersionValue === undefined) {
      return;
    }
    if (currentVersionValue !== appVersion) {
      setCurrentVersionValue(appVersion);
      setShowChangeLogModal(true);
    }
  }, [currentVersionValue, setCurrentVersionValue]);

  useEffect(() => {
    async function applyRTL() {
      if (!I18nManager.isRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);

        InteractionManager.runAfterInteractions(async () => {
          if (__DEV__) {
            console.info('Reloading app to apply RTL');
          } else {
            if (Platform.OS === 'web') {
              document.documentElement.setAttribute('dir', 'rtl');
              document.documentElement.setAttribute('lang', 'ar');
            } else {
              await Updates.reloadAsync();
            }
          }
        });
      }
    }

    applyRTL();
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
    <Provider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <ChangeLogModal
            visible={showChangeLogModal}
            onClose={() => {
              setShowChangeLogModal(false);
            }}
          />
          <ThemeProvider
            value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
          >
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
              <Stack.Screen
                name="search"
                options={{
                  title: 'بحث',
                }}
              />
              <Stack.Screen
                name="navigation"
                options={{
                  title: 'تنقل',
                }}
              />
            </Stack>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
