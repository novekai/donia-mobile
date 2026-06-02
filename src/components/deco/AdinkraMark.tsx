// AdinkraMark — motif culturel ouest-africain (cercle + croix + centre)
// Source : _prototype/donia/project/direction-c.jsx:83-92
import React from 'react';
import { ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSpin } from '../../theme/animations';

type Props = {
  size?: number;
  color?: string;
  innerColor?: string;
  animate?: boolean;
  reverse?: boolean;
  delay?: number;
  style?: ViewStyle;
};

export function AdinkraMark({
  size = 40,
  color = '#41087B',
  innerColor = '#FDF7F6',
  animate = false,
  reverse = true,
  delay = 0,
  style,
}: Props) {
  const animStyle = useSpin({ reverse, delay: delay * 1000, duration: 80000 });
  const content = (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Circle cx="20" cy="20" r="18" stroke={color} strokeWidth="1.2" fill="none" />
      <Path d="M20 6 L20 34 M6 20 L34 20" stroke={color} strokeWidth="1.2" />
      <Circle cx="20" cy="20" r="6" fill={color} />
      <Circle cx="20" cy="20" r="2" fill={innerColor} />
    </Svg>
  );
  if (!animate) return <Animated.View style={[{ width: size, height: size }, style]}>{content}</Animated.View>;
  return <Animated.View style={[{ width: size, height: size }, animStyle, style]}>{content}</Animated.View>;
}
