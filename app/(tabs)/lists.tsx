import { useState } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

import ChapterList from '@/components/ChapterList';
import SurahList from '@/components/SurahList';
import TopTabs from '@/components/TopTabs';
import { ListTabs } from '@/types';

export default function ListsScreen() {
  const [activeTab, setActiveTab] = useState<ListTabs>('surahs');
  return (
    <SafeAreaView style={{ flex: 1, marginTop: 30 }}>
      <TopTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ScrollView>
        {activeTab === 'juzs' && <ChapterList />}
        {activeTab === 'surahs' && <SurahList />}
      </ScrollView>
    </SafeAreaView>
  );
}
