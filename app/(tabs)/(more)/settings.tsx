import { Pressable, StyleSheet } from 'react-native';

import Slider from '@react-native-community/slider';
import { ScrollView } from 'react-native-gesture-handler';
import Toggle from 'react-native-toggle-input';
import { useRecoilState } from 'recoil';

import SegmentedControlWithDisabled from '@/components/SegmentedControlWithDisabled';
import SelectRiwaya from '@/components/SelectRiwaya';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import { flipSound, hizbNotification, mushafContrast } from '@/recoil/atoms';
import { isRTL } from '@/utils';
import { clearStorageAndReload } from '@/utils/clearStorage';

export default function SettingsScreen() {
  const [isFlipSoundEnabled, setIsFlipSoundEnabled] = useRecoilState(flipSound);
  const notificationOptions = ['تعطيل', 'حزب', 'جزء'];
  const [HizbNotificationValue, setHizbNotificationValue] =
    useRecoilState<number>(hizbNotification);
  const { textColor, primaryColor, primaryLightColor, cardColor } = useColors();
  const [mushafContrastValue, setMushafContrastValue] =
    useRecoilState(mushafContrast);

  const toggleSwitch = () => {
    setIsFlipSoundEnabled((previousState) => !previousState);
  };

  const debug = process.env.EXPO_PUBLIC_DEBUG === 'true' ? true : false;

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
          styles.columnSection,
          { backgroundColor: cardColor },
        ]}
      >
        <ThemedView
          style={[styles.rowContainer, { backgroundColor: cardColor }]}
        >
          <ThemedText type="defaultSemiBold" style={styles.itemText}>
            سطوع الوضع الليلي:
          </ThemedText>
          <ThemedText
            type="defaultSemiBold"
            style={[styles.sliderValue, { padding: 2 }]}
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
          styles.columnSection,
          { backgroundColor: cardColor },
        ]}
      >
        <ThemedView
          style={[styles.fullWidthContainer, { backgroundColor: cardColor }]}
        >
          <ThemedText
            type="defaultSemiBold"
            style={[styles.itemText, styles.fullWidth]}
          >
            تفعيل التنبيهات:
          </ThemedText>
        </ThemedView>
        <Pressable style={styles.fullWidth} accessibilityRole="radiogroup">
          <SegmentedControlWithDisabled
            options={notificationOptions}
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
          styles.columnSection,
          { backgroundColor: cardColor },
        ]}
      >
        <ThemedView
          style={[styles.fullWidthContainer, { backgroundColor: cardColor }]}
        >
          <SelectRiwaya />
        </ThemedView>
      </ThemedView>

      {debug && (
        <ThemedView
          style={[
            styles.settingsSection,
            styles.columnSection,
            { backgroundColor: cardColor },
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
      )}
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
  columnSection: {
    flexDirection: 'column',
  },
  rowContainer: {
    alignItems: 'center',
    gap: 1,
    flexDirection: 'row',
    width: '100%',
  },
  fullWidthContainer: {
    alignItems: 'center',
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  itemText: {
    fontSize: 20,
    fontFamily: 'Tajawal_700Bold',
    paddingVertical: 8,
    paddingHorizontal: 5,
    textAlignVertical: 'center',
    marginBottom: 5,
  },
  sliderValue: {
    fontSize: 22,
    fontFamily: 'Tajawal_700Bold',
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
