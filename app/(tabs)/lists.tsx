import { useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChapterList } from '@/components/ChapterList';
import { SEO } from '@/components/seo';
import { SurahList } from '@/components/SurahList';
import { ThemedView } from '@/components/ThemedView';
import { TopTabs } from '@/components/TopTabs';
import { ListTabs } from '@/types';

export default function ListsScreen() {
  const [activeTab, setActiveTab] = useState<ListTabs>('surahs');
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      style={[
        styles.container,
        { paddingTop: Platform.OS === 'ios' ? insets.top : 0 },
      ]}
    >
      <SEO
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
