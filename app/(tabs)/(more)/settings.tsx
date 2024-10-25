import { Pressable, StyleSheet } from 'react-native';

import Checkbox from 'expo-checkbox';
import { useRecoilState } from 'recoil';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import { flipSound } from '@/recoil/atoms';

export default function SettingsScreen() {
  const [isFlipSoundEnabled, setIsFlipSoundEnabled] = useRecoilState(flipSound);
  const { textColor, backgroundColor } = useColors();

  const toggleSwitch = () => {
    setIsFlipSoundEnabled((previousState) => !previousState);
  };

  return (
    <ThemedView style={styles.container}>
      <Pressable
        style={[
          styles.settingsSection,
          { borderColor: textColor, backgroundColor },
        ]}
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
    borderRadius: 5,
    borderColor: '#e0e0e0',
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkbox: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    borderRadius: 5,
  },
  itemText: {
    fontSize: 22,
    fontFamily: 'Amiri_700Bold',
    paddingVertical: 10,
    textAlignVertical: 'center',
  },
});
