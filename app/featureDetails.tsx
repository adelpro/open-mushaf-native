import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Stack, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components';
import { SLIDES } from '@/constants';
import { useColors } from '@/hooks';

export default function FeatureDetails() {
  const { slideId } = useLocalSearchParams<{ slideId: string }>();
  const { primaryLightColor } = useColors();

  const slide = SLIDES[Number(slideId) - 1];

  return (
    <>
      <Stack.Screen options={{ title: slide.title }} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {slide.details?.map((item, index) => {
          return (
            <View key={index} style={styles.itemContainer}>
              <View
                style={[styles.dot, { backgroundColor: primaryLightColor }]}
              />
              <ThemedText style={styles.text}>{item.text}</ThemedText>
            </View>
          );
        })}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 30,
    paddingHorizontal: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 15,
    maxWidth: '95%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8 / 2,
  },
  text: {
    marginTop: -7,
    textAlign: 'left',
  },
});
