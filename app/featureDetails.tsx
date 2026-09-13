import React from 'react';

import { Stack, useLocalSearchParams } from 'expo-router';

import { SLIDES } from '@/constants';

export default function FeatureDetails() {
  const { slideId } = useLocalSearchParams<{ slideId: string }>();

  const slide = SLIDES[Number(slideId) - 1];

  return <Stack.Screen options={{ title: slide.title }} />;
}
