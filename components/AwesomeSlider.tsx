import React, { useEffect } from 'react';

import { Slider } from 'react-native-awesome-slider';
import { useSharedValue } from 'react-native-reanimated';

/**
 * Props for the AwesomeSlider component.
 */
type Props = {
  /** The current value of the slider. */
  value: number;
  /** Callback invoked when the slider value changes. */
  onValueChange: (value: number) => void;
  /** The primary theme color applied to the slider track and bubble. */
  primaryColor: string;
  /** The minimum allowed value (defaults to 0.3). */
  minimumValue?: number;
  /** The maximum allowed value (defaults to 1.0). */
  maximumValue?: number;
};

/**
 * A customized slider component utilizing Reanimated for smooth performance.
 *
 * @param props - Configuration properties defined in `Props`.
 * @returns A fully functional, themed Slider component.
 */
export function AwesomeSlider({
  value,
  onValueChange,
  primaryColor,
  minimumValue = 0.3,
  maximumValue = 1.0,
}: Props) {
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
