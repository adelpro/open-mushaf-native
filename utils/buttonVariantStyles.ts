import type { ButtonVariant } from '@/types';

interface ButtonColors {
  primaryColor: string;
  secondaryColor: string;
  dangerColor: string;
  dangerLightColor: string;
  backgroundColor?: string;
}

export const buttonVariantStyles: Record<
  ButtonVariant,
  (colors: ButtonColors) => {
    backgroundColor?: string;
    borderColor: string;
    color: string;
  }
> = {
  primary: ({ primaryColor }: ButtonColors) => ({
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    color: 'white',
  }),
  secondary: ({ secondaryColor }: ButtonColors) => ({
    backgroundColor: secondaryColor,
    borderColor: secondaryColor,
    color: 'white',
  }),
  'outlined-primary': ({ primaryColor }: ButtonColors) => ({
    borderColor: primaryColor,
    color: primaryColor,
  }),
  'outlined-secondary': ({ secondaryColor }: ButtonColors) => ({
    borderColor: secondaryColor,
    color: secondaryColor,
  }),
  danger: ({ dangerColor }: ButtonColors) => ({
    backgroundColor: dangerColor,
    borderColor: dangerColor,
    color: 'white',
  }),
  'danger-secondary': ({ dangerLightColor }: ButtonColors) => ({
    backgroundColor: dangerLightColor,
    borderColor: dangerLightColor,
    color: 'white',
  }),
  'outlined-danger': ({ dangerColor }: ButtonColors) => ({
    backgroundColor: 'transparent',
    borderColor: dangerColor,
    color: dangerColor,
  }),
  'outlined-danger-secondary': ({ dangerLightColor }: ButtonColors) => ({
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
