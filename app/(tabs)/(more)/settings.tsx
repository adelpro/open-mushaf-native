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
        style={[
          styles.settingsSection,
          { borderColor: textColor, backgroundColor },
        ]}
        onPress={toggleSwitch}
        accessibilityRole="button"
        accessibilityLabel="تفعيل صوت قلب الصفحة"
        accessibilityHint="اضغط لتفعيل أو تعطيل صوت قلب الصفحة"
        accessibilityState={{ selected: isFlipSoundEnabled }}
      >
        <ThemedText type="defaultSemiBold" style={styles.itemText}>
          صوت قلب الصفحة
        </ThemedText>
        <Toggle
          color={primaryColor}
          size={40} // Increased the size for better touch target
          circleColor={primaryColor}
          toggle={isFlipSoundEnabled}
          setToggle={toggleSwitch}
          aria-checked={isFlipSoundEnabled}
          aria-label="صوت قلب الصفحة"
          accessibilityLabel="تبديل صوت قلب الصفحة"
          accessibilityState={{ checked: isFlipSoundEnabled }}
        />
      </Pressable>

      <ThemedView
        style={[
          styles.settingsSection,
          { display: 'flex', flexDirection: 'column' },
        ]}
      >
        <ThemedView
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
            accessibilityLabel="تعديل السطوع في الوضع الليلي"
            accessibilityValue={{
              min: 30,
              max: 100,
              now: mushafContrastValue * 100,
            }}
            accessibilityHint="استخدم السحب لضبط السطوع في الوضع الليلي"
            accessibilityLiveRegion="polite"
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderColor: '#e0e0e0',
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    height: 60,
    marginVertical: 10,
  },
});
