// ConcentricRings — 4 cercles concentriques (motif soleil/cible)
// Source : _prototype/donia/project/direction-c.jsx:72-81
import React from 'react';
import { ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useSpin, usePulse } from '../../theme/animations';

type AnimType = 'spin' | 'spinRev' | 'pulse' | 'none';

type Props = {
  size?: number;
  color?: string;
  opacity?: number;
  anim?: AnimType;
  delay?: number;
  style?: ViewStyle;
};

export function ConcentricRings({
  size = 200,
  color = '#FBF1DC',
  opacity = 0.18,
  anim = 'none',
  delay = 0,
  style,
}: Props) {
  const spinStyle = useSpin({ delay: delay * 1000 });
  const spinRevStyle = useSpin({ reverse: true, delay: delay * 1000 });
  const pulseStyle = usePulse({ delay: delay * 1000 });

  const animStyle =
    anim === 'spin' ? spinStyle
    : anim === 'spinRev' ? spinRevStyle
    : anim === 'pulse' ? pulseStyle
    : undefined;

  return (
    <Animated.View style={[{ width: size, height: size, opacity }, animStyle, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="45" stroke={color} strokeWidth="0.8" fill="none" />
        <Circle cx="50" cy="50" r="34" stroke={color} strokeWidth="0.8" fill="none" strokeDasharray="2 2" />
        <Circle cx="50" cy="50" r="23" stroke={color} strokeWidth="0.8" fill="none" />
        <Circle cx="50" cy="50" r="12" stroke={color} strokeWidth="0.8" fill="none" strokeDasharray="1 3" />
      </Svg>
    </Animated.View>
  );
}
