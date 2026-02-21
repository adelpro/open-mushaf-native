import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

import HelpSVG from '@/assets/svgs/help.svg';
import InfoSVG from '@/assets/svgs/info.svg';
import MailSVG from '@/assets/svgs/mail.svg';
import PageSVG from '@/assets/svgs/page.svg';
import SettingsSVG from '@/assets/svgs/settings.svg';
import ShareSVG from '@/assets/svgs/share.svg';
import WelcomeSVG from '@/assets/svgs/welcome.svg';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';

export default function MoreScreen() {
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { cardColor, iconColor, textColor, primaryLightColor } = useColors();

  const handleShare = async () => {
    let shareUrl = 'https://www.quran.us.kg';

    if (Platform.OS === 'android') {
      shareUrl =
        'https://play.google.com/store/apps/details?id=com.adelpro.openmushafnative';
    }

    try {
      await Share.share({
        message:
          'شارك هذا التطبيق القرآني مع الآخرين | Open Mushaf Native\n' +
          shareUrl,
        url: shareUrl,
        title: 'Open Mushaf Native',
      });
    } catch (error: any) {
      setErrorMessage(error.message || 'حدث خطأ غير متوقع أثناء المشاركة.');
      setErrorModalVisible(true);
    }
  };

  // مصفوفة لتسهيل صيانة الأزرار وإضافة خصائص الوصول
  const menuItems = [
    {
      label: 'الإعدادات',
      route: '/settings',
      icon: SettingsSVG,
      hint: 'تخصيص مظهر وتنبيهات التطبيق',
    },
    {
      label: 'سياسة الخصوصية',
      route: '/privacy',
      icon: PageSVG,
      hint: 'عرض كيفية حماية بياناتك',
    },
    {
      label: 'تواصل معنا',
      route: '/contact',
      icon: MailSVG,
      hint: 'إرسال ملاحظات أو استفسارات',
    },
    {
      label: 'جولة تعليمية',
      route: '/tutorial',
      icon: WelcomeSVG,
      hint: 'مشاهدة كيفية استخدام التطبيق',
    },
    {
      label: 'المساعدة',
      url: 'https://docs.quran.us.kg',
      icon: HelpSVG,
      hint: 'عرض وثائق الدعم الفني',
    },
    {
      label: 'حول التطبيق',
      route: '/about',
      icon: InfoSVG,
      hint: 'معلومات عن الإصدار والمطورين',
    },
    {
      label: 'شارك التطبيق',
      action: handleShare,
      icon: ShareSVG,
      hint: 'نشر رابط التطبيق للأصدقاء',
    },
  ];

  const handlePress = async (item: (typeof menuItems)[0]) => {
    if (item.route) {
      router.push(item.route as any);
    } else if (item.url) {
      const supported = await Linking.canOpenURL(item.url);
      if (supported) await Linking.openURL(item.url);
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <ThemedView style={styles.container}>
      {menuItems.map((item, index) => (
        <ThemedButton
          key={index}
          onPress={() => handlePress(item)}
          variant="primary"
          style={styles.button}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          accessibilityHint={item.hint}
        >
          <View style={styles.buttonContent}>
            <item.icon width={24} height={24} style={styles.svg} fill="white" />
            <ThemedText style={styles.buttonText}>{item.label}</ThemedText>
          </View>
        </ThemedButton>
      ))}

      {/* Error Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={errorModalVisible}
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setErrorModalVisible(false)}
        >
          <ThemedView
            style={[
              styles.modalContent,
              {
                backgroundColor: cardColor,
                borderColor: primaryLightColor,
                borderWidth: 1,
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: primaryLightColor },
              ]}
            >
              <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
                خطأ
              </ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setErrorModalVisible(false)}
                accessibilityLabel="إغلاق التنبيه"
              >
                <Feather name="x" size={24} color={iconColor} />
              </TouchableOpacity>
            </View>

            <ThemedText style={styles.modalMessage}>{errorMessage}</ThemedText>

            <View style={styles.modalActions}>
              <ThemedButton
                variant="primary"
                onPress={() => setErrorModalVisible(false)}
                style={styles.modalButton}
              >
                حسناً
              </ThemedButton>
            </View>
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12, // تقليل الفجوة قليلاً لتناسب الشاشات الصغيرة
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  button: {
    height: 56, // زيادة الارتفاع قليلاً لتسهيل اللمس
    borderRadius: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    width: 280, // تعديل العرض ليكون أكثر تناسقاً
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  buttonText: {
    marginStart: 12,
    color: 'white',
    fontSize: 18, // تصغير الخط قليلاً ليكون أكثر رصانة
    fontFamily: 'Tajawal_700Bold',
  },
  svg: {
    // SVGs في React Native تحتاج أحياناً لخاصية fill بدلاً من color
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 350,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
  },
  closeButton: {
    padding: 5,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 25,
    textAlign: 'center',
    fontFamily: 'Tajawal_400Regular',
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  modalButton: {
    width: '100%',
  },
});
