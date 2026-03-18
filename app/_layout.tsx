import { useEffect } from 'react';
import { I18nManager, Platform, useColorScheme } from 'react-native';

import {
  Amiri_400Regular,
  Amiri_700Bold,
  useFonts,
} from '@expo-google-fonts/amiri';
import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
} from '@expo-google-fonts/tajawal';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { HelmetProvider } from 'react-helmet-async';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary, Notification, Seo } from '@/components';
import { NotificationProvider } from '@/Context/NotificationProvider';
import { useDailyTrackerReset } from '@/hooks';
import { isRTL } from '@/utils';
import { setupNotificationChannel } from '@/utils/notifications';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Add fade animation to splash screen
SplashScreen.setOptions({ fade: true, duration: 1000 });

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Handle daily tracker reset on date change
  useDailyTrackerReset();

  const [fontLoaded, fontError] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
  });

  useEffect(() => {
    async function applyRTL() {
      if (Platform.OS === 'web') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);
        return;
      }

      if (!isRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);

        if (__DEV__) {
          console.info('Reloading app to apply RTL');
        } else {
          await Updates.reloadAsync();
        }
      }
    }

    applyRTL();
  }, []);

  useEffect(() => {
    if (fontLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontError, fontLoaded]);

  // Initialize notification channel for Android
  useEffect(() => {
    if (Platform.OS !== 'web') {
      (async () => {
        try {
          await setupNotificationChannel();
        } catch (error) {
          console.error('Failed to set up notification channel:', error);
        }
      })();
    }
  }, []);

  if (!fontLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <HelmetProvider>
          <Seo />
          <GestureHandlerRootView
            style={{
              flex: 1,
              backgroundColor:
                colorScheme === 'dark'
                  ? DarkTheme.colors.background
                  : DefaultTheme.colors.background,
            }}
          >
            <SafeAreaProvider>
              <StatusBar style="auto" />
              <ThemeProvider
                value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
              >
                <Stack
                  screenOptions={{
                    headerTitleStyle: { fontFamily: 'Tajawal_700Bold' },
                    contentStyle: {
                      maxWidth: 640,
                      alignSelf: 'center',
                      width: '100%',
                    },
                  }}
                >
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false, title: 'الرئيسية' }}
                  />
                  <Stack.Screen name="+not-found" />
                  <Stack.Screen
                    name="search"
                    options={{
                      title: 'بحث',
                      headerTitleStyle: {
                        fontFamily: 'Tajawal_400Regular',
                      },
                    }}
                  />
                  <Stack.Screen
                    name="navigation"
                    options={{
                      title: 'تنقل',
                    }}
                  />
                  <Stack.Screen
                    name="tutorial"
                    options={{ headerShown: true, title: 'جولة تعليمية' }}
                  />
                  <Stack.Screen
                    name="tracker"
                    options={{ headerShown: true, title: 'الورد اليومي' }}
                  />
                </Stack>
                <Notification />
              </ThemeProvider>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </HelmetProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}
