// GiftGlyph — icône cadeau (style Lucide)
// Source : _prototype/donia/project/direction-c.jsx:94-104
import React from 'react';
import Svg, { Polyline, Rect, Line, Path } from 'react-native-svg';

type Props = {
  size?: number;
  stroke?: string;
  strokeWidth?: number;
};

export function GiftGlyph({ size = 30, stroke = '#FDF7F6', strokeWidth = 1.6 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="20 12 20 22 4 22 4 12" />
      <Rect x="2" y="7" width="20" height="5" />
      <Line x1="12" y1="22" x2="12" y2="7" />
      <Path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7Z" />
      <Path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z" />
    </Svg>
  );
}
