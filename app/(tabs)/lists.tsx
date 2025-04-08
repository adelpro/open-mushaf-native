import { useState } from 'react';
import { ScrollView } from 'react-native';

import ChapterList from '@/components/ChapterList';
import SEO from '@/components/seo';
import SurahList from '@/components/SurahList';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import TopTabs from '@/components/TopTabs';
import { ListTabs } from '@/types';

export default function ListsScreen() {
  const [activeTab, setActiveTab] = useState<ListTabs>('surahs');
  return (
    <ThemedSafeAreaView style={{ flex: 1, marginTop: 30 }}>
      <SEO
        title="القوائم"
        description="قائمة السور والأجزاء - المصحف المفتوح"
      />
      <TopTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ScrollView>
        {activeTab === 'juzs' && <ChapterList />}
        {activeTab === 'surahs' && <SurahList />}
      </ScrollView>
    </ThemedSafeAreaView>
  );
}
