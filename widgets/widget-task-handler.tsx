'use no memo';

import { getDefaultStore } from 'jotai';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

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

import AndroidWidget from './android';

const nameToWidget = {
  OpenMushaf: AndroidWidget,
};

/**
 * Task handler for the Android home-screen widget. Reads the user's
 * reading state from the Jotai store (backed by MMKV) and re-renders
 * the widget on lifecycle events.
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

  // Read data from atoms
  const dailyGoal = store.get(dailyTrackerGoal);
  const dailyCompletedData = store.get(dailyTrackerCompleted);
  const currentPage = store.get(currentSavedPage);
  const riwaya = store.get(mushafRiwaya) || 'warsh';

  let dailyCompleted = 0;
  let currentSurahNumber = 1;
  let currentHizbNumber = 1;

  try {
    // Validate Daily Goal Date
    const today = new Date().toDateString();
    dailyCompleted =
      dailyCompletedData.date === today ? dailyCompletedData.value : 0;

    let surahs: Surah[] = [];
    let thumns: Thumn[] = [];

    // Load metadata files based on Riwaya
    if (riwaya === 'hafs') {
      surahs = hafsSurahs as Surah[];
      thumns = hafsThumns;
    } else {
      // Default to Warsh
      surahs = warshSurahs as Surah[];
      thumns = warshThumns;
    }

    // Calculate Reading Position
    if (surahs.length > 0) {
      currentSurahNumber = getSurahNumberByPage(surahs, currentPage);
    }
    if (thumns.length > 0) {
      currentHizbNumber = getJuzPositionByPage(thumns, currentPage).hizbNumber;
    }
  } catch (e) {
    console.error('Error parsing widget data', e);
  }

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
