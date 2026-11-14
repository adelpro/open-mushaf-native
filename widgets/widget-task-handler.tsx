import { Appearance } from 'react-native';

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
import { Surah } from '../types/surah';
import { Thumn } from '../types/thumn';
import {
  getJuzPositionByPage,
  getSurahNumberByPage,
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

  const { dailyCompleted, currentSurahNumber, currentHizbNumber } =
    getWidgetPosition({ dailyCompletedData, currentPage, riwaya });

  const colorScheme = Appearance.getColorScheme() ?? 'light';

  const widgetProps = {
    dailyGoal,
    dailyCompleted,
    currentPage,
    currentSurahNumber,
    currentHizbNumber,
    colorScheme,
  };

  if (
    [
      'WIDGET_ADDED',
      'WIDGET_UPDATE',
      'WIDGET_RESIZED',
      'WIDGET_CLICK',
    ].includes(props.widgetAction)
  ) {
    props.renderWidget(<Widget {...widgetProps} />);
  }
}

function getWidgetPosition(snapshot: {
  dailyCompletedData: { date: string; value: number };
  currentPage: number;
  riwaya: string;
}) {
  const { dailyCompletedData, currentPage, riwaya } = snapshot;
  let dailyCompleted = 0,
    currentSurahNumber = 1,
    currentHizbNumber = 1;
  try {
    dailyCompleted =
      dailyCompletedData.date === new Date().toDateString()
        ? dailyCompletedData.value
        : 0;
    const surahs = (riwaya === 'hafs' ? hafsSurahs : warshSurahs) as Surah[];
    const thumns = riwaya === 'hafs' ? hafsThumns : warshThumns;
    if (surahs.length > 0)
      currentSurahNumber = getSurahNumberByPage(surahs, currentPage);
    if (thumns.length > 0)
      currentHizbNumber = getWidgetHizb(thumns, currentPage);
  } catch (error) {
    console.error('Error parsing widget data', error);
  }
  return { dailyCompleted, currentSurahNumber, currentHizbNumber };
}
function getWidgetHizb(thumns: Thumn[], page: number) {
  const { juzNumber } = getJuzPositionByPage(thumns, page);
  const thumn = thumns.find(
    (t, index) =>
      page >= t.startingPage &&
      (index === thumns.length - 1 || page < thumns[index + 1].startingPage),
  );
  return thumn ? thumn.hizb_number : juzNumber * 2;
}
