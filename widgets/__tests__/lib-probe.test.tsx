import { FlexWidget } from 'react-native-android-widget';
import { describe, expect, it } from 'vitest';

describe('library probe', () => {
  it('imports react-native-android-widget', () => {
    expect(typeof FlexWidget).toBeDefined();
  });
});
