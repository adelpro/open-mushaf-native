import { Platform } from 'react-native';

import { Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';

type Props = Omit<React.ComponentProps<typeof Link>, 'href'> & {
  href: `http${string}`;
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
