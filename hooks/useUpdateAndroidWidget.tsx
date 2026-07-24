'use no memo';

import React from 'react';
import { Platform } from 'react-native';

import { getDefaultStore } from 'jotai';
import {
  requestWidgetUpdate,
  type WidgetInfo,
  type WidgetRepresentation,
} from 'react-native-android-widget';

import {
  currentSavedPage,
  dailyTrackerGoal,
  firstLaunchDone,
  mushafRiwaya,
  yesterdayPage,
} from '@/jotai/atoms';
import type { Riwaya } from '@/types';
import type { QuranApiText } from '@/types/quran-api';
import {
  isRiwayaBundleCached,
  readRiwayaBundleFromDisk,
} from '@/utils/api/qurani/cache';
import { getTodayHizbsRead } from '@/utils/dailyTracker';
import AndroidWidget from '@/widgets/android';

// `widgetNotFound` fires once per `requestWidgetUpdate` call when the
// widget isn't on the home screen, which would log on every page
// navigation on devices without the widget installed. This module-level
// flag logs only once per app session.
let widgetNotFoundLogged = false;

/**
 * Phase-6 helper: derive `currentSurahNumber` + `currentHizbNumber`
 * for a page from the qurani.ai narration cache on disk. Falls back
 * to `(1, 1)` when the cache is missing or the page is out of range.
 *
 * Mirrors `widgets/widget-task-handler.tsx`'s helper so both paths
 * surface consistent numbers regardless of which side fires first.
 */
async function deriveSurahHizb(
  riwaya: Riwaya | undefined,
  page: number,
): Promise<{ surah: number; hizb: number }> {
  if (!riwaya || page < 1) return { surah: 1, hizb: 1 };
  try {
    if (!(await isRiwayaBundleCached(riwaya))) {
      return { surah: 1, hizb: 1 };
    }
    const raw = await readRiwayaBundleFromDisk(riwaya);
    if (!raw) return { surah: 1, hizb: 1 };
    const flat: QuranApiText[] = JSON.parse(raw);
    const onPage = flat.find((a) => a.page === page);
    if (!onPage) return { surah: 1, hizb: 1 };
    const hizb = Math.ceil(onPage.hizbQuarter / 4);
    return { surah: onPage.surah, hizb };
  } catch {
    return { surah: 1, hizb: 1 };
  }
}

/**
 * Hook to manage updates for an Android home-screen widget.
 *
 * Phase 6 update: currentSurahNumber / currentHizbNumber are now
 * derived from the qurani.ai narration cache (read from
 * `Paths.document/open-mushaf/api/<riwaya>/bundle.json`).
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
      const yesterdayPageAtom = store.get(yesterdayPage);
      const riwaya = store.get(mushafRiwaya) ?? undefined;
      const firstLaunchDoneValue = store.get(firstLaunchDone);

      // Today's hizbs are derived from the page delta
      // (currentSavedPage - yesterdayPage.value). Previously read from
      // `dailyTrackerCompleted.value`, which was never incremented and
      // therefore always reported 0.
      const dailyCompleted = getTodayHizbsRead(
        currentPage,
        yesterdayPageAtom.value,
      );

      // Phase 6: derive surah/hizb from the qurani.ai cache.
      const { surah: currentSurahNumber, hizb: currentHizbNumber } =
        firstLaunchDoneValue
          ? await deriveSurahHizb(riwaya as Riwaya | undefined, currentPage)
          : { surah: 1, hizb: 1 };

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
