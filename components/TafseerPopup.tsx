import React, {
  memo,
  Suspense,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
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

import Tafseer from './Tafseer';
import { ThemedView } from './ThemedView';
type Props = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  aya: number;
  surah: number;
};

const TafseerPopup = memo(function TafseerPopup({
  show,
  setShow,
  aya,
  surah,
}: Props) {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const backgroundColor = Colors[colorScheme ?? 'light'].background;
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
          <Tafseer aya={aya} surah={surah} opacity={opacity} />
        </Suspense>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

export default TafseerPopup;

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
