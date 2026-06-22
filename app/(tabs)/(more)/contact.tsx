import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { ContactForm, Seo, ThemedView } from '@/components';

export default function Contact() {
  return (
    <ThemedView style={styles.container}>
      <Seo
        title="المصحف المفتوح - تواصل بنا"
        description="تواصل معنا عبر نموذج الاتصال للاستفسارات والاقتراحات"
      />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ContactForm />
      </KeyboardAvoidingView>
    </ThemedView>
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
  keyboardAvoid: {
    flex: 1,
    width: '100%',
  },
});
