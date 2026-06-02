// Squiggle — vague ondulée décorative
// Source : _prototype/donia/project/direction-c.jsx:18-24
import React from 'react';
import { ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useWaveX } from '../../theme/animations';

type Props = {
  width?: number;
  color?: string;
  strokeWidth?: number;
  animate?: boolean;
  delay?: number;
  style?: ViewStyle;
};

export function Squiggle({
  width = 80,
  color = '#41087B',
  strokeWidth = 2.2,
  animate = true,
  delay = 0,
  style,
}: Props) {
  const animStyle = useWaveX({ delay: delay * 1000 });
  const h = width * 0.3;
  const content = (
    <Svg width={width} height={h} viewBox="0 0 100 30" fill="none">
      <Path
        d="M2 15 Q 15 2, 28 15 T 54 15 T 80 15 T 98 15"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
  if (!animate) return <Animated.View style={[{ width, height: h }, style]}>{content}</Animated.View>;
  return <Animated.View style={[{ width, height: h }, animStyle, style]}>{content}</Animated.View>;
}
