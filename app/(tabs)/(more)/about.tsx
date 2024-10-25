import { I18nManager, Pressable, StyleSheet } from 'react-native';

import * as Application from 'expo-application';
import { Href } from 'expo-router';
import { useSetRecoilState } from 'recoil';

import { ExternalLink } from '@/components/ExternalLink';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { topMenuState } from '@/recoil/atoms';

export default function AboutScreen() {
  const setShowTopMenu = useSetRecoilState(topMenuState);
  const appVersion = Application.nativeApplicationVersion ?? 'Unknown';
  const buildVersion = Application.nativeBuildVersion ?? 'Unknown';
  const isRTLAndroid = I18nManager.isRTL;
  console.info(
    `App Version: ${appVersion} (${buildVersion}) - RTL: ${isRTLAndroid}`,
  );
  const sourcesList = [
    {
      text: 'صفحات المصحف من ',
      link: 'https://qurancomplex.gov.sa/techquran/dev/',
      label: 'مجمع الملك فهد لطباعة المصحف الشريف',
    },
    {
      text: 'قاعدة البيانات (JSON)',
      link: 'https://github.com/Zizwar/mushaf-mauri',
      label: 'Zizwar/mushaf-mauri',
    },
    {
      text: 'قاعدة البيانات (JSON)',
      link: 'https://github.com/forabi/aQuran',
      label: 'forabi/aQuran',
    },
    {
      text: 'بيانات التفاسير من ',
      link: 'https://quran.ksu.edu.sa/ayat',
      label: 'آيات',
    },
    {
      text: 'الأيقونة من ',
      link: 'https://www.svgrepo.com/',
      label: 'SVGRepo',
    },
    {
      text: 'صوت تغيير الصفحة',
      link: 'https://pixabay.com',
      label: 'Pixabay',
    },
  ];
  const featuresList = [
    'الوصول إلى المصحف دون اتصال بالإنترنت.',
    'خيارات متعددة للتفسير.',
    'تنقل سلس بين السور والأجزاء.',
    'صور عالية الجودة من مجمع الملك فهد لطباعة المصحف الشريف.',
  ];

  return (
    <ThemedView style={styles.container}>
      <Pressable onPress={() => setShowTopMenu(true)}>
        <ThemedView style={styles.mainContent}>
          <ThemedText type="title" style={styles.title}>
            المصادر
          </ThemedText>
          <ThemedView style={styles.listContainer}>
            {sourcesList.map(({ text, link, label }, index) => (
              <ThemedView style={styles.listItem} key={index}>
                <ThemedText style={styles.bullet}>•</ThemedText>
                <ThemedText style={styles.listText}>
                  {text}&nbsp;
                  <ExternalLink href={link as Href<string>} style={styles.link}>
                    {label}
                  </ExternalLink>
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
          <ThemedText type="title" style={styles.title}>
            الميزات
          </ThemedText>
          <ThemedView style={styles.listContainer}>
            {featuresList.map((feature, index) => (
              <ThemedView style={styles.listItem} key={index}>
                <ThemedText style={styles.bullet}>•</ThemedText>
                <ThemedText style={styles.listText}>{feature}</ThemedText>
              </ThemedView>
            ))}
            <ThemedView style={styles.listItem}>
              <ThemedText style={styles.bullet}>•</ThemedText>
              <ThemedText style={styles.listText}>
                البرنامج مفتوح المصدر:&nbsp;
                <ExternalLink
                  href="https://github.com/adelpro/open-mushaf-native"
                  style={styles.link}
                >
                  open-mushaf-native
                </ExternalLink>
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedText style={styles.copyright}>
            © {new Date().getFullYear()} Open-Mushaf. جميع الحقوق محفوظة.
          </ThemedText>
          <ThemedText style={styles.versionText}>
            الإصدار: {`${appVersion} (${buildVersion})`}
          </ThemedText>
        </ThemedView>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    maxWidth: 600,
    paddingHorizontal: 22,
    alignSelf: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  listContainer: {
    marginBottom: 20,
    paddingLeft: 16,
  },
  listItem: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  bullet: {
    marginRight: 10,
    marginLeft: 5,
    fontWeight: '500',
  },
  listText: {
    fontSize: 16,
    lineHeight: 22,
  },
  link: {
    color: '#1E90FF',
    textDecorationLine: 'underline',
  },
  versionText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },
  copyright: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
});
