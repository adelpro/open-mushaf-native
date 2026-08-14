import { useState } from 'react';
import {
  Linking,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Entypo, Feather } from '@expo/vector-icons';
import * as StoreReview from 'expo-store-review';
import { useAtom } from 'jotai/react';
import { ScrollView } from 'react-native-gesture-handler';
import Toggle from 'react-native-toggle-input';

import {
  AwesomeSlider,
  SegmentedControl,
  SegmentedControlWithDisabled,
  Seo,
  SettingsCard,
  SettingsRow,
  SettingsSection,
  ThemedButton,
  ThemedText,
  ThemedView,
} from '@/components';
import {
  APP_COLOR_SCHEME_KEYS,
  APP_COLOR_SCHEME_LABELS,
  appColorSchemeAt,
  READING_THEME_KEYS,
  READING_THEME_LABELS,
  riwayaOptions,
} from '@/constants';
import { useAppColorScheme, useColors } from '@/hooks';
import {
  appColorScheme,
  flipSound,
  hizbNotification,
  mushafContrast,
  mushafRiwaya,
  panGestureSensitivity,
  readingTheme,
  showTrackerNotification,
} from '@/jotai/atoms';
import { isWeb, RiwayaByIndice, RiwayaByValue } from '@/utils';
import { clearStorageAndReload } from '@/utils/storage/clearStorage';

export default function SettingsScreen() {
  const [isFlipSoundEnabled, setIsFlipSoundEnabled] = useAtom(flipSound);
  const [showTrackerNotificationValue, setShowTrackerNotificationValue] =
    useAtom(showTrackerNotification);
  const notificationOptions = ['تعطيل', 'حزب', 'جزء'];
  const [HizbNotificationValue, setHizbNotificationValue] =
    useAtom(hizbNotification);
  const {
    primaryColor,
    primaryLightColor,
    cardColor,
    iconColor,
    backgroundColor,
  } = useColors();
  const colorScheme = useAppColorScheme();
  const segmentTextColor =
    colorScheme === 'dark' ? primaryLightColor : primaryColor;
  const [mushafContrastValue, setMushafContrastValue] = useAtom(mushafContrast);
  const [panGestureSensitivityValue, setPanGestureSensitivityValue] = useAtom(
    panGestureSensitivity,
  );
  const [mushafRiwayaValue, setMushafRiwayaValue] = useAtom(mushafRiwaya);
  const [readingThemeValue, setReadingThemeValue] = useAtom(readingTheme);
  const [appColorSchemeValue, setAppColorSchemeValue] = useAtom(appColorScheme);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const toggleFlipSoundSwitch = () => {
    setIsFlipSoundEnabled((previousState) => !previousState);
  };

  const toggleTrackerSwitch = () => {
    setShowTrackerNotificationValue((previousState) => !previousState);
  };

  const handleHizbNotificationValueChange = (value: number) => {
    if (value === 1 || value === 2) {
      setHizbNotificationValue(value);
      return;
    }

    setHizbNotificationValue(0);
  };

  return (
    <ScrollView
      style={{ backgroundColor }}
      contentContainerStyle={styles.container}
    >
      <Seo
        title="المصحف المفتوح - الإعدادات"
        description="إعدادات التطبيق - تخصيص المظهر والإشعارات والرواية"
      />

      <SettingsSection title="عام" icon="sliders">
        <SettingsCard>
          <SettingsRow
            title="صوت قلب الصفحة"
            description="تشغيل صوت قلب الصفحات"
            icon={
              <Feather name="volume-2" size={22} color={segmentTextColor} />
            }
            onPress={toggleFlipSoundSwitch}
            accessibility={{
              role: 'button',
              label: 'تفعيل صوت قلب الصفحة',
              hint: 'اضغط لتفعيل أو تعطيل صوت قلب الصفحة',
              state: { selected: isFlipSoundEnabled },
            }}
            trailing={
              <Toggle
                color={primaryColor}
                size={40}
                circleColor={primaryColor}
                toggle={isFlipSoundEnabled}
                setToggle={toggleFlipSoundSwitch}
                aria-checked={isFlipSoundEnabled}
                aria-label="صوت قلب الصفحة"
                accessibilityLabel="تبديل صوت قلب الصفحة"
                accessibilityState={{ checked: isFlipSoundEnabled }}
              />
            }
          />

          <SettingsRow
            title="تنبيه الورد اليومي"
            description="تنبيه عند إتمام الورد المحدد"
            icon={<Feather name="bell" size={22} color={segmentTextColor} />}
            onPress={toggleTrackerSwitch}
            accessibility={{
              role: 'button',
              label: 'تفعيل تنبيه إتمام الورد اليومي',
              hint: 'اضغط لتفعيل أو تعطيل تنبه إتمام الورد اليومي',
              state: { selected: showTrackerNotificationValue },
            }}
            trailing={
              <Toggle
                color={primaryColor}
                size={40}
                circleColor={primaryColor}
                toggle={showTrackerNotificationValue}
                setToggle={toggleTrackerSwitch}
                aria-checked={showTrackerNotificationValue}
                aria-label="إظهار تنبيه إتمام الحزب اليومي"
                accessibilityLabel="تنبيه إتمام الحزب اليومي"
                accessibilityState={{ checked: showTrackerNotificationValue }}
              />
            }
          />

          <SettingsRow
            title={`سطوع الوضع الليلي (${Number(mushafContrastValue * 100).toFixed(0)}%)`}
            icon={<Entypo name="light-up" size={22} color={segmentTextColor} />}
          >
            <AwesomeSlider
              value={mushafContrastValue}
              onValueChange={setMushafContrastValue}
              primaryColor={primaryColor}
            />
          </SettingsRow>

          <SettingsRow
            title={`حساسية السحب (${Number(panGestureSensitivityValue).toFixed(1)}x)`}
            icon={<Feather name="sliders" size={22} color={segmentTextColor} />}
          >
            <AwesomeSlider
              value={panGestureSensitivityValue}
              minimumValue={0.5}
              maximumValue={2.0}
              onValueChange={setPanGestureSensitivityValue}
              primaryColor={primaryColor}
            />
          </SettingsRow>

          <SettingsRow
            title="وضع التطبيق"
            description="اختر مظهر التطبيق العام"
            icon={<Feather name="sun" size={22} color={segmentTextColor} />}
            accessibility={{
              role: 'radiogroup',
              label: 'وضع التطبيق',
            }}
          >
            <SegmentedControl
              options={APP_COLOR_SCHEME_LABELS}
              initialSelectedIndex={APP_COLOR_SCHEME_KEYS.indexOf(
                appColorSchemeValue,
              )}
              activeColor={primaryColor}
              textColor={segmentTextColor}
              onSelectionChange={(index: number) => {
                setAppColorSchemeValue(appColorSchemeAt(index));
              }}
            />
          </SettingsRow>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="التنبيهات" icon="bell">
        <SettingsCard>
          <SettingsRow
            title="تفعيل التنبيهات"
            description="اختر نوع التنبيه الذي تفضله"
            icon={<Feather name="bell" size={22} color={segmentTextColor} />}
            accessibility={{
              role: 'radiogroup',
              label: 'تفعيل التنبيهات',
            }}
          >
            <SegmentedControlWithDisabled
              options={notificationOptions}
              initialSelectedIndex={HizbNotificationValue}
              activeColor={primaryColor}
              textColor={segmentTextColor}
              disabledTextColor={segmentTextColor}
              onSelectionChange={(index: number) =>
                handleHizbNotificationValueChange(index)
              }
            />
          </SettingsRow>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="سمة القراءة" icon="eye">
        <SettingsCard>
          <SettingsRow
            title="سمة القراءة"
            description="اختر مظهر صفحات المصحف"
            icon={<Feather name="eye" size={22} color={segmentTextColor} />}
            accessibility={{
              role: 'radiogroup',
              label: 'سمة القراءة',
            }}
          >
            <SegmentedControl
              options={READING_THEME_LABELS}
              initialSelectedIndex={READING_THEME_KEYS.indexOf(
                readingThemeValue,
              )}
              activeColor={primaryColor}
              textColor={segmentTextColor}
              onSelectionChange={(index: number) => {
                setReadingThemeValue(READING_THEME_KEYS[index]);
              }}
            />
          </SettingsRow>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="اختيار الرواية" icon="book-open">
        <SettingsCard>
          <SettingsRow
            title="الرواية"
            description="اختر الرواية التي تريد القراءة بها"
            icon={
              <Feather name="book-open" size={22} color={segmentTextColor} />
            }
            accessibility={{
              role: 'radiogroup',
              label: 'اختيار الرواية',
            }}
          >
            <SegmentedControl
              options={riwayaOptions}
              initialSelectedIndex={RiwayaByIndice(mushafRiwayaValue)}
              activeColor={primaryColor}
              textColor={segmentTextColor}
              onSelectionChange={(index: number) => {
                const selectedRiwaya = RiwayaByValue(index);
                setMushafRiwayaValue(selectedRiwaya);
              }}
            />
          </SettingsRow>
        </SettingsCard>
      </SettingsSection>

      {!isWeb && (
        <View style={styles.storeReviewWrap}>
          <ThemedButton
            role="button"
            variant="outlined-primary"
            onPress={async () => {
              const url = StoreReview.storeUrl();
              if (url) {
                await Linking.openURL(url);
              }
            }}
            style={styles.fullWidthButton}
          >
            ⭐ تقييم التطبيق على المتجر
          </ThemedButton>
        </View>
      )}

      <View style={styles.resetWrap}>
        <ThemedButton
          role="button"
          variant="danger"
          onPress={() => {
            setConfirmModalVisible(true);
          }}
          style={styles.fullWidthButton}
          accessibilityLabel="إعادة ضبط التطبيق"
          accessibilityHint="يعيد جميع الإعدادات إلى الوضع الافتراضي بعد التأكيد"
        >
          إعادة ضبط التطبيق
        </ThemedButton>
        <ThemedText style={[styles.resetHint, { color: iconColor }]}>
          إعادة جميع الإعدادات إلى الوضع الافتراضي
        </ThemedText>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={() => {
          setConfirmModalVisible(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setConfirmModalVisible(false);
          }}
          accessibilityLabel="إغلاق نافذة التأكيد"
          accessibilityRole="button"
        >
          <ThemedView
            style={[styles.modalContent, { backgroundColor: cardColor }]}
            onStartShouldSetResponder={() => true}
          >
            <ThemedView style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>تأكيد</ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setConfirmModalVisible(false);
                }}
                accessibilityRole="button"
                accessibilityLabel="إغلاق نافذة التأكيد"
              >
                <Feather name="x" size={24} color={iconColor} />
              </TouchableOpacity>
            </ThemedView>

            <ThemedText style={styles.modalMessage}>
              هل أنت متأكد من رغبتك في إعادة ضبط التطبيق؟
            </ThemedText>

            <ThemedView style={styles.modalActions}>
              <ThemedButton
                variant="outlined-primary"
                onPress={() => {
                  setConfirmModalVisible(false);
                }}
                style={styles.modalButton}
              >
                إلغاء
              </ThemedButton>
              <ThemedButton
                variant="danger"
                onPress={() => {
                  setConfirmModalVisible(false);
                  clearStorageAndReload();
                }}
                style={styles.modalButton}
              >
                تأكيد
              </ThemedButton>
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 640,
  },
  storeReviewWrap: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  resetWrap: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  fullWidthButton: {
    width: '100%',
    maxWidth: '100%',
  },
  resetHint: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'Tajawal_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
    textAlignVertical: 'center',
  },
  closeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Tajawal_400Regular',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    width: '100%',
  },
  modalButton: {
    width: '40%',
    maxWidth: 100,
  },
});
