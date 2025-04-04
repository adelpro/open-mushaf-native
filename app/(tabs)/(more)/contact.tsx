import { StyleSheet } from 'react-native';

import ContactForm from '@/components/ContactForm';
import SEO from '@/components/seo';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';

export default function Contact() {
  return (
    <ThemedSafeAreaView style={styles.container}>
      <SEO
        title="المصحف المفتوح - تواصل بنا"
        description="تواصل معنا عبر نموذج الاتصال للاستفسارات والاقتراحات"
      />
      <ContactForm />
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 640,
    margin: 2,
  },
});
