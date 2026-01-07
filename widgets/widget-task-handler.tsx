import React from 'react';

import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { MMKV } from 'react-native-mmkv';

import AndroidWidget from './android';
import hafsSurahs from '../assets/quran-metadata/mushaf-elmadina-hafs-assim/surah.json';
import hafsThumns from '../assets/quran-metadata/mushaf-elmadina-hafs-assim/thumn.json';
import warshSurahs from '../assets/quran-metadata/mushaf-elmadina-warsh-azrak/surah.json';
import warshThumns from '../assets/quran-metadata/mushaf-elmadina-warsh-azrak/thumn.json';
import {
  getJuzPositionByPage,
  getSurahNameByPage,
} from '../utils/quranMetadataUtils';

const nameToWidget = {
  // OpenMushaf will be the **name** with which we will reference our widget.
  OpenMushaf: AndroidWidget,
};

const mmkv = new MMKV();

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const Widget =
    nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];

  // Read data from MMKV
  const dailyGoalStr = mmkv.getString('DailyTrackerGoal');
  const dailyCompletedStr = mmkv.getString('DailyTrackerCompleted');
  const currentSavedPageStr = mmkv.getString('CurrentSavedPage');
  const mushafRiwayaStr = mmkv.getString('MushafRiwaya');

  let dailyGoal = 1;
  let dailyCompleted = 0;
  let currentPage = 1;
  let currentSurahName = '';
  let currentHizbNumber = 1;

  try {
    if (dailyGoalStr) {
      dailyGoal = parseInt(dailyGoalStr, 10);
    }
    if (currentSavedPageStr) {
      currentPage = parseInt(currentSavedPageStr, 10);
    }

    if (dailyCompletedStr) {
      const parsed = JSON.parse(dailyCompletedStr);
      const today = new Date().toDateString();
      if (parsed.date === today) {
        dailyCompleted = parsed.value;
      } else {
        dailyCompleted = 0;
      }
    }

    // Determine Riwaya and load metadata
    let riwaya = 'warsh'; // Default
    if (mushafRiwayaStr) {
      // MMKV might store simple strings without quotes for simple values, or JSON.
      // atomWithStorage usually JSON stringifies everything.
      try {
        const parsed = JSON.parse(mushafRiwayaStr);
        if (parsed) riwaya = parsed;
      } catch {
        riwaya = mushafRiwayaStr;
      }
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
