import { Pressable, StyleSheet } from 'react-native';

import { useSetRecoilState } from 'recoil';

import { ExternalLink } from '@/components/ExternalLink';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TopMenu from '@/components/TopMenu';
import { version } from '@/package.json'; // Importing version from package.json
import { topMenuState } from '@/recoil/atoms';

export default function AboutScreen() {
  const setShowTopMenu = useSetRecoilState(topMenuState);

  return (
    <ThemedView style={styles.container}>
      <Pressable onPress={() => setShowTopMenu(true)}>
        <TopMenu />
        <ThemedView style={styles.mainContent}>
          <ThemedText type="title" style={styles.title}>
            المصادر
          </ThemedText>
          <ThemedView style={styles.listContainer}>
            {[
              {
                text: 'صفحات المصحف من ',
                link: 'https://qurancomplex.gov.sa/techquran/dev/',
                label: 'مجمع الملك فهد لطباعة المصحف الشريف',
              },
              {
                text: 'قاعدة البيانات (JSON) من ',
                link: 'https://github.com/Zizwar/mushaf-mauri',
                label: 'Mushaf-mauri',
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
            ].map(({ text, link, label }, index) => (
              <ThemedView style={styles.listItem} key={index}>
                <ThemedText style={styles.bullet}>•</ThemedText>
                <ThemedText style={styles.listText}>
                  {text}
                  <ExternalLink href={link} style={styles.link}>
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
            {[
              'الوصول إلى المصحف دون اتصال بالإنترنت.',
              'خيارات متعددة للتفسير.',
              'تنقل سلس بين السور والأجزاء.',
              'صور عالية الجودة من مجمع الملك فهد لطباعة المصحف الشريف.',
            ].map((feature, index) => (
              <ThemedView style={styles.listItem} key={index}>
                <ThemedText style={styles.bullet}>•</ThemedText>
                <ThemedText style={styles.listText}>{feature}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
          <ThemedText style={styles.copyright}>
            © {new Date().getFullYear()} Open-Mushaf. جميع الحقوق محفوظة.
          </ThemedText>
          <ThemedText style={styles.versionText}>الإصدار: {version}</ThemedText>
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bullet: {
    marginRight: 10,
    fontWeight: '500',
  },
  listText: {
    fontSize: 16,
    lineHeight: 22,
  },
  link: {
    color: '#1E90FF', // Ensuring good contrast for dark mode
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
