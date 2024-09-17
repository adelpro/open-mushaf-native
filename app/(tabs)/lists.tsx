import { useState } from 'react';
import { Pressable, SafeAreaView } from 'react-native';

import { useSetRecoilState } from 'recoil';

import ChapterList from '@/components/ChapterList';
import SurahList from '@/components/SurahList';
import TopMenu from '@/components/TopMenu';
import TopTabs from '@/components/TopTabs';
import { topMenuState } from '@/recoil/atoms';
import { ListTabs } from '@/types';

export default function ListsScreen() {
  const setShowTopMenu = useSetRecoilState(topMenuState);
  const [activeTab, setActiveTab] = useState<ListTabs>('surahs');
  return (
    <SafeAreaView>
      <TopMenu />
      <TopTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <Pressable onPress={() => setShowTopMenu(true)}>
        {activeTab === 'juzs' && <ChapterList />}
        {activeTab === 'surahs' && <SurahList />}
      </Pressable>
    </SafeAreaView>
  );
}
