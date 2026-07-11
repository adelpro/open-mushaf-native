'use no memo';

import React from 'react';
import { Platform } from 'react-native';

import { getDefaultStore } from 'jotai';
import {
  requestWidgetUpdate,
  type WidgetInfo,
  type WidgetRepresentation,
} from 'react-native-android-widget';

import hafsSurahs from '@/assets/quran-metadata/mushaf-elmadina-hafs-assim/surah.json';
import hafsThumns from '@/assets/quran-metadata/mushaf-elmadina-hafs-assim/thumn.json';
import warshSurahs from '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/surah.json';
import warshThumns from '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/thumn.json';
import {
  currentSavedPage,
  dailyTrackerCompleted,
  dailyTrackerGoal,
  mushafRiwaya,
} from '@/jotai/atoms';
import { Surah, Thumn } from '@/types';
import {
  getJuzPositionByPage,
  getSurahNumberByPage,
} from '@/utils/quranMetadataUtils';
import AndroidWidget from '@/widgets/android';

// `widgetNotFound` fires once per `requestWidgetUpdate` call when the
// widget isn't on the home screen, which would log on every page
// navigation on devices without the widget installed. This module-level
// flag logs only once per app session.
let widgetNotFoundLogged = false;

/**
 * Hook to manage updates for an Android home-screen widget.
 * Prepares the current user reading state and issues an update request
 * to the underlying Android environment.
 *
 * Data is always read from the Jotai default store (backed by MMKV),
 * which gives us a synchronous, always-fresh snapshot regardless of
 * which React component calls `updateAndroidWidget()`. We deliberately
 * do not subscribe to atoms inside this hook — callers drive the
 * update timing, and a closure over React state would be stale across
 * calls.
 *
 * Light/dark theme is handled by passing both variants via the
 * `{ light, dark }` WidgetRepresentation. The system picks the right
 * one based on the launcher's UI mode, so toggling dark mode at the
 * system level does not require re-issuing an update from the app.
 *
 * @returns An object containing the `updateAndroidWidget` async function.
 */
export const useUpdateAndroidWidget = () => {
  const updateAndroidWidget = async () => {
    // react-native-android-widget is Android-only; on web/iOS the
    // requestWidgetUpdate() callback would fire widgetNotFound() every
    // call and flood the console.
    if (Platform.OS !== 'android') return;

    try {
      const store = getDefaultStore();
      const dailyGoal = store.get(dailyTrackerGoal);
      const currentPage = store.get(currentSavedPage) || 1;
      const dailyCompletedAtom = store.get(dailyTrackerCompleted);
      const riwaya = store.get(mushafRiwaya) || 'warsh';

      // Validate Daily Completed — reset if the stored date isn't today.
      const today = new Date().toDateString();
      const dailyCompleted =
        dailyCompletedAtom.date === today ? dailyCompletedAtom.value : 0;

      // Select surah and thumn metadata based on riwaya
      const surahs = (riwaya === 'hafs' ? hafsSurahs : warshSurahs) as Surah[];
      const thumns = (riwaya === 'hafs' ? hafsThumns : warshThumns) as Thumn[];

      // Calculate current surah (fall back to 1 if metadata is empty)
      const currentSurahNumber =
        surahs.length > 0 ? getSurahNumberByPage(surahs, currentPage) : 1;

      // Calculate current hizb (fall back to 1 if metadata is empty)
      const currentHizbNumber =
        thumns.length > 0
          ? getJuzPositionByPage(thumns, currentPage).hizbNumber
          : 1;

      const buildWidget = (info: WidgetInfo, scheme: 'light' | 'dark') => (
        <AndroidWidget
          dailyGoal={dailyGoal}
          dailyCompleted={dailyCompleted}
          currentPage={currentPage}
          currentSurahNumber={currentSurahNumber}
          currentHizbNumber={currentHizbNumber}
          widgetWidth={info.width}
          widgetHeight={info.height}
          colorScheme={scheme}
        />
      );

      // Update Android widget — renderWidget receives WidgetInfo so the
      // component can adapt layout to the widget's actual dimensions.
      // We pass both light and dark variants; the system picks the
      // matching one based on the launcher's current UI mode.
      const renderRepresentation = (
        info: WidgetInfo,
      ): WidgetRepresentation => ({
        light: buildWidget(info, 'light'),
        dark: buildWidget(info, 'dark'),
      });

      await requestWidgetUpdate({
        widgetName: 'OpenMushaf',
        renderWidget: renderRepresentation,
        widgetNotFound: () => {
          if (widgetNotFoundLogged) return;
          widgetNotFoundLogged = true;
          console.log(
            'Open Mushaf widget is not on the home screen; further update attempts will be silent.',
          );
        },
      });
    } catch (err) {
      console.error('Failed to update widget', err);
    }
  };

  return { updateAndroidWidget };
};
