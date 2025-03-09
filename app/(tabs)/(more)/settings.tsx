import { Pressable, StyleSheet } from 'react-native';

import Slider from '@react-native-community/slider';
import { useAtom } from 'jotai';
import { ScrollView } from 'react-native-gesture-handler';
import Toggle from 'react-native-toggle-input';

import SegmentedControl from '@/components/SegmentControl';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import {
  flipSound,
  hizbNotification,
  mushafContrast,
  MushafRiwaya,
} from '@/jotai/atoms';
import { clearStorageAndReload, isRTL } from '@/utils';

export default function SettingsScreen() {
  const [isFlipSoundEnabled, setIsFlipSoundEnabled] = useAtom(flipSound);
  const [mushafRiwayaValue, setMushafRiwayaValue] = useAtom(MushafRiwaya);
  const debugValue = process.env.EXPO_PUBLIC_DEBUG;
  const debug = debugValue === 'true' ? true : false;

  const hizbNotificationOptions = ['تعطيل', 'حزب', 'جزء'];
  const riwayaOptions = ['ورش', 'حفص'];

  const [HizbNotificationValue, setHizbNotificationValue] =
    useAtom(hizbNotification);
  const { textColor, primaryColor, primaryLightColor, cardColor } = useColors();
  const [mushafContrastValue, setMushafContrastValue] = useAtom(mushafContrast);

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
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable
        style={[
          styles.settingsSection,
          { borderColor: textColor, backgroundColor: cardColor },
        ]}
        onPress={toggleSwitch}
        accessibilityRole="button"
        accessibilityLabel="تفعيل صوت قلب الصفحة"
        accessibilityHint="اضغط لتفعيل أو تعطيل صوت قلب الصفحة"
        accessibilityState={{ selected: isFlipSoundEnabled }}
      >
        <ThemedText
          type="defaultSemiBold"
          style={[styles.itemText, { backgroundColor: cardColor }]}
        >
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

      <ThemedView
        style={[
          styles.settingsSection,
          { flexDirection: 'column', backgroundColor: cardColor },
        ]}
      >
        <ThemedView
          style={[
            {
              alignItems: 'center',
              gap: 5,
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'flex-start',
              backgroundColor: cardColor,
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

        <ThemedView
          style={[styles.sliderContainer, { backgroundColor: cardColor }]}
        >
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
      <ThemedView
        style={[
          styles.settingsSection,
          { flexDirection: 'column', backgroundColor: cardColor },
        ]}
      >
        <ThemedView
          style={[
            {
              alignItems: 'center',
              width: '100%',
              backgroundColor: cardColor,
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
            options={hizbNotificationOptions}
            showDisableOption
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

      <ThemedView
        style={[
          styles.settingsSection,
          { flexDirection: 'column', backgroundColor: cardColor },
        ]}
      >
        <ThemedText
          type="defaultSemiBold"
          style={[styles.itemText, { width: '100%' }]}
        >
          يرجى اختيار الرواية
        </ThemedText>
        <Pressable style={[{ width: '100%' }]} accessibilityRole="radiogroup">
          <SegmentedControl
            options={riwayaOptions}
            initialSelectedIndex={mushafRiwayaValue}
            activeColor={primaryColor}
            textColor={primaryColor}
            disabledTextColor={primaryColor}
            onSelectionChange={(index: number) => {
              setMushafRiwayaValue(index);
            }}
          />
        </Pressable>
      </ThemedView>

      {debug ? (
        <ThemedView
          style={[
            styles.settingsSection,
            { flexDirection: 'column', backgroundColor: cardColor },
          ]}
        >
          <ThemedButton
            role="button"
            variant="danger"
            onPress={clearStorageAndReload}
          >
            حذف كل التغييرات
          </ThemedButton>
        </ThemedView>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    margin: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 640,
  },
  settingsSection: {
    width: '100%',
    marginBottom: 15,
    padding: 12,
    borderRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 20,
    fontFamily: 'Amiri_700Bold',
    paddingVertical: 8,
    paddingHorizontal: 5,
    textAlignVertical: 'center',
    marginBottom: 5,
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
    paddingHorizontal: 5,
  },
});
