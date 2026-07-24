'use no memo';

import { getDefaultStore } from 'jotai';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

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

import AndroidWidget from './android';

const nameToWidget = {
  OpenMushaf: AndroidWidget,
};

/**
 * Phase-6 helper: compute the user's current surah number and
 * hizb number for the saved page, sourced from the qurani.ai
 * narration bundle on disk.
 *
 *   const { surah, hizb } = await deriveSurahHizb(riwaya, currentPage);
 *
 * Returns `{surah: 1, hizb: 1}` (safe defaults) when the cache is
 * missing or the page is out of range. The widget renders with
 * these defaults so it still shows meaningful data even before
 * the user has run the wizard.
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
    // Pick the first ayah on this page; it gives us both surah and
    // hizb in one read.
    const onPage = flat.find((a) => a.page === page);
    if (!onPage) return { surah: 1, hizb: 1 };
    const hizb = Math.ceil(onPage.hizbQuarter / 4);
    return { surah: onPage.surah, hizb };
  } catch {
    return { surah: 1, hizb: 1 };
  }
}

/**
 * Task handler for the Android home-screen widget. Reads the user's
 * reading state from the Jotai store (backed by MMKV) and re-renders
 * the widget on lifecycle events.
 *
 * Phase 6: derives `currentSurahNumber` / `currentHizbNumber` from
 * the qurani.ai narration cache (`Paths.document/open-mushaf/api/
 * <riwaya>/bundle.json`). Falls back to `(1, 1)` when the wizard
 * hasn't run yet or the cache is otherwise missing.
 *
 * `WIDGET_CLICK` is intentionally not handled: the widget root uses
 * the built-in `clickAction="OPEN_APP"`, which the library intercepts
 * before this handler is invoked. Custom click actions (if added
 * later) should branch on `props.clickAction` and only re-render when
 * the state actually changes.
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  // Fall back to the default widget if a future widget name doesn't
  // resolve — the cast widens `string` to the known name union.
  const Widget =
    nameToWidget[widgetInfo.widgetName as 'OpenMushaf'] ?? AndroidWidget;

  const store = getDefaultStore();

  // Read data from atoms.
  const dailyGoal = store.get(dailyTrackerGoal);
  const currentPage = store.get(currentSavedPage);
  const yesterdayPageData = store.get(yesterdayPage);
  const riwaya = store.get(mushafRiwaya) ?? undefined;
  const firstLaunchDoneValue = store.get(firstLaunchDone);

  // Today's hizbs are derived from the page delta
  // (currentSavedPage - yesterdayPage.value). The previous
  // implementation read `dailyTrackerCompleted.value`, which was
  // never incremented and therefore always returned 0 here.
  let dailyCompleted = 0;
  try {
    dailyCompleted = getTodayHizbsRead(currentPage, yesterdayPageData.value);
  } catch (e) {
    console.error('Error computing daily progress', e);
  }

  // Phase 6: derive current surah/hizb from the qurani.ai cache
  // when the wizard has completed; otherwise show safe defaults so
  // the widget can render meaningful data even before the user
  // downloads anything.
  const { surah: currentSurahNumber, hizb: currentHizbNumber } =
    firstLaunchDoneValue
      ? await deriveSurahHizb(riwaya as Riwaya | undefined, currentPage)
      : { surah: 1, hizb: 1 };

  const widgetProps = {
    dailyGoal,
    dailyCompleted,
    currentPage,
    currentSurahNumber,
    currentHizbNumber,
    widgetWidth: widgetInfo.width,
    widgetHeight: widgetInfo.height,
  };

  // Pass both light and dark variants; the system picks the variant
  // that matches the launcher's current UI mode. Toggling dark mode at
  // the system level does not require a re-render here.
  const renderBothSchemes = {
    light: <Widget {...widgetProps} colorScheme="light" />,
    dark: <Widget {...widgetProps} colorScheme="dark" />,
  };

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      props.renderWidget(renderBothSchemes);
      break;

    case 'WIDGET_DELETED':
      // Handle widget deleted (remove widget data if you stored it somewhere)
      break;

    default:
      // WIDGET_CLICK with custom clickAction would land here. We don't
      // re-render on click — clicks are pure user gestures and the
      // system handles `OPEN_APP`/`OPEN_URI` before reaching us.
      break;
  }
}
