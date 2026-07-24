import { Redirect } from 'expo-router';
import { useAtomValue } from 'jotai/react';

import { firstLaunchDone } from '@/jotai/atoms';
import { getInitialRoute } from '@/utils';

export default function Index() {
  const done = useAtomValue(firstLaunchDone);

  return <Redirect href={getInitialRoute(done)} />;
}
