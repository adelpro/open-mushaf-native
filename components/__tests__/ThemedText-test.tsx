import * as React from 'react';

import renderer from 'react-test-renderer';
import { describe, expect, it } from 'vitest';

import { ThemedText } from '../ThemedText';

describe('ThemedText', () => {
  it(`renders correctly`, () => {
    const tree = renderer
      .create(<ThemedText>Snapshot test!</ThemedText>)
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
