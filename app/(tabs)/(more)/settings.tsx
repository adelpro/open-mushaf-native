import { useMemo, useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
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
  ThemedButton,
  ThemedText,
  ThemedView,
} from '@/components';
import {
  READING_THEME_KEYS,
  READING_THEME_LABELS,
  riwayaOptions,
} from '@/constants';
import { useColors } from '@/hooks';
import {
  flipSound,
  hizbNotification,
  mushafContrast,
  mushafRiwaya,
  panGestureSensitivity,
  readingTheme,
  showTrackerNotification,
} from '@/jotai/atoms';
import { createModalStyles } from '@/styles/modalStyles';
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
    textColor,
    primaryColor,
    cardColor,
    iconColor,
    overlayColor,
    borderLightColor,
  } = useColors();

  const modalStyles = useMemo(
    () => createModalStyles({ overlayColor, borderLightColor }),
    [overlayColor, borderLightColor],
  );

  const styles = useMemo(() => createStyles(), []);

  const [mushafContrastValue, setMushafContrastValue] = useAtom(mushafContrast);
  const [panGestureSensitivityValue, setPanGestureSensitivityValue] = useAtom(
    panGestureSensitivity,
  );
  const [mushafRiwayaValue, setMushafRiwayaValue] = useAtom(mushafRiwaya);
  const [readingThemeValue, setReadingThemeValue] = useAtom(readingTheme);
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
    <ScrollView contentContainerStyle={styles.container}>
      <Seo
        title="المصحف المفتوح - الإعدادات"
        description="إعدادات التطبيق - تخصيص المظهر والإشعارات والرواية"
      />
      <Pressable
        style={[
          styles.settingsSection,
          { borderColor: textColor, backgroundColor: cardColor },
        ]}
        onPress={toggleFlipSoundSwitch}
        accessibilityRole="button"
        accessibilityLabel="تفعيل صوت قلب الصفحة"
        accessibilityHint="اضغط لتفعيل أو تعطيل صوت قلب الصفحة"
        accessibilityState={{ selected: isFlipSoundEnabled }}
      >
        <ThemedView style={styles.iconTextContainer}>
          <Feather
            name="volume-2"
            size={24}
            color={iconColor}
            style={styles.iconStyle}
          />
          <ThemedText
            type="defaultSemiBold"
            style={[styles.itemText, { backgroundColor: cardColor }]}
          >
            صوت قلب الصفحة:
          </ThemedText>
        </ThemedView>
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
      </Pressable>

      {/* New Toggle for showDailyHizbCompletedBorder */}
      <Pressable
        style={[
          styles.settingsSection,
          { borderColor: textColor, backgroundColor: cardColor },
        ]}
        onPress={toggleTrackerSwitch}
        accessibilityRole="button"
        accessibilityLabel="تفعيل تنبيه إتمام الورد اليومي"
        accessibilityHint="اضغط لتفعيل أو تعطيل تنبه إتمام الورد اليومي"
        accessibilityState={{
          selected: showTrackerNotificationValue,
        }}
      >
        <ThemedView style={styles.iconTextContainer}>
          <Feather
            name="bell"
            size={24}
            color={iconColor}
            style={styles.iconStyle}
          />
          <ThemedText
            type="defaultSemiBold"
            style={[styles.itemText, { backgroundColor: cardColor }]}
          >
            تنبيه الورد اليومي:
          </ThemedText>
        </ThemedView>
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
      </Pressable>

      <ThemedView
        style={[
          styles.settingsSection,
          styles.columnSection,
          { backgroundColor: cardColor },
        ]}
      >
        <ThemedView
          style={[
            styles.rowContainer,
            styles.iconTextContainer,
            { backgroundColor: cardColor },
          ]}
        >
          <Entypo
            name="light-up"
            size={24}
            color={iconColor}
            style={styles.iconStyle}
          />
          <ThemedText type="defaultSemiBold" style={styles.itemText}>
            {` سطوع الوضع الليلي: (${Number(mushafContrastValue * 100).toFixed(0)}%)`}
          </ThemedText>
        </ThemedView>

        <ThemedView
          style={[styles.sliderContainer, { backgroundColor: cardColor }]}
        >
          <AwesomeSlider
            value={mushafContrastValue}
            onValueChange={setMushafContrastValue}
            primaryColor={primaryColor}
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
          style={[
            styles.rowContainer,
            styles.iconTextContainer,
            { backgroundColor: cardColor },
          ]}
        >
          <Feather
            name="sliders"
            size={24}
            color={iconColor}
            style={styles.iconStyle}
          />
          <ThemedText type="defaultSemiBold" style={styles.itemText}>
            {` حساسية السحب: (${Number(panGestureSensitivityValue).toFixed(1)}x)`}
          </ThemedText>
        </ThemedView>

        <ThemedView
          style={[styles.sliderContainer, { backgroundColor: cardColor }]}
        >
          <AwesomeSlider
            value={panGestureSensitivityValue}
            minimumValue={0.5}
            maximumValue={2.0}
            onValueChange={setPanGestureSensitivityValue}
            primaryColor={primaryColor}
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
          style={[
            styles.fullWidthContainer,
            styles.iconTextContainer,
            { backgroundColor: cardColor },
          ]}
        >
          <Feather
            name="bell"
            size={24}
            color={iconColor}
            style={styles.iconStyle}
          />
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
          style={[
            styles.fullWidthContainer,
            styles.iconTextContainer,
            { backgroundColor: cardColor },
          ]}
        >
          <Feather
            name="eye"
            size={24}
            color={iconColor}
            style={styles.iconStyle}
          />
          <ThemedText
            type="defaultSemiBold"
            style={[styles.itemText, styles.fullWidth]}
          >
            سمة القراءة:
          </ThemedText>
        </ThemedView>
        <Pressable style={styles.fullWidth} accessibilityRole="radiogroup">
          <SegmentedControl
            options={READING_THEME_LABELS}
            initialSelectedIndex={READING_THEME_KEYS.indexOf(readingThemeValue)}
            activeColor={primaryColor}
            textColor={primaryColor}
            onSelectionChange={(index: number) => {
              setReadingThemeValue(READING_THEME_KEYS[index]);
            }}
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
          style={[
            styles.fullWidthContainer,
            styles.iconTextContainer,
            { backgroundColor: cardColor },
          ]}
        >
          <Feather
            name="book-open"
            size={24}
            color={iconColor}
            style={styles.iconStyle}
          />
          <ThemedText
            type="defaultSemiBold"
            style={[styles.itemText, styles.fullWidth]}
          >
            إختيار الرواية :
          </ThemedText>
        </ThemedView>
        <Pressable style={styles.fullWidth} accessibilityRole="radiogroup">
          <SegmentedControl
            options={riwayaOptions}
            initialSelectedIndex={RiwayaByIndice(mushafRiwayaValue)}
            activeColor={primaryColor}
            textColor={primaryColor}
            onSelectionChange={(index: number) => {
              const selectedRiwaya = RiwayaByValue(index);
              setMushafRiwayaValue(selectedRiwaya);
            }}
          />
        </Pressable>
      </ThemedView>
      {!isWeb && (
        <ThemedView
          style={[
            styles.settingsSection,
            styles.columnSection,
            { backgroundColor: cardColor },
          ]}
        >
          <ThemedButton
            role="button"
            variant="outlined-primary"
            onPress={async () => {
              const url = StoreReview.storeUrl();
              if (url) {
                await Linking.openURL(url);
              }
            }}
          >
            ⭐ تقييم التطبيق على المتجر
          </ThemedButton>
        </ThemedView>
      )}

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
          onPress={() => setConfirmModalVisible(true)}
        >
          إعادة ضبط التطبيق
        </ThemedButton>
      </ThemedView>

      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <TouchableOpacity
          style={modalStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setConfirmModalVisible(false)}
          accessibilityLabel="إغلاق نافذة التأكيد"
          accessibilityRole="button"
        >
          <ThemedView
            style={[modalStyles.modalContent, { backgroundColor: cardColor }]}
            onStartShouldSetResponder={() => true}
          >
            <ThemedView style={modalStyles.modalHeader}>
              <ThemedText style={modalStyles.modalTitle}>تأكيد</ThemedText>
              <TouchableOpacity
                style={modalStyles.closeButton}
                onPress={() => setConfirmModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="إغلاق نافذة التأكيد"
              >
                <Feather name="x" size={24} color={iconColor} />
              </TouchableOpacity>
            </ThemedView>

            <ThemedText style={modalStyles.modalMessage}>
              هل أنت متأكد من رغبتك في إعادة ضبط التطبيق؟
            </ThemedText>

            <ThemedView style={modalStyles.modalActions}>
              <ThemedButton
                variant="outlined-primary"
                onPress={() => setConfirmModalVisible(false)}
                style={modalStyles.modalButton}
              >
                إلغاء
              </ThemedButton>
              <ThemedButton
                variant="danger"
                onPress={() => {
                  setConfirmModalVisible(false);
                  clearStorageAndReload();
                }}
                style={modalStyles.modalButton}
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

const createStyles = () =>
  StyleSheet.create({
    container: {
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
      alignItems: 'baseline',
    },
    sliderContainer: {
      width: '100%',
      position: 'relative',
    },
    iconTextContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      margin: 2,
      marginBottom: 5,
    },
    iconStyle: {
      paddingVertical: 8,
    },
  });
