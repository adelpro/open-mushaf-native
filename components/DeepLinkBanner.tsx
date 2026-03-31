import { useCallback, useEffect, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { useColors } from '@/hooks/useColors';

const DEEP_LINK_URL = 'openmushaf://mushaf';
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.adelpro.openmushafnative';

type MobilePlatform = 'android' | 'ios' | null;

function detectMobilePlatform(): MobilePlatform {
  if (Platform.OS !== 'web') return null;
  if (typeof navigator === 'undefined') return null;

  const ua = navigator.userAgent.toLowerCase();
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  return null;
}

export default function DeepLinkBanner() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<MobilePlatform>(null);
  const { primaryColor, cardColor, textColor } = useColors();

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const detected = detectMobilePlatform();
    if (!detected) return;

    const dismissed = sessionStorage.getItem('deep-link-banner-dismissed');
    if (dismissed) return;

    setPlatform(detected);
    setVisible(true);
  }, []);

  const handleOpenApp = useCallback(() => {
    window.location.href = DEEP_LINK_URL;

    if (platform === 'android') {
      setTimeout(() => {
        Linking.openURL(PLAY_STORE_URL);
      }, 1500);
    }
  }, [platform]);

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem('deep-link-banner-dismissed', 'true');
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <Animated.View
      entering={SlideInDown}
      exiting={SlideOutDown}
      style={[styles.container, { backgroundColor: cardColor }]}
    >
      <View style={styles.content}>
        <ThemedText style={styles.message}>
          {'تجربة أفضل في التطبيق'}
        </ThemedText>
        {platform === 'ios' && (
          <ThemedText style={styles.subMessage}>
            {'التطبيق قريبًا على App Store'}
          </ThemedText>
        )}
        <View style={styles.actions}>
          {platform === 'android' && (
            <Pressable
              onPress={handleOpenApp}
              style={[styles.button, { backgroundColor: primaryColor }]}
            >
              <ThemedText style={styles.buttonText}>
                {'فتح التطبيق'}
              </ThemedText>
            </Pressable>
          )}
          <Pressable onPress={handleDismiss} style={styles.dismissButton}>
            <ThemedText style={[styles.dismissText, { color: textColor }]}>
              {'لاحقًا'}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Tajawal_500Medium',
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 13,
    fontFamily: 'Tajawal_400Regular',
    textAlign: 'center',
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Tajawal_500Medium',
  },
  dismissButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dismissText: {
    fontSize: 14,
    fontFamily: 'Tajawal_400Regular',
    opacity: 0.7,
  },
});
