import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type Props = {
  show: boolean;
  borderColor: string;
};

export default function GoalBorderOverlay({ show, borderColor }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isVisible || !show) return null;

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={[
        styles.borderOverlay,
        {
          borderColor,
          borderWidth: 3,
          backgroundColor: `${borderColor}5`,
          // @ts-ignore
          boxShadow: `0 0 16px ${borderColor}66`,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  borderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    pointerEvents: 'none',
  },
});
