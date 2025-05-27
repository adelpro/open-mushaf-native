import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
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
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';

export default function MoreScreen() {
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { cardColor, iconColor, textColor } = useColors(); // Added textColor for modal message

  const handleShare = async () => {
    let shareUrl = 'https://www.quran.us.kg'; // Default/Web URL

    if (Platform.OS === 'android') {
      shareUrl =
        'https://play.google.com/store/apps/details?id=com.adelpro.openmushafnative';
    }
    // No specific iOS URL for now, it will use the default shareUrl.

    try {
      await Share.share({
        message:
          'شارك هذا التطبيق القرآني مع الآخرين | Open Mushaf Native\n' +
          shareUrl,
        url: shareUrl, // URL is included for platforms that support it well
        title: 'Open Mushaf Native', // Optional, mainly for Android
      });
      // console.log('Share successful or dismissed'); // You can uncomment this if needed
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
      setErrorModalVisible(true);
    }
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ThemedButton
        onPress={() => router.push('/settings')}
        variant="primary"
        style={styles.button}
      >
        <View style={styles.buttonContent}>
          <SettingsSVG width={24} height={24} style={styles.svg} />
          <Text style={styles.buttonText}>الإعدادات</Text>
        </View>
      </ThemedButton>
      <ThemedButton
        onPress={() => router.push('/privacy')}
        variant="primary"
        style={styles.button}
      >
        <View style={styles.buttonContent}>
          <PageSVG width={24} height={24} style={styles.svg} />
          <Text style={styles.buttonText}>سياسة الخصوصية</Text>
        </View>
      </ThemedButton>
      <ThemedButton
        onPress={() => router.push('/contact')}
        variant="primary"
        style={styles.button}
      >
        <View style={styles.buttonContent}>
          <MailSVG width={24} height={24} style={styles.svg} />
          <Text style={styles.buttonText}>تواصل معنا</Text>
        </View>
      </ThemedButton>

      <ThemedButton
        variant="primary"
        onPress={() => router.push('/tutorial')}
        style={styles.button}
      >
        <View style={styles.buttonContent}>
          <WelcomeSVG width={24} height={24} style={styles.svg} />
          <Text style={styles.buttonText}>جولة تعليمة</Text>
        </View>
      </ThemedButton>
      <ThemedButton
        onPress={async () => {
          const url = 'https://docs.quran.us.kg';
          const supported = await Linking.canOpenURL(url);
          if (supported) {
            await Linking.openURL(url);
          }
        }}
        variant="primary"
        style={styles.button}
      >
        <View style={styles.buttonContent}>
          <HelpSVG width={24} height={24} style={styles.svg} />
          <Text style={styles.buttonText}>المساعدة</Text>
        </View>
      </ThemedButton>
      <ThemedButton
        onPress={() => router.push('/about')}
        variant="primary"
        style={styles.button}
      >
        <View style={styles.buttonContent}>
          <InfoSVG width={24} height={24} style={styles.svg} />
          <Text style={styles.buttonText}>حول التطبيق</Text>
        </View>
      </ThemedButton>
      <ThemedButton
        onPress={handleShare}
        variant="primary"
        style={styles.button}
      >
        <View style={styles.buttonContent}>
          <ShareSVG width={24} height={24} style={styles.svg} />
          <Text style={styles.buttonText}>شارك التطبيق</Text>
        </View>
      </ThemedButton>

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
            style={[styles.modalContent, { backgroundColor: cardColor }]}
            onStartShouldSetResponder={() => true} // Prevents touch from passing through
          >
            <ThemedView
              style={[styles.modalHeader, { borderBottomColor: textColor }]}
            >
              <ThemedText style={[styles.modalTitle, { color: textColor }]}>
                خطأ
              </ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setErrorModalVisible(false)}
              >
                <Feather name="x" size={24} color={iconColor} />
              </TouchableOpacity>
            </ThemedView>

            <ThemedText style={[styles.modalMessage, { color: textColor }]}>
              {errorMessage}
            </ThemedText>

            <ThemedView style={styles.modalActions}>
              <ThemedButton
                variant="primary"
                onPress={() => setErrorModalVisible(false)}
                style={styles.modalButton}
              >
                حسناً
              </ThemedButton>
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    height: 50,
  },
  buttonContent: {
    flexDirection: 'row',
    width: 300,
    height: 50,
    alignItems: 'center',
  },
  buttonText: {
    marginStart: 5,
    marginEnd: 5,
    color: 'white',
    fontSize: 24,
    lineHeight: 26,
    paddingHorizontal: 5,
    fontFamily: 'Tajawal_400Regular',
    textAlignVertical: 'center',
  },
  svg: {
    color: 'white',
  },

  // Modal Styles (adapted from settings.tsx)
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
    // borderBottomColor will be set by theme
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
    justifyContent: 'center', // Center the single button
    backgroundColor: 'transparent',
    width: '100%',
  },
  modalButton: {
    width: '40%', // Adjust as needed for a single button
    maxWidth: 120, // Adjust as needed
  },
});
