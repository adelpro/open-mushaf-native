import React from 'react';

import { getDefaultStore } from 'jotai';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import AndroidWidget from './android';
import hafsSurahs from '../assets/quran-metadata/mushaf-elmadina-hafs-assim/surah.json';
import hafsThumns from '../assets/quran-metadata/mushaf-elmadina-hafs-assim/thumn.json';
import warshSurahs from '../assets/quran-metadata/mushaf-elmadina-warsh-azrak/surah.json';
import warshThumns from '../assets/quran-metadata/mushaf-elmadina-warsh-azrak/thumn.json';
import {
  currentSavedPage,
  dailyTrackerCompleted,
  dailyTrackerGoal,
  mushafRiwaya,
} from '../jotai/atoms';
import {
  getJuzPositionByPage,
  getSurahNameByPage,
} from '../utils/quranMetadataUtils';

const nameToWidget = {
  OpenMushaf: AndroidWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const Widget =
    nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];

  const store = getDefaultStore();

  // Read data from Atoms
  const dailyGoal = store.get(dailyTrackerGoal);
  const dailyCompletedData = store.get(dailyTrackerCompleted);
  const currentPage = store.get(currentSavedPage);
  const riwaya = store.get(mushafRiwaya) || 'warsh';

  let dailyCompleted = 0;
  let currentSurahName = '';
  let currentHizbNumber = 1;

  try {
    // Validate Daily Goal Date
    const today = new Date().toDateString();
    if (dailyCompletedData.date === today) {
      dailyCompleted = dailyCompletedData.value;
    } else {
      dailyCompleted = 0;
    }

    let surahs: any[] = [];
    let thumns: any[] = [];

    // Load metadata files based on Riwaya
    if (riwaya === 'hafs') {
      surahs = hafsSurahs;
      thumns = hafsThumns;
    } else {
      // Default to Warsh
      surahs = warshSurahs;
      thumns = warshThumns;
    }

    // Calculate Reading Position
    if (surahs.length > 0) {
      currentSurahName = getSurahNameByPage(surahs, currentPage);
    }
    if (thumns.length > 0) {
      const { juzNumber } = getJuzPositionByPage(thumns, currentPage);
      // Approx mapping if based on Juz, but we want exact Hizb from Thumn data.
      // getJuzPositionByPage returns juzNumber, but we can look up the thumn directly.
      const thumn = thumns.find(
        (t: any, index: number) =>
          currentPage >= t.startingPage &&
          (index === thumns.length - 1 ||
            currentPage < thumns[index + 1].startingPage),
      );
      if (thumn) {
        currentHizbNumber = thumn.hizb_number;
      } else {
        currentHizbNumber = juzNumber * 2; // Fallback
      }
    }
  } catch (e) {
    console.error('Error parsing widget data', e);
  }

  const widgetProps = {
    dailyGoal,
    dailyCompleted,
    currentPage,
    currentSurahName,
    currentHizbNumber,
  };

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      props.renderWidget(<Widget {...widgetProps} />);
      break;

    case 'WIDGET_DELETED':
      // Handle widget deleted (remove widget data if you stored it somewhere)
      break;

    case 'WIDGET_CLICK':
      // For now, just re-render with same props
      if (props.clickAction === 'OPEN_APP') {
        props.renderWidget(<Widget {...widgetProps} />);
      } else {
        props.renderWidget(<Widget {...widgetProps} />);
      }
      break;

    default:
      break;
  }
}
