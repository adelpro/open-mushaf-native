import { ExternalLink } from './ExternalLink';
import { privacyEnglish } from './privacy/english';
import { styles } from './PrivacyContentEnglish.styles';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export function PrivacyContentEnglish() {
  return (
    <ThemedView style={[styles.container]}>
      {privacyEnglish.map(({ style, text }, index) => {
        return (
          <ThemedText key={index} style={[styles[style], styles.englishText]}>
            {text}
          </ThemedText>
        );
      })}
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
