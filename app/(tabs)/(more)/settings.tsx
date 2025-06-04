import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity } from 'react-native';

import { Entypo, Feather } from '@expo/vector-icons';
import { useAtom } from 'jotai/react';
import { ScrollView } from 'react-native-gesture-handler';
import Toggle from 'react-native-toggle-input';

import AwesomeSlider from '@/components/awesomeSlider';
import SegmentedControl from '@/components/SegmentControl';
import SegmentedControlWithDisabled from '@/components/SegmentedControlWithDisabled';
import SEO from '@/components/seo';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { riwayaOptions } from '@/constants';
import { useColors } from '@/hooks/useColors';
import {
  flipSound,
  hizbNotification,
  mushafContrast,
  mushafRiwaya,
  showTrackerNotification,
} from '@/jotai/atoms';
import { RiwayaByIndice, RiwayaByValue } from '@/utils';
import { clearStorageAndReload } from '@/utils/storage/clearStorage';

export default function SettingsScreen() {
  const [isFlipSoundEnabled, setIsFlipSoundEnabled] = useAtom(flipSound);
  const [showTrackerNotificationValue, setShowTrackerNotificationValue] =
    useAtom(showTrackerNotification);
  const notificationOptions = ['تعطيل', 'حزب', 'جزء'];
  const [HizbNotificationValue, setHizbNotificationValue] =
    useAtom(hizbNotification);
  const { textColor, primaryColor, cardColor, iconColor } = useColors();
  const [mushafContrastValue, setMushafContrastValue] = useAtom(mushafContrast);
  const [mushafRiwayaValue, setMushafRiwayaValue] = useAtom(mushafRiwaya);
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
      <SEO
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
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setConfirmModalVisible(false)}
        >
          <ThemedView
            style={[styles.modalContent, { backgroundColor: cardColor }]}
            onStartShouldSetResponder={() => true}
          >
            <ThemedView style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>تأكيد</ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setConfirmModalVisible(false)}
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
                onPress={() => setConfirmModalVisible(false)}
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
