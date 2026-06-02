// SunRays — 12 rayons radiaux + cercle central
// Tourne en c-spin-slow (60s) ou c-spin-rev (80s)
import React from 'react';
import { ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Line, Circle } from 'react-native-svg';
import { useSpin } from '../../theme/animations';

type Props = {
  size?: number;
  color?: string;
  animate?: boolean;
  reverse?: boolean;
  style?: ViewStyle;
};

export function SunRays({ size = 200, color = '#F9A01C', animate = true, reverse = false, style }: Props) {
  const animStyle = useSpin({ duration: reverse ? 80000 : 60000, reverse });
  const rays = Array.from({ length: 12 });

  const content = (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {rays.map((_, i) => {
        const angle = (i * 360) / 12;
        return (
          <Line
            key={i}
            x1="50"
            y1="50"
            x2="50"
            y2="14"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${angle} 50 50)`}
            opacity={i % 2 ? 0.5 : 0.9}
          />
        );
      })}
      <Circle cx="50" cy="50" r="14" fill={color} />
    </Svg>
  );

  if (!animate) return <Animated.View style={[{ width: size, height: size }, style]}>{content}</Animated.View>;
  return <Animated.View style={[{ width: size, height: size }, animStyle, style]}>{content}</Animated.View>;
}
