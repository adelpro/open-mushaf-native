/**
 * Mushaf reader TopMenu overlay — Surah/Juz context plus compact actions
 * (daily progress, navigation, search, fullscreen).
 *
 * Shown when `topMenuState` is true (soft tap on the Mushaf page).
 * Used from `app/(tabs)/index.tsx` above `MushafPage`.
 * Re-exported via `components/index.ts` as `TopMenu`.
 */
import React from 'react';

import { useAtomValue } from 'jotai/react';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';

import { topMenuState } from '@/jotai/atoms';

import { styles } from './styles';
import { TopMenuBar } from './TopMenuBar';

/**
 * Overlay control panel typically accessible via a soft tap on the Mushaf view.
 * Exposes Surah/Juz context and core actions (progress, navigation, search, fullscreen).
 *
 * @returns The TopMenu bar when `topMenuState` is true; otherwise `null`.
 */
export function TopMenu() {
  const visible = useAtomValue(topMenuState);
  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      entering={SlideInUp.duration(320)}
      exiting={SlideOutUp.duration(220)}
      style={styles.container}
      pointerEvents="box-none"
    >
      <TopMenuBar />
    </Animated.View>
  );
}
