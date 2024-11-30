declare module 'react-native-toggle-input' {
  import React from 'react';
  import { ViewProps } from 'react-native';

  interface ToggleProps extends ViewProps {
    color?: string; // Color of the toggle
    size?: number; // Size of the toggle
    filled?: boolean; // Whether the toggle is filled
    circleColor?: string; // Color of the circle inside the toggle
    toggle: boolean; // Current toggle state
    setToggle: (value: boolean) => void; // Function to change the toggle state
    onTrue?: () => void; // Callback when toggled to true
    onFalse?: () => void; // Callback when toggled to false
  }

  const Toggle: React.FC<ToggleProps>;
  export default Toggle;
}
