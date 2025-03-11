import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHydrateAtoms } from 'jotai/utils';

import { useColors } from '@/hooks/useColors';
import {
  currentAppVersion,
  finishedTutorial,
  MushafRiwaya,
} from '@/jotai/atoms';

interface HydrationProviderProps {
  children: React.ReactNode;
}

const HydrationProvider: React.FC<HydrationProviderProps> = ({ children }) => {
  const [initialAtoms, setInitialAtoms] = useState<[any, any][] | null>(null);
  const { primaryColor } = useColors();
  useEffect(() => {
    (async () => {
      const appVersion = await AsyncStorage.getItem('CurrentAppVersion');
      const tutorial = await AsyncStorage.getItem('FinishedTutorial');
      const mushaf = await AsyncStorage.getItem('MushafRiwaya');

      setInitialAtoms([
        [currentAppVersion, appVersion ? JSON.parse(appVersion) : undefined],
        [finishedTutorial, tutorial ? JSON.parse(tutorial) : false],
        [MushafRiwaya, mushaf ? JSON.parse(mushaf) : undefined],
      ]);
    })();
  }, []);
  useHydrateAtoms(initialAtoms ?? []);

  if (!initialAtoms)
    return <ActivityIndicator size="large" color={primaryColor} />;

  return <>{children}</>;
};

export default HydrationProvider;
