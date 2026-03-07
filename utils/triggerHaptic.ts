import { Platform } from 'react-native';

import * as Haptics from 'expo-haptics';

export function triggerSelectionHaptic() {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch((error) => {
    console.error('Haptics error', error);
  });
}

export function triggerImpactHaptic() {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch((error) => {
    console.error('Haptics error', error);
  });
}
