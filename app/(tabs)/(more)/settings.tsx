import { I18nManager, StyleSheet, Switch } from 'react-native';

import { useRecoilState } from 'recoil';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { flipSound } from '@/recoil/atoms';

export default function SettingsScreen() {
  const [isFlipSoundEnabled, setIsFlipSoundEnabled] = useRecoilState(flipSound);

  const toggleSwitch = () => {
    setIsFlipSoundEnabled((previousState) => !previousState);

    console.log('RTL Mode: ' + I18nManager.isRTL);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.mainContent}>
        <ThemedView style={styles.listItem}>
          <Switch
            value={isFlipSoundEnabled}
            onValueChange={toggleSwitch}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isFlipSoundEnabled ? '#f4f3f4' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            style={styles.switch}
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
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  mainContent: {
    maxWidth: 600,
    width: '100%',
    paddingHorizontal: 22,
    paddingLeft: 16,
    marginBottom: 20,
    alignSelf: 'center',
  },
  listItem: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  listItemText: {
    fontSize: 16,
    marginRight: 10,
  },

  switch: {
    //transform: [{ scaleX: 1 }],
  },
});
