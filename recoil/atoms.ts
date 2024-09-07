import { atom, AtomEffect } from 'recoil';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist();
export const bottomMenuState = atom<boolean>({
  key: 'BottomMenuState',
  default: false,
});
export const Persist = atom<boolean>({
  key: 'BottomMenuState',
  default: false,
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
      parseInt(process.env.EXPO_PUBLIC_TOP_MENU_HIDE_DURATION_MS || '3000', 10),
    ),
  ],
});
