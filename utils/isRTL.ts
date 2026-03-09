import { I18nManager } from 'react-native';

/**
 * Flag indicating if the current layout direction is Right-To-Left (RTL).
 * Evaluates leveraging React Native's I18nManager.
 */
export const isRTL = I18nManager?.isRTL ? true : false;
