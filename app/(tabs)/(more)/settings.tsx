import { StyleSheet } from 'react-native';

import Checkbox from 'expo-checkbox';
import { useRecoilState } from 'recoil';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { flipSound } from '@/recoil/atoms';

export default function SettingsScreen() {
  const [isFlipSoundEnabled, setIsFlipSoundEnabled] = useRecoilState(flipSound);

  const toggleSwitch = () => {
    setIsFlipSoundEnabled((previousState) => !previousState);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.mainContent}>
        <ThemedView style={styles.listItem}>
          <Checkbox
            value={isFlipSoundEnabled}
            onValueChange={toggleSwitch}
            style={styles.checkbox}
          />
          <ThemedText style={styles.listItemText}>صوت قلب الصفحة</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: 10,
  },
  mainContent: {
    width: '100%',
    paddingHorizontal: 22,
    paddingLeft: 16,
    marginBottom: 20,
    alignSelf: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  listItemText: {
    fontSize: 16,
    marginRight: 10,
  },
  checkbox: {
    marginRight: 10,
  },
});
