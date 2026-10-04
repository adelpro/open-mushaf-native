import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';

import { DeviceMotion, DeviceMotionOrientation } from 'expo-sensors';

const DOT_SIZE = 6;
const DOT_SPACING = 56;
const DOT_EDGE_OFFSET = 14;
const MAX_OFFSET = 24;
const MOTION_SCALE = 14;
const LOW_PASS_ALPHA = 0.22;
const UPDATE_INTERVAL_MS = 50;

type ScreenAcceleration = {
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toScreenAcceleration(
  x: number,
  y: number,
  orientation: DeviceMotionOrientation,
): ScreenAcceleration {
  switch (orientation) {
    case DeviceMotionOrientation.RightLandscape:
      return { x: y, y: x };

    case DeviceMotionOrientation.LeftLandscape:
      return { x: -y, y: -x };

    case DeviceMotionOrientation.UpsideDown:
      return { x: -x, y };

    case DeviceMotionOrientation.Portrait:
    default:
      return { x, y: -y };
  }
}

export function PassengerMotionCuesOverlay() {
  const { height } = useWindowDimensions();
  const colorScheme = useColorScheme();

  const offset = useRef(new Animated.ValueXY()).current;

  const filteredAcceleration = useRef<ScreenAcceleration>({
    x: 0,
    y: 0,
  });

  const [isAvailable, setIsAvailable] = useState(false);

  const verticalDots = useMemo(
    () =>
      Array.from(
        { length: Math.ceil(height / DOT_SPACING) },
        (_, index) => index * DOT_SPACING + DOT_SPACING / 2,
      ),
    [height],
  );

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let cancelled = false;
    let subscription: ReturnType<typeof DeviceMotion.addListener> | undefined;

    const start = async () => {
      try {
        const available = await DeviceMotion.isAvailableAsync();

        if (!available || cancelled) return;

        const currentPermission = await DeviceMotion.getPermissionsAsync();

        const permission = currentPermission.granted
          ? currentPermission
          : await DeviceMotion.requestPermissionsAsync();

        if (!permission.granted || cancelled) return;

        DeviceMotion.setUpdateInterval(UPDATE_INTERVAL_MS);
        setIsAvailable(true);

        subscription = DeviceMotion.addListener(
          ({ acceleration, orientation }) => {
            if (!acceleration) return;

            const screenAcceleration = toScreenAcceleration(
              acceleration.x,
              acceleration.y,
              orientation,
            );

            const previous = filteredAcceleration.current;

            const filtered = {
              x:
                previous.x +
                LOW_PASS_ALPHA * (screenAcceleration.x - previous.x),
              y:
                previous.y +
                LOW_PASS_ALPHA * (screenAcceleration.y - previous.y),
            };

            filteredAcceleration.current = filtered;

            const target = {
              x: clamp(-filtered.x * MOTION_SCALE, -MAX_OFFSET, MAX_OFFSET),
              y: clamp(-filtered.y * MOTION_SCALE, -MAX_OFFSET, MAX_OFFSET),
            };

            Animated.spring(offset, {
              toValue: target,
              damping: 18,
              stiffness: 120,
              mass: 0.8,
              useNativeDriver: true,
            }).start();
          },
        );
      } catch {
        if (!cancelled) {
          setIsAvailable(false);
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      subscription?.remove();

      offset.stopAnimation();

      filteredAcceleration.current = {
        x: 0,
        y: 0,
      };

      offset.setValue({
        x: 0,
        y: 0,
      });
    };
  }, [offset]);

  if (!isAvailable) return null;

  const dotColor = colorScheme === 'dark' ? '#ffffff' : '#111111';

  return (
    <Animated.View
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.overlay,
        {
          transform: offset.getTranslateTransform(),
        },
      ]}
    >
      {verticalDots.map((top) => (
        <View
          key={`left-${top}`}
          style={[
            styles.dot,
            {
              top,
              left: DOT_EDGE_OFFSET,
              backgroundColor: dotColor,
            },
          ]}
        />
      ))}

      {verticalDots.map((top) => (
        <View
          key={`right-${top}`}
          style={[
            styles.dot,
            {
              top,
              right: DOT_EDGE_OFFSET,
              backgroundColor: dotColor,
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    opacity: 0.7,
  },
});
