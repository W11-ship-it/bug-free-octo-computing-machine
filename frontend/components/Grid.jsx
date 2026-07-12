'use client';

import { memo } from 'react';

const Row = memo(function Row({ gutter = 16, children, style }) {
  return <div style={{ display: 'flex', gap: `${gutter}px`, ...style }}>{children}</div>;
});

const Col = memo(function Col({ span, children }) {
  return <div style={{ flex: `0 0 ${(span / 24) * 100}%`, maxWidth: `${(span / 24) * 100}%` }}>{children}</div>;
});

export { Row, Col };