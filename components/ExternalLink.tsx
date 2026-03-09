import { Platform } from 'react-native';

import { Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';

import { ExternalLinkType } from '@/types';

/**
 * Props for the ExternalLink component, forwarding Expo Router Link props.
 */
type Props = Omit<React.ComponentProps<typeof Link>, 'href'> & {
  /** The external URL to navigate to. */
  href: ExternalLinkType;
};

/**
 * A customized deep-link wrapper enforcing external navigation.
 * Bypasses in-app routing on native platforms to explicitly invoke the system's external web browser.
 *
 * @param props - Custom props mapping including the underlying `href`.
 * @returns A safe, interceptable anchor block tailored for handling external pathways.
 */
export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href as any}
      onPress={async (event) => {
        if (Platform.OS !== 'web') {
          event.preventDefault();
          await openBrowserAsync(href);
        }
      }}
    />
  );
}
