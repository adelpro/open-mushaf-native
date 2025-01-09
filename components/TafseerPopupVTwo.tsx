import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Tafseer from './Tafseer';

type Props = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  aya: number;
  surah: number;
};

export default function TafseerPopupVTwo({ show, setShow, aya, surah }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const [opacity, setOpacity] = useState(1);

  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);
  const handleSheetChange = useCallback((index: number) => {
    console.log('handleSheetChange', index);
  }, []);
  /*   const handleSnapPress = useCallback((index: number) => {
    sheetRef.current?.snapToIndex(index);
  }, []);
  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
  }, []); */

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheet
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
      >
        <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
          <Tafseer opacity={opacity} aya={aya} surah={surah} />
        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
  },
  contentContainer: {
    backgroundColor: 'white',
  },
});
