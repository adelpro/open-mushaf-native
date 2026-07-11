import React from 'react';

import { describe, it } from 'vitest';

describe('tsx probe', () => {
  it('loads a trivial TSX component', async () => {
    const Comp = (props: { x: number }) => <div>{props.x}</div>;
    expect(typeof Comp).toBe('function');
  });
});
