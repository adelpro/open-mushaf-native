import { useState } from 'react';
import { StyleSheet } from 'react-native';

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
      <ThemedView style={styles.listContainer}>
        {activeTab === 'juzs' && <ChapterList />}
        {activeTab === 'surahs' && <SurahList />}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    paddingTop: 5,
    paddingBottom: 10,
  },
});
