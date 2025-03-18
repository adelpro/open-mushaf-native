import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { isRTL } from '@/utils';

import { ExternalLink } from './ExternalLink';

export default function PrivacyContentEnglish() {
  return (
    <ThemedView style={[styles.container]}>
      <ThemedText style={[styles.title, styles.englishText]}>
        Open Mushaf Privacy Policy
      </ThemedText>
      <ThemedText style={[styles.content, styles.englishText]}>
        Effective Date: September 26, 2024
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.englishText]}>
        Your Privacy Matters
      </ThemedText>
      <ThemedText style={[styles.content, styles.englishText]}>
        At Open Mushaf, we take your privacy seriously. This policy explains our
        approach to privacy and data collection in the app.
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.englishText]}>
        What Information Do We Collect?
      </ThemedText>
      <ThemedText style={[styles.content, styles.englishText]}>
        Open Mushaf does not collect any personal information or any other data
        from users. The app runs completely offline, and no data is transmitted
        from your device.
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.englishText]}>
        Why Do We Not Collect Data?
      </ThemedText>
      <ThemedText style={[styles.content, styles.englishText]}>
        Our primary goal is to provide a seamless, offline experience for users.
        Since the app functions offline, there is no need to collect any data
        for analytics, performance monitoring, or any other purpose.
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.englishText]}>
        We Respect Your Child's Privacy
      </ThemedText>
      <ThemedText style={[styles.content, styles.englishText]}>
        Open Mushaf is designed for children aged 6 and above who can read
        Arabic. We are committed to protecting children's privacy. Since our app
        does not collect any data, children's information is completely safe.
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.englishText]}>
        Keeping Your Data Secure
      </ThemedText>
      <ThemedText style={[styles.content, styles.englishText]}>
        Since we do not collect any data, there is no personal information to
        protect. However, we still prioritize app security to ensure a safe user
        experience by regularly monitoring the app for potential
        vulnerabilities.
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.englishText]}>
        We Don't Share Your Data
      </ThemedText>
      <ThemedText style={[styles.content, styles.englishText]}>
        As Open Mushaf collects no data, there is nothing to share with third
        parties. Your privacy is fully protected.
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.englishText]}>
        Your Privacy Rights
      </ThemedText>
      <ThemedText style={[styles.content, styles.englishText]}>
        Since no personal data is collected, there is no need for data deletion
        requests or management of personal information within the app.
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.englishText]}>
        Third-Party Services
      </ThemedText>
      <ThemedText style={[styles.content, styles.englishText]}>
        Open Mushaf does not use any third-party services for analytics,
        tracking, or data collection. The app runs entirely on your device
        without sending any information externally.
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.englishText]}>
        Updates to this Policy
      </ThemedText>
      <ThemedText style={[styles.content, styles.englishText]}>
        We may update this policy periodically. If significant changes are made,
        we will notify users within the app. Continued use of the app signifies
        your acceptance of the updated policy.
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.englishText]}>
        Contact Us
      </ThemedText>
      <ThemedText style={[styles.content, styles.englishText]}>
        If you have any questions about this policy, feel free to contact us at:
      </ThemedText>
      <ThemedText style={[styles.content, styles.englishText]}>
        Email: adelpro@gmail.com
      </ThemedText>
      <ExternalLink
        href={'https://adelpro.github.io/open-mushaf/privacy-policy-ar.html'}
        style={[styles.linkContainer]}
      >
        <ThemedText style={[styles.link, styles.englishText]}>
          Privacy Policy (Link)
        </ThemedText>
      </ExternalLink>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  englishText: {
    textAlign: 'left',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    paddingVertical: 10,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    marginTop: 10,
  },
  link: {
    color: '#1e90ff',
    textDecorationLine: 'underline',
  },

  linkContainer: {
    marginTop: 40,
    marginBottom: 10,
    alignItems: 'center',
    width: '100%',
  },
});
