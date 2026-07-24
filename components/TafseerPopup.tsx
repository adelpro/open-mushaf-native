import React, { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';

import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated';

import { Colors } from '@/constants/Colors';

import { Tafseer } from './Tafseer';
import { ThemedView } from './ThemedView';

/**
 * Shared props connecting the parent overlay coordinates to this popup
 * component.
 *
 * Phase 1 update: callers now pass the qurani.ai gid (canonical
 * internal id), the surah number, and the per-narration layout ayah
 * number (which Tafseer's existing `(sura, aya)` lookup uses to find
 * the tafseer row). We deliberately keep `aya` and `surah` in the
 * `Tafseer` component signature unchanged so the lookup table doesn't
 * need to be migrated in this phase.
 */
type Props = {
  /** Trigger declaring if the popup is visibly snapped open. */
  show: boolean;
  /** Modifier hook for flipping the `show` boolean. */
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  /** qurani.ai gid of the selected ayah (canonical internal id). */
  gid: number;
  /** Focus Surah number (1..114). */
  surah: number;
  /** Per-narration per-surah ayah number — Tafseer looks up by this. */
  layoutAyah: number;
};

/**
 * A bottom sheet drawer mechanism wrapping the `<Tafseer />` content view.
 * Utilizes `gorhom/bottom-sheet` and handles specific animated opacity transitions on resize.
 *
 * @param props - Mapping variables.
 * @returns The bottom-anchored animated drawer.
 */
export function TafseerPopup({ show, setShow, gid, surah, layoutAyah }: Props) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const tintColor = Colors[theme].tint;
  const backgroundColor = Colors[theme].background;

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [opacity, setOpacity] = useState(1);
  const animatedPosition = useSharedValue(0);

  useAnimatedReaction(
    () => animatedPosition.value,
    (currentValue) => {
      const isResizing = currentValue % 1 !== 0;
      runOnJS(setOpacity)(isResizing ? 0.8 : 1);
    },
  );

  const snapPoints = useMemo(() => ['40%', '70%', '90%'], []);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) setShow(false);
    },
    [setShow],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
        onPress={() => bottomSheetRef.current?.close()}
      />
    ),
    [],
  );

  const renderHandle = useCallback(
    () => (
      <ThemedView style={styles.resizer}>
        <ThemedView
          style={[styles.resizerIcon, { backgroundColor: tintColor }]}
        />
      </ThemedView>
    ),
    [tintColor],
  );

  if (!show) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChange}
      backdropComponent={renderBackdrop}
      handleComponent={renderHandle}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor }}
      animatedPosition={animatedPosition}
      activeOffsetY={[-1, 1]}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Suspense
          fallback={<ActivityIndicator size="large" color={tintColor} />}
        >
          <Tafseer gid={gid} aya={layoutAyah} surah={surah} opacity={opacity} />
        </Suspense>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 2,
    paddingBottom: 2,
  },
  resizer: {
    alignSelf: 'center',
    paddingVertical: 10,
  },
  resizerIcon: {
    width: 80,
    height: 3,
    borderRadius: 3,
    alignSelf: 'center',
  },
});
