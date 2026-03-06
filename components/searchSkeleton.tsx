import React, { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import Animated, {
  type AnimatedStyle,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks';

type SkeletonBarProps = {
  width: number | `${number}%`;
  height: number;
  color: string;
  animatedStyle: AnimatedStyle<ViewStyle>;
};

function SkeletonBar({
  width,
  height,
  color,
  animatedStyle,
}: SkeletonBarProps) {
  return (
    <Animated.View
      style={[
        { width, height, borderRadius: 4, backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

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

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

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
