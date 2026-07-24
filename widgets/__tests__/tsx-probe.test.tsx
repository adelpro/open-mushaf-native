import React from 'react';

import { describe, expect, it } from 'vitest';

describe('tsx probe', () => {
  it('loads a trivial TSX component', () => {
    const Comp = (props: { x: number }) => <div>{props.x}</div>;
    expect(typeof Comp).toBe('function');
  });
});
