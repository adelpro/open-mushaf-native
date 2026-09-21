import { FC } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { SvgProps } from 'react-native-svg';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outlined-primary'
  | 'outlined-secondary'
  | 'danger'
  | 'danger-secondary'
  | 'outlined-danger'
  | 'outlined-danger-secondary'
  | 'default';

export interface ButtonColors {
  primaryColor: string;
  secondaryColor: string;
  dangerColor: string;
  dangerLightColor: string;
  backgroundColor?: string;
}

export type ThemedAppButtonProps = {
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
  icon?: FC<SvgProps>;
  iconStyle?: ViewStyle;
  iconSize?: number;
  disabled?: boolean;
  onPress: () => void;
} & (
  | {
      title: string;
      icon?: FC<SvgProps>;
    }
  | {
      title?: string;
      icon: FC<SvgProps>;
    }
);
