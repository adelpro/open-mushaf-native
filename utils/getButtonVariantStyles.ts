import { ButtonColors, ButtonVariant } from '@/types';

import { buttonVariantStyleMap } from './buttonVariantStyleMap';

export function getButtonVariantStyles(
  variant: ButtonVariant,
  colors: ButtonColors,
) {
  const matchingVariant = Object.entries(buttonVariantStyleMap).find(
    ([key]) => key === variant,
  );
  const [, variantStyleFactory] = matchingVariant ?? [];

  return (variantStyleFactory ?? buttonVariantStyleMap.default)(colors);
}
