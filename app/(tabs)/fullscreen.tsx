import { StyleSheet, TouchableOpacity } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.content}
        onLongPress={() => alert('Long press on content')}
      >
        <ThemedView>
          <ThemedText type="default">Fullscreen page content</ThemedText>
        </ThemedView>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topMenu: {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    marginVertical: 10,
    height: 60,
    borderRadius: 5,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 2,
  },
  topMenuButton: {
    marginHorizontal: 10,
    padding: 10,
  },
  container: {
    position: 'relative',
    flex: 1,
  },
  content: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
