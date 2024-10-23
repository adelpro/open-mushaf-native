import { Pressable, StyleSheet } from 'react-native';

import Checkbox from 'expo-checkbox';
import { useRecoilState } from 'recoil';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import { flipSound } from '@/recoil/atoms';

export default function SettingsScreen() {
  const [isFlipSoundEnabled, setIsFlipSoundEnabled] = useRecoilState(flipSound);
  const { textColor } = useColors();

  const toggleSwitch = () => {
    setIsFlipSoundEnabled((previousState) => !previousState);
  };

  return (
    <ThemedView style={styles.container}>
      <Pressable
        style={[styles.settingsSection, { borderColor: textColor }]}
        onPress={toggleSwitch}
      >
        <ThemedText type="defaultSemiBold" style={styles.itemText}>
          صوت قلب الصفحة
        </ThemedText>
        <Checkbox
          value={isFlipSoundEnabled}
          style={styles.checkbox}
          onValueChange={toggleSwitch}
        />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  settingsSection: {
    width: '100%',
    maxWidth: 640,
    marginBottom: 20,
    alignSelf: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkbox: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    borderRadius: 5,
  },
  itemText: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 24,
    paddingVertical: 10,
    textAlignVertical: 'center',
  },
});
