import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ChapterList, Seo, SurahList, ThemedView, TopTabs } from '@/components';
import { ListTabs } from '@/types';

export default function ListsScreen() {
  const [activeTab, setActiveTab] = useState<ListTabs>('surahs');

  return (
    <ThemedView style={[styles.container]}>
      <Seo
        title="القوائم"
        description="قائمة السور والأجزاء - المصحف المفتوح"
      />
      <TopTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ScrollView>
        {activeTab === 'juzs' && <ChapterList />}
        {activeTab === 'surahs' && <SurahList />}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
