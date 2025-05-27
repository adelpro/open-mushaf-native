import { Platform } from 'react-native';

import { Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';

import { ExternalLinkType } from '@/types';

type Props = Omit<React.ComponentProps<typeof Link>, 'href'> & {
  href: ExternalLinkType;
};

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
