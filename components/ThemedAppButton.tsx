import React from 'react';

import { globalStyles } from '@/constants';
import { ThemedAppButtonProps } from '@/types';

import { ThemedIcon } from './ThemedIcon';
import { ThemedText } from './ThemedText';
import { ThemedTouchable } from './ThemedTouchable';

export function ThemedAppButton({
  style,
  title = '',
  icon,
  variant = 'default',
  disabled = false,
  onPress,
  ...rest
}: ThemedAppButtonProps) {
  return (
    <ThemedTouchable
      style={style}
      variant={variant}
      disabled={disabled}
      onPress={onPress}
    >
      {!!title && (
        <ThemedText style={globalStyles.buttonTitle}>{title}</ThemedText>
      )}
      {icon && (
        <ThemedIcon
          icon={icon}
          variant={variant}
          disabled={disabled}
          {...rest}
        />
      )}
    </ThemedTouchable>
  );
}
