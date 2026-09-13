import { ImageSourcePropType } from 'react-native';

import { AppFeature } from './AppFeature';

export interface OnBoardingSlide {
  id: number;
  title: string;
  description: string;
  image: ImageSourcePropType;
  details?: AppFeature[];
}
