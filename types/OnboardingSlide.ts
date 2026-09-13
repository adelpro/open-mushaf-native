import { ImageSourcePropType } from 'react-native';

import { AppFeature } from './AppFeature';

export interface OnBoardingSlide {
  title: string;
  description: string;
  image: ImageSourcePropType;
  features?: AppFeature[];
}
