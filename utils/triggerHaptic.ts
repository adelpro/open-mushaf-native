import { Platform } from 'react-native';

import * as Haptics from 'expo-haptics';

/**
 * Triggers a standard selection haptic feedback locally on a device.
 * Exits early if running on the web platform.
 *
 * @returns void
 */
export function triggerSelectionHaptic() {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch((error) => {
    console.error('Haptics error', error);
  });
}

/**
 * Triggers a medium-strength impact haptic feedback.
 * Exits early if running on the web platform.
 *
 * @returns void
 */
export function triggerImpactHaptic() {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch((error) => {
    console.error('Haptics error', error);
  });
}
