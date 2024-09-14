import { SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';

import { useSetRecoilState } from 'recoil';

import ChapterCard from '@/components/ChapterCard';
import { ThemedView } from '@/components/ThemedView';
import TopMenu from '@/components/TopMenu';
import { topMenuState } from '@/recoil/atoms';
import { Chapter } from '@/types/chapter';

import chaptersJSON from '../../assets/quran-metadata/mushaf-elmadina-warsh-azrak/chapter.json';

export default function JuzListScreen() {
  const setShowTopMenu = useSetRecoilState(topMenuState);
  return (
    <SafeAreaView>
      <TopMenu />
      <TouchableOpacity onPress={() => setShowTopMenu(true)}>
        <ThemedView style={styles.container}>
          {chaptersJSON.map((chapter: Chapter) => (
            <ChapterCard key={chapter.number} chapter={chapter} />
          ))}
        </ThemedView>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
  },
});
