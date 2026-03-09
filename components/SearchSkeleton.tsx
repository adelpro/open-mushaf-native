import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { useColors, useSkeletonAnimation } from '@/hooks';

import { SkeletonBar } from './SearchSkeletonBar';

/**
 * An animated placeholder representing the loading state of a search result item.
 * Utilizes the `useSkeletonAnimation` hook for Reanimated opacity pulsing.
 *
 * @returns A structurally identical but blank mocked element.
 */
export function SearchSkeleton() {
  const { tintColor } = useColors();
  const animatedStyle = useSkeletonAnimation();

  return (
    <ThemedView
      style={[styles.item, { borderBottomColor: 'rgba(0,0,0,0.05)' }]}
    >
      <View style={styles.header}>
        <SkeletonBar
          width={120}
          height={18}
          color={tintColor}
          animatedStyle={animatedStyle}
        />
      </View>
      <View style={{ width: '100%', paddingVertical: 12, gap: 10 }}>
        <SkeletonBar
          width="100%"
          height={22}
          color={tintColor}
          animatedStyle={animatedStyle}
        />
        <SkeletonBar
          width="70%"
          height={22}
          color={tintColor}
          animatedStyle={animatedStyle}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 5,
    padding: 15,
    marginHorizontal: 10,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
});
