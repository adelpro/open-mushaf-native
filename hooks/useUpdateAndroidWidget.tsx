import { getDefaultStore } from 'jotai';
import { useAtomValue } from 'jotai/react';
import { requestWidgetUpdate } from 'react-native-android-widget';

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
import {
  getJuzPositionByPage,
  getSurahNumberByPage,
} from '@/utils/quranMetadataUtils';
import AndroidWidget from '@/widgets/android';

export const useUpdateAndroidWidget = () => {
  const savedPage = useAtomValue(currentSavedPage);
  const riwaya = useAtomValue(mushafRiwaya) || 'warsh';

  const updateAndroidWidget = async () => {
    try {
      const store = getDefaultStore();
      const dailyGoal = store.get(dailyTrackerGoal);
      const currentPage = store.get(currentSavedPage) || savedPage || 1;
      const dailyCompletedAtom = store.get(dailyTrackerCompleted);

      // Validate Daily Completed
      const today = new Date().toDateString();
      const dailyCompleted =
        dailyCompletedAtom.date === today ? dailyCompletedAtom.value : 0;

      // Select surah and thumn metadata based on riwaya
      const surahs = riwaya === 'hafs' ? hafsSurahs : warshSurahs;
      const thumns = riwaya === 'hafs' ? hafsThumns : warshThumns;

      // Calculate current surah
      let currentSurahNumber = 1;
      if (surahs.length > 0) {
        currentSurahNumber = getSurahNumberByPage(surahs, currentPage);
      }

      // Calculate current hizb
      let currentHizbNumber = 1;
      if (thumns.length > 0) {
        const thumn = thumns.find(
          (t, index) =>
            currentPage >= t.startingPage &&
            (index === thumns.length - 1 ||
              currentPage < thumns[index + 1].startingPage),
        );
        if (thumn) {
          currentHizbNumber = thumn.hizb_number;
        } else {
          const { juzNumber } = getJuzPositionByPage(thumns, currentPage);
          currentHizbNumber = juzNumber * 2; // fallback
        }
      }

      // Update Android widget
      await requestWidgetUpdate({
        widgetName: 'OpenMushaf',
        renderWidget: () => (
          <AndroidWidget
            dailyGoal={dailyGoal}
            dailyCompleted={dailyCompleted}
            currentPage={currentPage}
            currentSurahNumber={currentSurahNumber}
            currentHizbNumber={currentHizbNumber}
          />
        ),
        widgetNotFound: () => console.log('Widget not on home screen'),
      });
    } catch (err) {
      console.error('Failed to update widget', err);
    }
  };

  return { updateAndroidWidget };
};
