import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks';

export function SearchSkeleton() {
  const { tintColor } = useColors();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 800 }),
        withTiming(0.4, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <ThemedView
      style={[styles.item, { borderBottomColor: 'rgba(0,0,0,0.05)' }]}
    >
      <View style={styles.header}>
        <Animated.View
          style={[
            {
              width: 120,
              height: 18,
              borderRadius: 4,
              backgroundColor: tintColor,
            },
            animatedStyle,
          ]}
        />
      </View>
      <View style={{ width: '100%', paddingVertical: 12, gap: 10 }}>
        <Animated.View
          style={[
            {
              width: '100%',
              height: 22,
              borderRadius: 4,
              backgroundColor: tintColor,
            },
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              width: '70%',
              height: 22,
              borderRadius: 4,
              backgroundColor: tintColor,
            },
            animatedStyle,
          ]}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'column',
    alignItems: 'flex-start',
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
