import { StyleSheet } from 'react-native';

import ContactForm from '@/components/ContactForm';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';

export default function ContactScreen() {
  return (
    <ThemedSafeAreaView style={styles.container}>
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
