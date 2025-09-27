import React, { useEffect } from 'react';

import { Slider } from 'react-native-awesome-slider';
import { useSharedValue, withTiming } from 'react-native-reanimated';

type Props = {
  value: number;
  onValueChange: (value: number) => void;
  primaryColor: string;
};

export default function AwesomeSlider({
  value,
  onValueChange,
  primaryColor,
}: Props) {
  const progress = useSharedValue(value);
  const min = useSharedValue(0.3);
  const max = useSharedValue(1);

  // Enhanced smooth transitions with Reanimated 4 timing
  useEffect(() => {
    progress.value = withTiming(value, {
      duration: 150,
      easing: 'ease-out',
    });
  }, [value, progress]);

  return (
    <Slider
      progress={progress}
      minimumValue={min}
      maximumValue={max}
      onValueChange={onValueChange}
      theme={{
        minimumTrackTintColor: primaryColor,
        //maximumTrackTintColor: primaryLightColor,
        bubbleBackgroundColor: primaryColor,
      }}
    />
  );
}
