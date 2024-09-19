import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import HTMLView from 'react-native-htmlview';
import { useRecoilState } from 'recoil';

import { Colors } from '@/constants/Colors';
import { popupHeight, tafseerTab } from '@/recoil/atoms';
import { TafseerAya, TafseerTabs } from '@/types';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import surahs from '../assets/quran-metadata/mushaf-elmadina-warsh-azrak/surah.json';
import tafaseer from '../assets/tafaseer';

type Props = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  aya: number;
  surah: number;
};

const tabLabels: Record<TafseerTabs, string> = {
  katheer: 'ابن كثير',
  maany: 'معاني القرآن',
  earab: 'إعراب القرآن',
  baghawy: 'البغوي',
  muyassar: 'الميسر',
  qortoby: 'القرطبي',
  tabary: 'الطبري',
  saady: 'السعدي',
  tanweer: 'التحرير و التنوير',
  waseet: 'الوسيط',
};

export default function TafseerPopup({ show, setShow, aya, surah }: Props) {
  const [popupHeightValue, setPopupHeight] =
    useRecoilState<number>(popupHeight);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedTabValue, setSelectedTab] =
    useRecoilState<TafseerTabs>(tafseerTab);
  const [tafseerData, setTafseerData] = useState<TafseerAya[] | null>(null);
  const [surahName, setSurahName] = useState<string>('');
  const popupRef = useRef<View | null>(null);
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? 'light'].text;
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const backgroundColor = Colors[colorScheme ?? 'light'].background;

  const handleGesture = useCallback(
    (event: PanGestureHandlerGestureEvent) => {
      if (isResizing && popupRef.current) {
        const newHeight =
          Dimensions.get('window').height - event.nativeEvent.translationY;
        setPopupHeight(Math.max(30, newHeight));
      }
    },
    [isResizing, setPopupHeight],
  );

  const renderTafseerContent = (tafseer: TafseerAya[] | null): JSX.Element => {
    const ayaTafseer = tafseer?.find((t) => t.aya === aya && t.sura === surah);
    const tafseerText = ayaTafseer?.text || 'لا يوجد تفسير.';

    return (
      <ThemedView /* style={styles.tafseerContent} */>
        <HTMLView
          value={tafseerText}
          stylesheet={{ p: { color: textColor } }}
        />
      </ThemedView>
    );
  };

  useEffect(() => {
    setSurahName(surahs[surah]?.name ?? '');
  }, [surah]);

  useEffect(() => {
    setTafseerData(tafaseer[selectedTabValue] as TafseerAya[]);
  }, [selectedTabValue]);

  if (!show) return null;

  return (
    <GestureHandlerRootView style={styles.overlay}>
      <Pressable style={styles.background} onPress={() => setShow(false)}>
        <Pressable
          ref={popupRef}
          style={[styles.popup, { height: popupHeightValue, backgroundColor }]}
          onPress={(e) => e.stopPropagation()}
        >
          <PanGestureHandler onGestureEvent={handleGesture}>
            <Pressable
              style={styles.resizer}
              onPressIn={() => setIsResizing(true)}
              onPressOut={() => setIsResizing(false)}
            >
              <ThemedView
                style={[styles.resizerIcon, { backgroundColor: tintColor }]}
              />
            </Pressable>
          </PanGestureHandler>

          <ScrollView contentContainerStyle={styles.scrollView}>
            <ThemedText style={styles.title}>
              {surahName} - الآية {aya}
            </ThemedText>
            <ThemedView style={styles.tabs}>
              {Object.keys(tabLabels).map((key) => {
                const tabKey = key as TafseerTabs;
                return (
                  <Pressable
                    key={tabKey}
                    style={[
                      styles.tabButton,
                      selectedTabValue === tabKey && styles.activeTab,
                    ]}
                    onPress={() => setSelectedTab(tabKey)}
                  >
                    <ThemedText>{tabLabels[tabKey]}</ThemedText>
                  </Pressable>
                );
              })}
            </ThemedView>
            {renderTafseerContent(tafseerData)}
          </ScrollView>
        </Pressable>
      </Pressable>
    </GestureHandlerRootView>
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
  },
  resizer: {
    alignSelf: 'center',
    padding: 10,
  },
  resizerIcon: {
    width: 80,
    height: 3,
    borderRadius: 3,
  },
  scrollView: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2,
    justifyContent: 'flex-start',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tafseerContent: {
    marginTop: 20,
  },
  tafseerText: {},
});
