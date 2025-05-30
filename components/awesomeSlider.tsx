import React, { useEffect } from 'react';

import { Slider } from 'react-native-awesome-slider';
import { useSharedValue } from 'react-native-reanimated';

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
