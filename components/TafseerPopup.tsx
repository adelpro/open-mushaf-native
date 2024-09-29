import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';
import { useRecoilState } from 'recoil';

import { Colors } from '@/constants/Colors';
import { popupHeight } from '@/recoil/atoms';

import Tafseer from './Tafseer';
import { ThemedView } from './ThemedView';

type Props = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  aya: number;
  surah: number;
};

export default function TafseerPopup({ show, setShow, aya, surah }: Props) {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const backgroundColor = Colors[colorScheme ?? 'light'].background;

  const [opacity, setOpacity] = useState(1);
  const [popupHeightValue, setPopupHeight] =
    useRecoilState<number>(popupHeight);
  const [currentPopupHeight, setCurrentPopupHeight] =
    useState<number>(popupHeightValue);
  const popupRef = useRef<View | null>(null);

  const handleGesture = useCallback(
    (event: PanGestureHandlerGestureEvent) => {
      if (popupRef?.current) {
        const windowHeight = Dimensions.get('window').height;
        const translationY = event.nativeEvent.translationY;

        const newHeight = popupHeightValue - translationY;

        if (newHeight > windowHeight * 0.7 || newHeight < windowHeight * 0.3) {
          return;
        }

        setCurrentPopupHeight(newHeight);
      }
    },
    [popupHeightValue],
  );

  const handleGestureStateChange = useCallback(
    (event: PanGestureHandlerStateChangeEvent) => {
      if (event.nativeEvent.state === State.BEGAN) {
        setOpacity(0.8);
      } else if (event.nativeEvent.state === State.CANCELLED) {
        setOpacity(1);
      } else if (event.nativeEvent.state === State.END) {
        setPopupHeight(currentPopupHeight);
        setOpacity(1);
      }
    },
    [currentPopupHeight, setPopupHeight],
  );

  if (!show) return null;

  return (
    <ThemedView style={styles.overlay}>
      <Pressable style={styles.background} onPress={() => setShow(false)}>
        <Pressable
          ref={popupRef}
          style={[
            styles.popup,
            { height: currentPopupHeight, backgroundColor, opacity },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <PanGestureHandler
            onGestureEvent={handleGesture}
            onHandlerStateChange={handleGestureStateChange}
          >
            <Pressable style={styles.resizer}>
              <ThemedView
                style={[styles.resizerIcon, { backgroundColor: tintColor }]}
              />
            </Pressable>
          </PanGestureHandler>

          <Tafseer opacity={opacity} aya={aya} surah={surah} />
        </Pressable>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  background: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  popup: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    height: 'auto',
  },
  resizer: {
    alignSelf: 'center',
    width: '60%',
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  resizerIcon: {
    width: 80,
    height: 3,
    borderRadius: 3,
    alignSelf: 'center',
  },
});
