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
