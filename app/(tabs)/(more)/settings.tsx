import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

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
  const { textColor, primaryColor, cardColor, iconColor, primaryLightColor } =
    useColors();
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
    setHizbNotificationValue(value === 1 || value === 2 ? value : 0);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SEO
        title="المصحف المفتوح - الإعدادات"
        description="إعدادات التطبيق - تخصيص المظهر والإشعارات والرواية"
      />

      {/* صوت قلب الصفحة */}
      <Pressable
        style={[styles.settingsSection, { backgroundColor: cardColor }]}
        onPress={toggleFlipSoundSwitch}
        accessible={true}
        accessibilityRole="switch"
        accessibilityLabel="صوت قلب الصفحة"
        accessibilityState={{ checked: isFlipSoundEnabled }}
        accessibilityHint="يفعل صوت محاكاة قلب الورق عند التنقل"
      >
        <View style={styles.iconTextContainer}>
          <Feather name="volume-2" size={24} color={iconColor} />
          <ThemedText type="defaultSemiBold" style={styles.itemText}>
            صوت قلب الصفحة:
          </ThemedText>
        </View>
        <Toggle
          color={primaryColor}
          size={40}
          toggle={isFlipSoundEnabled}
          setToggle={toggleFlipSoundSwitch}
        />
      </Pressable>

      {/* تنبيه الورد اليومي */}
      <Pressable
        style={[styles.settingsSection, { backgroundColor: cardColor }]}
        onPress={toggleTrackerSwitch}
        accessible={true}
        accessibilityRole="switch"
        accessibilityLabel="تنبيه الورد اليومي"
        accessibilityState={{ checked: showTrackerNotificationValue }}
        accessibilityHint="يظهر تنبيهاً عند إتمام حزبك المعتاد"
      >
        <View style={styles.iconTextContainer}>
          <Feather name="bell" size={24} color={iconColor} />
          <ThemedText type="defaultSemiBold" style={styles.itemText}>
            تنبيه الورد اليومي:
          </ThemedText>
        </View>
        <Toggle
          color={primaryColor}
          size={40}
          toggle={showTrackerNotificationValue}
          setToggle={toggleTrackerSwitch}
        />
      </Pressable>

      {/* سطوع الوضع الليلي */}
      <ThemedView
        style={[
          styles.settingsSection,
          styles.columnSection,
          { backgroundColor: cardColor },
        ]}
      >
        <View style={styles.iconTextContainer}>
          <Entypo name="light-up" size={24} color={iconColor} />
          <ThemedText type="defaultSemiBold" style={styles.itemText}>
            {`سطوع الوضع الليلي: (${(mushafContrastValue * 100).toFixed(0)}%)`}
          </ThemedText>
        </View>
        <View
          style={styles.sliderContainer}
          accessible={true}
          accessibilityRole="adjustable"
          accessibilityLabel="مستوى سطوع الوضع الليلي"
          accessibilityValue={{
            now: mushafContrastValue * 100,
            min: 0,
            max: 100,
            text: `${(mushafContrastValue * 100).toFixed(0)} بالمائة`,
          }}
          accessibilityHint="اسحب لليمين أو اليسار لتعديل السطوع"
        >
          <AwesomeSlider
            value={mushafContrastValue}
            onValueChange={setMushafContrastValue}
            primaryColor={primaryColor}
          />
        </View>
      </ThemedView>

      {/* تفعيل التنبيهات */}
      <ThemedView
        style={[
          styles.settingsSection,
          styles.columnSection,
          { backgroundColor: cardColor },
        ]}
      >
        <View style={styles.iconTextContainer}>
          <Feather name="bell" size={24} color={iconColor} />
          <ThemedText type="defaultSemiBold" style={styles.itemText}>
            تذكير الورد (حسب):
          </ThemedText>
        </View>
        <View
          style={styles.fullWidth}
          accessible={true}
          accessibilityLabel="خيارات نوع التنبيه"
        >
          <SegmentedControlWithDisabled
            options={notificationOptions}
            initialSelectedIndex={HizbNotificationValue}
            activeColor={primaryColor}
            textColor={textColor}
            onSelectionChange={handleHizbNotificationValueChange}
          />
        </View>
      </ThemedView>

      {/* اختيار الرواية */}
      <ThemedView
        style={[
          styles.settingsSection,
          styles.columnSection,
          { backgroundColor: cardColor },
        ]}
      >
        <View style={styles.iconTextContainer}>
          <Feather name="book-open" size={24} color={iconColor} />
          <ThemedText type="defaultSemiBold" style={styles.itemText}>
            اختيار الرواية:
          </ThemedText>
        </View>
        <View
          style={styles.fullWidth}
          accessible={true}
          accessibilityLabel="اختر رواية المصحف"
        >
          <SegmentedControl
            options={riwayaOptions}
            initialSelectedIndex={RiwayaByIndice(mushafRiwayaValue)}
            activeColor={primaryColor}
            textColor={textColor}
            onSelectionChange={(index: number) =>
              setMushafRiwayaValue(RiwayaByValue(index))
            }
          />
        </View>
      </ThemedView>

      {/* إعادة الضبط */}
      <ThemedView
        style={[
          styles.settingsSection,
          { backgroundColor: 'transparent', elevation: 0 },
        ]}
      >
        <ThemedButton
          variant="danger"
          onPress={() => setConfirmModalVisible(true)}
          style={styles.fullWidth}
          accessibilityLabel="إعادة ضبط التطبيق بالكامل"
          accessibilityHint="سيؤدي هذا لمسح جميع الإعدادات والمواضع المحفوظة"
        >
          إعادة ضبط التطبيق
        </ThemedButton>
      </ThemedView>

      {/* Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView
            style={[
              styles.modalContent,
              {
                backgroundColor: cardColor,
                borderColor: primaryLightColor,
                borderWidth: 1,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>تأكيد الحذف</ThemedText>
              <TouchableOpacity
                onPress={() => setConfirmModalVisible(false)}
                accessibilityLabel="إغلاق"
                accessibilityRole="button"
              >
                <Feather name="x" size={24} color={iconColor} />
              </TouchableOpacity>
            </View>

            <ThemedText style={styles.modalMessage}>
              هل أنت متأكد من رغبتك في إعادة ضبط التطبيق؟ سيتم فقدان جميع
              بياناتك المحلية.
            </ThemedText>

            <View style={styles.modalActions}>
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
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    alignItems: 'center',
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  settingsSection: {
    width: '100%',
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  columnSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 5,
  },
  itemText: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
  },
  fullWidth: {
    width: '100%',
    marginTop: 10,
  },
  sliderContainer: {
    width: '100%',
    paddingVertical: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Tajawal_700Bold',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'Tajawal_400Regular',
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    width: '48%',
  },
});
