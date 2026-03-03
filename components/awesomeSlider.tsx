import React, { useEffect } from 'react';

import { Slider } from 'react-native-awesome-slider';
import { useSharedValue } from 'react-native-reanimated';

type Props = {
  value: number;
  onValueChange: (value: number) => void;
  primaryColor: string;
  minValue?: number;
  maxValue?: number;
};

export default function AwesomeSlider({
  value,
  onValueChange,
  primaryColor,
  minValue = 0.3,
  maxValue = 1,
}: Props) {
  const progress = useSharedValue(value);
  const min = useSharedValue(minValue);
  const max = useSharedValue(maxValue);

  useEffect(() => {
    progress.value = value;
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
