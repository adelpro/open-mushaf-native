import { I18nManager, Pressable, StyleSheet } from 'react-native';

import Slider from '@react-native-community/slider';
import Toggle from 'react-native-toggle-input';
import { useRecoilState } from 'recoil';

import SegmentedControl from '@/components/SegmentControl';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import { flipSound, hizbNotification, mushafContrast } from '@/recoil/atoms';

const isRTL = I18nManager.isRTL;
export default function SettingsScreen() {
  const [isFlipSoundEnabled, setIsFlipSoundEnabled] = useRecoilState(flipSound);
  const options = ['تعطيل', 'حزب', 'جزء'];

  const [HizbNotificationValue, setHizbNotificationValue] =
    useRecoilState<number>(hizbNotification);
  const { textColor, backgroundColor, primaryColor, primaryLightColor } =
    useColors();
  const [mushafContrastValue, setMushafContrastValue] =
    useRecoilState(mushafContrast);

  const toggleSwitch = () => {
    setIsFlipSoundEnabled((previousState) => !previousState);
  };

  const handleHizbNotificationValueChange = (value: number) => {
    if (value === 1 || value === 2) {
      setHizbNotificationValue(value);
      return;
    }

    setHizbNotificationValue(0);
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
          صوت قلب الصفحة:
        </ThemedText>
        <Toggle
          color={primaryColor}
          size={40}
          circleColor={primaryColor}
          toggle={isFlipSoundEnabled}
          setToggle={toggleSwitch}
          aria-checked={isFlipSoundEnabled}
          aria-label="صوت قلب الصفحة"
          accessibilityLabel="تبديل صوت قلب الصفحة"
          accessibilityState={{ checked: isFlipSoundEnabled }}
        />
      </Pressable>

      <ThemedView style={[styles.settingsSection, { flexDirection: 'column' }]}>
        <ThemedView
          style={[
            {
              alignItems: 'center',
              backgroundColor: 'red',
              gap: 5,
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'flex-start',
            },
          ]}
        >
          <ThemedText type="defaultSemiBold" style={[styles.itemText]}>
            قيمة السطوع في الوضع الليلي:
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
            style={[styles.slider, !isRTL && { transform: [{ scaleX: -1 }] }]}
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
      <ThemedView style={[styles.settingsSection, { flexDirection: 'column' }]}>
        <ThemedView
          style={[
            {
              backgroundColor: 'red',
              alignItems: 'center',
              width: '100%',
            },
          ]}
        >
          <ThemedText
            type="defaultSemiBold"
            style={[styles.itemText, { width: '100%' }]}
          >
            تفعيل التنبيهات:
          </ThemedText>
        </ThemedView>
        <Pressable style={[{ width: '100%' }]} accessibilityRole="radiogroup">
          <SegmentedControl
            options={options}
            initialSelectedIndex={HizbNotificationValue}
            activeColor={primaryColor}
            textColor={primaryColor}
            disabledTextColor={primaryColor}
            onSelectionChange={(index: number) =>
              handleHizbNotificationValueChange(index)
            }
          />
        </Pressable>
      </ThemedView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  slider: {
    width: '100%',
    height: 60,
    marginVertical: 10,
  },
  segmentedControl: {
    width: '100%',
    marginVertical: 8,
  },
  segmentedControlTab: {
    backgroundColor: 'transparent',
    padding: 5,
    borderRadius: 5,
  },
});
