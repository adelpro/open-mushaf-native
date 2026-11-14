import { ExternalLink } from './ExternalLink';
import { privacyArabic } from './privacy/arabic';
import { styles } from './PrivacyContentArabic.styles';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export function PrivacyContentArabic() {
  return (
    <ThemedView style={[styles.container]}>
      {privacyArabic.map(({ style, text }, index) => {
        return (
          <ThemedText key={index} style={[styles[style], styles.arabicText]}>
            {text}
          </ThemedText>
        );
      })}
      <ExternalLink
        href={'https://adelpro.github.io/open-mushaf/privacy-policy-ar.html'}
        style={[styles.linkContainer]}
      >
        <ThemedText style={[styles.link, styles.arabicText]}>
          سياسة الخصوصية (الرابط)
        </ThemedText>
      </ExternalLink>
    </ThemedView>
  );
}
