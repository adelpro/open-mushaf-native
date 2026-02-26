import { useCallback, useEffect } from 'react';
import { Alert, Platform } from 'react-native';

import * as Linking from 'expo-linking';
import * as StoreReview from 'expo-store-review';
import { useAtom } from 'jotai/react';

import {
  appLaunchCount,
  hasUserRatedApp,
  ratePromptLastShown,
} from '@/jotai/atoms';

const MIN_LAUNCH_COUNT = 5;
const PROMPT_COOLDOWN_DAYS = 30;
const STORE_URLS = {
  android:
    'https://play.google.com/store/apps/details?id=com.adelpro.openmushafnative',
  ios: '', // Add iOS App Store URL when available
};

export function useRateApp() {
  const [launchCount, setLaunchCount] = useAtom(appLaunchCount);
  const [hasRated, setHasRated] = useAtom(hasUserRatedApp);
  const [lastShown, setLastShown] = useAtom(ratePromptLastShown);

  // Increment launch count on app start
  useEffect(() => {
    setLaunchCount((prev) => prev + 1);
  }, [setLaunchCount]);

  const isReadyToShowPrompt = useCallback(() => {
    if (hasRated) return false;
    if (launchCount < MIN_LAUNCH_COUNT) return false;

    const now = Date.now();
    const cooldownMs = PROMPT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    if (lastShown > 0 && now - lastShown < cooldownMs) return false;

    return true;
  }, [hasRated, launchCount, lastShown]);

  const openStoreForRating = useCallback(async () => {
    try {
      // Try native in-app review first
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
        setHasRated(true);
        return true;
      }

      // Fallback to store URL
      const storeUrl =
        Platform.OS === 'ios' ? STORE_URLS.ios : STORE_URLS.android;

      if (storeUrl) {
        const canOpen = await Linking.canOpenURL(storeUrl);
        if (canOpen) {
          await Linking.openURL(storeUrl);
          setHasRated(true);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error opening store for rating:', error);
      return false;
    }
  }, [setHasRated]);

  const showRatePrompt = useCallback(() => {
    if (!isReadyToShowPrompt()) return;

    setLastShown(Date.now());

    Alert.alert(
      'قيّم التطبيق',
      'هل تستمتع باستخدام المصحف المفتوح؟ نقدر تقييمك لنا على المتجر!',
      [
        {
          text: 'لاحقاً',
          style: 'cancel',
        },
        {
          text: 'قيّم الآن',
          onPress: openStoreForRating,
        },
        {
          text: 'لا، شكراً',
          onPress: () => setHasRated(true),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  }, [isReadyToShowPrompt, openStoreForRating, setHasRated, setLastShown]);

  const rateAppManually = useCallback(async () => {
    const success = await openStoreForRating();
    if (!success) {
      Alert.alert(
        'عذراً',
        'تعذر فتح المتجر. يرجى المحاولة مرة أخرى لاحقاً.'
      );
    }
  }, [openStoreForRating]);

  return {
    launchCount,
    hasRated,
    isReadyToShowPrompt: isReadyToShowPrompt(),
    showRatePrompt,
    rateAppManually,
  };
}
