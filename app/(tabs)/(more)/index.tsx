import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

import InfoSVG from '@/assets/svgs/info.svg';
import MailSVG from '@/assets/svgs/mail.svg';
import PageSVG from '@/assets/svgs/page.svg';
import SettingsSVG from '@/assets/svgs/settings.svg';
import WelcomeSVG from '@/assets/svgs/welcome.svg';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';

export default function MoreScreen() {
  return (
    <ThemedSafeAreaView style={styles.container}>
      <ThemedButton onPress={() => router.push('/settings')} variant="primary">
        <View style={styles.buttonContent}>
          <SettingsSVG width={24} height={24} />
          <Text style={styles.buttonText}>الإعدادات</Text>
        </View>
      </ThemedButton>
      <ThemedButton onPress={() => router.push('/privacy')} variant="primary">
        <View style={styles.buttonContent}>
          <PageSVG width={24} height={24} />
          <Text style={styles.buttonText}>سياسة الخصوصية</Text>
        </View>
      </ThemedButton>
      <ThemedButton onPress={() => router.push('/contact')} variant="primary">
        <View style={styles.buttonContent}>
          <MailSVG width={24} height={24} />
          <Text style={styles.buttonText}>تواصل معنا</Text>
        </View>
      </ThemedButton>
      <ThemedButton variant="primary" onPress={() => router.push('/tutorial')}>
        <View style={styles.buttonContent}>
          <WelcomeSVG width={24} height={24} />
          <Text style={styles.buttonText}>جولة تعليمة</Text>
        </View>
      </ThemedButton>
      <ThemedButton onPress={() => router.push('/about')} variant="primary">
        <View style={styles.buttonContent}>
          <InfoSVG width={24} height={24} />
          <Text style={styles.buttonText}>حول التطبيق</Text>
        </View>
      </ThemedButton>
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 150,
  },
  buttonText: { marginStart: 5, marginEnd: 5 },
});
