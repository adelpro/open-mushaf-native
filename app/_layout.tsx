import { useEffect } from 'react';
import {
  I18nManager,
  InteractionManager,
  Platform,
  useColorScheme,
} from 'react-native';

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
import ReactNativeRecoilPersist, {
  ReactNativeRecoilPersistGate,
} from 'react-native-recoil-persist';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RecoilRoot } from 'recoil';

import Notification from '@/components/Notification';
import SEO from '@/components/seo';
import { isRTL } from '@/utils';

import { NotificationProvider } from '../components/NotificationProvider';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Add fade animation to splash screen
SplashScreen.setOptions({ fade: true, duration: 1000 });

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
  });

  useEffect(() => {
    async function applyRTL() {
      if (!isRTL) {
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
    <RecoilRoot>
      <NotificationProvider>
        <HelmetProvider>
          <SEO />
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <StatusBar style="auto" />
              <ReactNativeRecoilPersistGate store={ReactNativeRecoilPersist}>
                <ThemeProvider
                  value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
                >
                  <Stack
                    screenOptions={{
                      headerTitleStyle: {
                        fontFamily: 'Tajawal_700Bold',
                      },
                    }}
                  >
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
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
              </ReactNativeRecoilPersistGate>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </HelmetProvider>
      </NotificationProvider>
    </RecoilRoot>
  );
}
