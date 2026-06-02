// DotCluster — grappe de 7 cercles
// Source : _prototype/donia/project/direction-c.jsx:26-38
import React from 'react';
import { ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useFloat } from '../../theme/animations';

type Props = {
  color?: string;
  size?: number;
  animate?: boolean;
  delay?: number;
  style?: ViewStyle;
};

export function DotCluster({ color = '#ED4673', size = 50, animate = true, delay = 0, style }: Props) {
  const animStyle = useFloat({ delay: delay * 1000 });
  const content = (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Circle cx="10" cy="10" r="3.5" fill={color} />
      <Circle cx="25" cy="6" r="2.5" fill={color} opacity="0.7" />
      <Circle cx="42" cy="14" r="3" fill={color} />
      <Circle cx="15" cy="28" r="2.5" fill={color} opacity="0.8" />
      <Circle cx="36" cy="34" r="4" fill={color} />
      <Circle cx="8" cy="42" r="2" fill={color} opacity="0.6" />
      <Circle cx="28" cy="44" r="3" fill={color} />
    </Svg>
  );
  if (!animate) return <Animated.View style={[{ width: size, height: size }, style]}>{content}</Animated.View>;
  return <Animated.View style={[{ width: size, height: size }, animStyle, style]}>{content}</Animated.View>;
}
