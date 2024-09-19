import AsyncStorage from '@react-native-async-storage/async-storage';
import { atom, AtomEffect } from 'recoil';
import { recoilPersist } from 'recoil-persist';

import { TafseerTabs } from '@/types';

// TODO: use recoil-persist
const { persistAtom } = recoilPersist({
  key: 'open-mushaf', // Key for storage
  storage: AsyncStorage,
});

export const bottomMenuState = atom<boolean>({
  key: 'BottomMenuState',
  default: true,
  effects: [persistAtom],
});

export const popupHeight = atom<number>({
  key: 'PopupHeight',
  default: 320,
  effects: [persistAtom],
});

export const tafseerTab = atom<TafseerTabs>({
  key: 'TafseerTab',
  default: 'katheer',
  effects: [persistAtom],
});

const timerEffect: (duration_ms: number) => AtomEffect<any> =
  (duration_ms: number) =>
  ({ setSelf, onSet }) => {
    let timerId: NodeJS.Timeout;
    const setTimer = () => {
      setTimeout(() => {
        setSelf(false);
      }, duration_ms);
    };

    onSet(() => {
      setTimer();
    });

    return () => {
      clearTimeout(timerId);
    };
  };

export const topMenuState = atom<boolean>({
  key: 'TopMenuState',
  default: false,
  effects: [
    timerEffect(
      parseInt(process.env.EXPO_PUBLIC_TOP_MENU_HIDE_DURATION_MS || '5000', 10),
    ),
  ],
});
