import { Pressable, StyleSheet } from 'react-native';

import Slider from '@react-native-community/slider';
import Toggle from 'react-native-toggle-input';
import { useRecoilState } from 'recoil';

import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import { flipSound, mushafContrast } from '@/recoil/atoms';

export default function SettingsScreen() {
  const [isFlipSoundEnabled, setIsFlipSoundEnabled] = useRecoilState(flipSound);

  const { textColor, backgroundColor, primaryColor, primaryLightColor } =
    useColors();
  const [mushafContrastValue, setMushafContrastValue] =
    useRecoilState(mushafContrast);

  const toggleSwitch = () => {
    setIsFlipSoundEnabled((previousState) => !previousState);
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <Pressable
        accessible
        accessibilityRole="button"
        accessibilityLabel="صوت قلب الصفحة"
        accessibilityState={{ selected: isFlipSoundEnabled }}
        style={[
          styles.settingsSection,
          { borderColor: textColor, backgroundColor },
        ]}
        onPress={toggleSwitch}
      >
        <ThemedText type="defaultSemiBold" style={styles.itemText}>
          صوت قلب الصفحة
        </ThemedText>
        <Toggle
          color={primaryColor}
          size={30}
          circleColor={primaryColor}
          toggle={isFlipSoundEnabled}
          setToggle={toggleSwitch}
          aria-checked={isFlipSoundEnabled}
          aria-label="صوت قلب الصفحة"
        />
      </Pressable>
      <ThemedView
        style={[
          styles.settingsSection,
          { display: 'flex', flexDirection: 'column' },
        ]}
      >
        <ThemedView
          accessible
          accessibilityLabel="تحكم في السطوع"
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <ThemedText type="defaultSemiBold" style={[styles.itemText]}>
            قيمة السطوع في الوضع الليلي
          </ThemedText>
          <ThemedText
            type="defaultSemiBold"
            style={[styles.sliderValue, { padding: 5 }]}
          >
            {`(${Number(mushafContrastValue * 100).toFixed(0)}%)`}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.sliderContainer}>
          <Slider
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel="تحكم في قيمة السطوع"
            accessibilityValue={{
              min: 0.3,
              max: 1,
              now: mushafContrastValue,
            }}
            style={[styles.slider, { transform: [{ scaleX: -1 }] }]}
            minimumValue={0.3}
            maximumValue={1}
            step={0.1}
            value={mushafContrastValue}
            onValueChange={(value) => {
              setMushafContrastValue(value);
            }}
            minimumTrackTintColor={primaryLightColor}
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor={primaryColor}
          />
        </ThemedView>
      </ThemedView>
    </ThemedSafeAreaView>
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
  sliderValue: {
    fontSize: 22,
    fontFamily: 'Amiri_700Bold',
    textAlignVertical: 'center',
    paddingHorizontal: 10,
  },
  sliderContainer: {
    width: '100%',
    position: 'relative',
    maxWidth: 640,
  },
  slider: {
    width: '100%',
    height: 50,
    marginVertical: 10,
  },
});
