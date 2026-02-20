import React, { useEffect } from 'react';

import { Slider } from 'react-native-awesome-slider';
import { useSharedValue } from 'react-native-reanimated';

type AwesomeSliderProps = {
  value: number;
  onValueChange: (value: number) => void;
  primaryColor: string;
  minimumValue?: number;
  maximumValue?: number;
};

export function AwesomeSlider({
  value,
  onValueChange,
  primaryColor,
  minimumValue = 0.3,
  maximumValue = 1.0,
}: AwesomeSliderProps) {
  const progress = useSharedValue(value);
  const min = useSharedValue(minimumValue);
  const max = useSharedValue(maximumValue);

  useEffect(() => {
    progress.value = value;
  }, [value, progress]);

  useEffect(() => {
    min.value = minimumValue;
    max.value = maximumValue;
  }, [minimumValue, maximumValue, min, max]);

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
