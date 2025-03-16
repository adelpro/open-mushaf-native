import ReactNativeRecoilPersist from 'react-native-recoil-persist';
import { atom, AtomEffect } from 'recoil';

import { TafseerTabs } from '@/types';

export const bottomMenuState = atom<boolean>({
  key: 'BottomMenuState',
  default: true,
  effects: [ReactNativeRecoilPersist.persistAtom],
});

export const currentSavedPage = atom<number>({
  key: 'CurrentSavedPage',
  default: 1,
  effects: [ReactNativeRecoilPersist.persistAtom],
});

export const currentAppVersion = atom<string | undefined>({
  key: 'CurrentAppVersion',
  default: undefined,
  effects: [ReactNativeRecoilPersist.persistAtom],
});

export const finishedTutorial = atom<boolean>({
  key: 'FinishedTutorial',
  default: undefined,
  effects: [ReactNativeRecoilPersist.persistAtom],
});

export const tafseerTab = atom<TafseerTabs>({
  key: 'TafseerTab',
  default: 'katheer',
  effects: [ReactNativeRecoilPersist.persistAtom],
});

export const flipSound = atom<boolean>({
  key: 'FlipSound',
  default: false,
  effects: [ReactNativeRecoilPersist.persistAtom],
});

export const mushafContrast = atom<number>({
  key: 'MushafContrast',
  default: 0.5,
  effects: [ReactNativeRecoilPersist.persistAtom],
});

/**
 * 0 - warsh
 * 1 - hafs
 * undefined
 */
export const mushafRiwaya = atom<number | undefined>({
  key: 'MushafRiwaya',
  default: undefined,
  effects: [ReactNativeRecoilPersist.persistAtom],
});

/**
 * 0 - disabled
 * 1 - hizb
 * 2 - juz
 */
export const hizbNotification = atom<number>({
  key: 'HizbNotification',
  default: 0,
  effects: [ReactNativeRecoilPersist.persistAtom],
});

// Create a timer effect for Recoil state
const timerEffect: (duration_ms: number) => AtomEffect<any> =
  (duration_ms: number) =>
  ({ setSelf, onSet }) => {
    let timerId: NodeJS.Timeout;
    const setTimer = () => {
      timerId = setTimeout(() => {
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

// Define a top menu state atom with a timer effect
export const topMenuState = atom<boolean>({
  key: 'TopMenuState',
  default: false,
  effects: [
    timerEffect(
      parseInt(process.env.EXPO_PUBLIC_TOP_MENU_HIDE_DURATION_MS || '5000', 10),
    ),
  ],
});
