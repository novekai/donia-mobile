// Sparkle — étoile 4 branches
// Path exact extrait de _prototype/donia/project/direction-c.jsx:10-16
import React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTwinkle } from '../../theme/animations';

type Props = {
  size?: number;
  color?: string;
  delay?: number;
  animate?: boolean;
  style?: ViewStyle;
};

export function Sparkle({ size = 18, color = '#F9A01C', delay = 0, animate = true, style }: Props) {
  const animStyle = useTwinkle({ delay: delay * 1000 });
  if (!animate) {
    return (
      <View style={[{ width: size, height: size }, style]}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 0 L13.5 9 L24 12 L13.5 15 L12 24 L10.5 15 L0 12 L10.5 9 Z" fill={color} />
        </Svg>
      </View>
    );
  }
  return (
    <Animated.View style={[{ width: size, height: size }, animStyle, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M12 0 L13.5 9 L24 12 L13.5 15 L12 24 L10.5 15 L0 12 L10.5 9 Z" fill={color} />
      </Svg>
    </Animated.View>
  );
}
