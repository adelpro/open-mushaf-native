import { ButtonColors, ButtonVariant } from '@/types';

import { buttonVariantStyles } from './buttonVariantStyles';

export function getButtonVariantStyles(
  variant: ButtonVariant,
  colors: ButtonColors,
) {
  const matchingVariant = Object.entries(buttonVariantStyles).find(
    ([key]) => key === variant,
  );
  const [, variantStyleFactory] = matchingVariant ?? [];

  return (variantStyleFactory ?? buttonVariantStyles.default)(colors);
}
