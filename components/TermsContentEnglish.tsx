import React from 'react';
import {
  Linking,
  Pressable,
  type StyleProp,
  StyleSheet,
  type TextStyle,
  useColorScheme,
  View,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import type { ExternalLinkType } from '@/types';

import { ExternalLink } from './ExternalLink';
import { ThemedText } from './ThemedText';

/**
 * Discriminated block shapes used to lay out the Terms of Service.
 *
 * `heading` opens a numbered section, `paragraph` is a standalone claim, and
 * `list` renders a bulleted enumeration inside the section above it.
 */
type TermsBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'privacyLink' };

/** Opening metadata kept apart from the numbered sections. */
const LAST_UPDATED = 'Last updated: November 6, 2026';

/** Terms body, in the publisher's own wording. */
const TERMS_BLOCKS: TermsBlock[] = [
  { type: 'heading', text: '1. About Quran.us.kg' },
  {
    type: 'paragraph',
    text: 'Quran.us.kg is an independent technology project operated by adelpro (Adel Benyahia). It provides digital tools and services designed to make the Quran more accessible through technology.',
  },
  {
    type: 'paragraph',
    text: 'These services may include websites, search engines, APIs, MCP servers, applications, integrations, and other software or resources published under the Quran.us.kg domain.',
  },
  {
    type: 'paragraph',
    text: 'These Terms apply to all services provided through Quran.us.kg unless a specific service has additional terms that expressly override or supplement them.',
  },
  {
    type: 'paragraph',
    text: 'By accessing or using our services, you agree to these Terms.',
  },

  { type: 'heading', text: '2. Acceptable Use' },
  {
    type: 'paragraph',
    text: 'You may use our services for personal, educational, research, development, and other lawful purposes.',
  },
  { type: 'paragraph', text: 'You agree not to:' },
  {
    type: 'list',
    items: [
      'Use our services for unlawful activities.',
      'Attempt to gain unauthorized access to our systems or infrastructure.',
      'Disrupt, overload, or interfere with the availability or security of our services.',
      'Abuse APIs, MCP servers, or other endpoints in ways that negatively affect other users.',
      'Circumvent reasonable technical restrictions or usage limits.',
      'Misrepresent our services, content, or outputs.',
    ],
  },
  {
    type: 'paragraph',
    text: 'We reserve the right to restrict access when necessary to protect our infrastructure and users.',
  },

  { type: 'heading', text: '3. Quranic Content and Accuracy' },
  {
    type: 'paragraph',
    text: 'Our services may provide Quranic text, translations, transliterations, recitation resources, search results, metadata, and other Quran-related information.',
  },
  {
    type: 'paragraph',
    text: 'We aim to provide reliable references and accurate information. However, errors, omissions, formatting differences, or limitations may occur.',
  },
  {
    type: 'paragraph',
    text: 'Users should verify important Quranic references against a trusted Mushaf and consult qualified scholars for religious interpretation and rulings.',
  },
  {
    type: 'paragraph',
    text: 'Our digital tools are not a substitute for scholarly guidance and do not issue authoritative fatwas.',
  },
  {
    type: 'paragraph',
    text: 'Translations, interpretations, and other supplementary materials may have their own authors, sources, and licensing conditions.',
  },

  { type: 'heading', text: '4. Intellectual Property and Licensing' },
  {
    type: 'paragraph',
    text: 'The Quran.us.kg project includes software, documentation, interfaces, and other materials that may be distributed under different licenses.',
  },
  {
    type: 'paragraph',
    text: 'Open-source components remain subject to their respective licenses. Third-party datasets, translations, audio recordings, and other resources remain subject to the rights and terms of their respective owners.',
  },
  {
    type: 'paragraph',
    text: 'Nothing in these Terms transfers ownership of third-party materials or claims ownership of the Quran itself.',
  },
  {
    type: 'paragraph',
    text: 'Users are responsible for respecting applicable licenses and attribution requirements when reusing materials.',
  },

  { type: 'heading', text: '5. APIs, MCP Servers, and Integrations' },
  {
    type: 'paragraph',
    text: 'Some services may be accessible through APIs, MCP servers, AI assistants, or third-party applications.',
  },
  {
    type: 'paragraph',
    text: 'Access to these services is subject to the following conditions:',
  },
  {
    type: 'list',
    items: [
      'Use integrations responsibly and within any published usage limits.',
      'Do not use automated access to disrupt service availability.',
      'Do not assume that third-party AI-generated responses are authoritative or error-free.',
      'Respect the terms and policies of the applications and platforms through which you access our services.',
    ],
  },
  {
    type: 'paragraph',
    text: 'We may change API behavior, available tools, endpoints, or usage limits as the project evolves.',
  },

  { type: 'heading', text: '6. Third-Party Services' },
  {
    type: 'paragraph',
    text: 'Our services may reference, integrate with, or depend on third-party websites, applications, datasets, infrastructure, or software.',
  },
  {
    type: 'paragraph',
    text: 'Third-party services are governed by their own terms and privacy policies. We do not control and are not responsible for their content, availability, or practices.',
  },

  { type: 'heading', text: '7. Availability and Modifications' },
  {
    type: 'paragraph',
    text: 'We aim to maintain accessible and reliable services, but uninterrupted availability cannot be guaranteed.',
  },
  {
    type: 'paragraph',
    text: 'We reserve the right to modify, suspend, discontinue, or restrict any service or feature, temporarily or permanently, without prior notice when necessary.',
  },

  { type: 'heading', text: '8. Privacy' },
  {
    type: 'paragraph',
    text: 'Your use of our services is also subject to our Privacy Policy, which explains how information is handled.',
  },
  { type: 'privacyLink' },

  { type: 'heading', text: '9. Disclaimer and Limitation of Liability' },
  {
    type: 'paragraph',
    text: 'Our services are provided on an "as is" and "as available" basis, to the extent permitted by applicable law.',
  },
  {
    type: 'paragraph',
    text: 'We make no guarantees that services will always be available, error-free, complete, or suitable for every purpose.',
  },
  {
    type: 'paragraph',
    text: 'To the extent permitted by applicable law, adelpro and the project maintainers shall not be liable for indirect, incidental, special, or consequential damages arising from the use of, or inability to use, our services.',
  },
  {
    type: 'paragraph',
    text: 'Nothing in these Terms excludes liability that cannot legally be excluded.',
  },

  { type: 'heading', text: '10. Changes to These Terms' },
  {
    type: 'paragraph',
    text: 'We may update these Terms as Quran.us.kg evolves.',
  },
  {
    type: 'paragraph',
    text: 'Any revised version will be published on this page with an updated revision date. Continued use of our services after changes take effect constitutes acceptance of the revised Terms, to the extent permitted by applicable law.',
  },

  { type: 'heading', text: '11. Contact' },
  {
    type: 'paragraph',
    text: 'For questions, feedback, or legal requests concerning these Terms or our services, contact:',
  },
];

/** One labelled contact line, with the value either linked or plain. */
type ContactRowProps = {
  label: string;
  value: string;
  linkColor: string;
  onPress?: () => void;
  href?: ExternalLinkType;
};

function ContactRow({
  label,
  value,
  linkColor,
  onPress,
  href,
}: ContactRowProps) {
  const isLink = Boolean(href || onPress);
  const valueStyle: StyleProp<TextStyle> = [
    styles.contactValue,
    styles.englishText,
    isLink ? { color: linkColor } : undefined,
    isLink ? styles.link : undefined,
  ];

  return (
    <View style={styles.contactRow}>
      <ThemedText
        type="defaultSemiBold"
        style={[styles.contactLabel, styles.englishText]}
      >
        {label}
      </ThemedText>
      {href ? (
        <ExternalLink href={href} style={styles.contactLink}>
          <ThemedText style={valueStyle}>{value}</ThemedText>
        </ExternalLink>
      ) : onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="link"
          accessibilityLabel={`${label}: ${value}`}
          hitSlop={8}
        >
          {({ pressed }) => (
            <ThemedText style={[valueStyle, pressed && styles.linkPressed]}>
              {value}
            </ThemedText>
          )}
        </Pressable>
      ) : (
        <ThemedText style={valueStyle}>{value}</ThemedText>
      )}
    </View>
  );
}

/**
 * Full text of the Quran.us.kg Terms of Service, laid out as a readable legal
 * document. The document is written in English, so it is forced to a
 * left-to-right direction inside the otherwise right-to-left application.
 *
 * @returns The scrollable terms body, including the contact block.
 */
export function TermsContentEnglish() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const linkColor = palette.tint;

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.title, styles.englishText]}>
        Terms of Service
      </ThemedText>
      <ThemedText
        style={[styles.updated, styles.englishText, { color: palette.icon }]}
      >
        {LAST_UPDATED}
      </ThemedText>

      {TERMS_BLOCKS.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === 'heading') {
          return (
            <ThemedText key={key} style={[styles.heading, styles.englishText]}>
              {block.text}
            </ThemedText>
          );
        }

        if (block.type === 'list') {
          return (
            <View key={key} style={styles.list}>
              {block.items.map((item) => (
                <View key={item} style={styles.listItem}>
                  <View
                    style={[styles.bullet, { backgroundColor: palette.icon }]}
                  />
                  <ThemedText style={[styles.listText, styles.englishText]}>
                    {item}
                  </ThemedText>
                </View>
              ))}
            </View>
          );
        }

        if (block.type === 'privacyLink') {
          return (
            <ExternalLink
              key={key}
              href="https://quran.us.kg/privacy"
              style={styles.standaloneLink}
            >
              <ThemedText
                style={[styles.link, styles.englishText, { color: linkColor }]}
              >
                Read our Privacy Policy
              </ThemedText>
            </ExternalLink>
          );
        }

        return (
          <ThemedText key={key} style={[styles.paragraph, styles.englishText]}>
            {block.text}
          </ThemedText>
        );
      })}

      <ContactRow
        label="Publisher"
        value="adelpro (Adel Benyahia)"
        linkColor={linkColor}
      />
      <ContactRow
        label="Email"
        value="adelpro@gmail.com"
        linkColor={linkColor}
        onPress={() => {
          void Linking.openURL('mailto:adelpro@gmail.com');
        }}
      />
      <ContactRow
        label="Website"
        value="https://quran.us.kg"
        linkColor={linkColor}
        href="https://quran.us.kg"
      />
      <ContactRow
        label="Contact page"
        value="https://quran.us.kg/contact"
        linkColor={linkColor}
        href="https://quran.us.kg/contact"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    direction: 'ltr',
    width: '100%',
  },
  englishText: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  title: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 32,
    lineHeight: 32,
  },
  updated: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  heading: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 20,
    lineHeight: 25,
    marginTop: 32,
    marginBottom: 10,
  },
  paragraph: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  list: {
    marginBottom: 12,
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    gap: 10,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 10,
  },
  listText: {
    flex: 1,
    fontFamily: 'Tajawal_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  link: {
    textDecorationLine: 'underline',
  },
  linkPressed: {
    opacity: 0.6,
  },
  standaloneLink: {
    marginTop: 4,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  contactRow: {
    marginBottom: 10,
    gap: 2,
  },
  contactLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  contactValue: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  contactLink: {
    alignSelf: 'flex-start',
  },
});
