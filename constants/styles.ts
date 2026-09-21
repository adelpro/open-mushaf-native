import { StyleSheet } from 'react-native';

import { fontNames } from './fontNames';

export const LIST_HORIZONTAL_SPACE = 10;

export const globalStyles = StyleSheet.create({
  buttonTitle: {
    fontFamily: fontNames.medium,
    fontSize: 20,
    marginTop: 5,
    lineHeight: 25,
  },
});
