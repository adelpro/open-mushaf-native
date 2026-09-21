import type { ButtonColors, ButtonVariant } from '@/types';

export const buttonVariantStyles: Record<
  ButtonVariant,
  (colors: ButtonColors) => {
    backgroundColor?: string;
    borderColor: string;
    color: string;
  }
> = {
  primary: ({ primaryColor }) => ({
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    color: 'white',
  }),
  secondary: ({ secondaryColor }) => ({
    backgroundColor: secondaryColor,
    borderColor: secondaryColor,
    color: 'white',
  }),
  'outlined-primary': ({ primaryColor }) => ({
    borderColor: primaryColor,
    color: primaryColor,
  }),
  'outlined-secondary': ({ secondaryColor }) => ({
    borderColor: secondaryColor,
    color: secondaryColor,
  }),
  danger: ({ dangerColor }) => ({
    backgroundColor: dangerColor,
    borderColor: dangerColor,
    color: 'white',
  }),
  'danger-secondary': ({ dangerLightColor }) => ({
    backgroundColor: dangerLightColor,
    borderColor: dangerLightColor,
    color: 'white',
  }),
  'outlined-danger': ({ dangerColor }) => ({
    backgroundColor: 'transparent',
    borderColor: dangerColor,
    color: dangerColor,
  }),
  'outlined-danger-secondary': ({ dangerLightColor }) => ({
    backgroundColor: 'transparent',
    borderColor: dangerLightColor,
    color: dangerLightColor,
  }),
  default: () => ({
    backgroundColor: 'blue',
    borderColor: 'blue',
    color: 'white',
  }),
};
