import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import * as Linking from 'expo-linking';
import { router } from 'expo-router';

import HelpSVG from '@/assets/svgs/help.svg';
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
    alignItems: 'center',
    width: 300,
    height: 50,
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
});
