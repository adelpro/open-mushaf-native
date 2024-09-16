import { useState } from 'react';
import { SafeAreaView, TouchableOpacity } from 'react-native';

import { useSetRecoilState } from 'recoil';

import ChapterList from '@/components/ChapterList';
import SurahList from '@/components/SurahList';
import TopMenu from '@/components/TopMenu';
import TopTabs from '@/components/TopTabs';
import { topMenuState } from '@/recoil/atoms';
import { Tabs } from '@/types';

export default function ListsScreen() {
  const setShowTopMenu = useSetRecoilState(topMenuState);
  const [activeTab, setActiveTab] = useState<Tabs>('surahs');
  return (
    <SafeAreaView>
      <TopMenu />
      <TopTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <TouchableOpacity onPress={() => setShowTopMenu(true)}>
        {activeTab === 'juzs' && <ChapterList />}
        {activeTab === 'surahs' && <SurahList />}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
