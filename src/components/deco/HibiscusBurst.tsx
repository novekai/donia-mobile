// HibiscusBurst — fleur d'hibiscus 6 pétales
// Source : _prototype/donia/project/direction-c.jsx:57-70
import React from 'react';
import { ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Ellipse, Circle } from 'react-native-svg';
import { useFloatSlow, useFloat, useSpin } from '../../theme/animations';

type AnimType = 'float' | 'floatSlow' | 'spin' | 'spinRev' | 'none';

type Props = {
  size?: number;
  color?: string;
  anim?: AnimType;
  delay?: number;
  style?: ViewStyle;
};

export function HibiscusBurst({
  size = 100,
  color = '#F4486F',
  anim = 'floatSlow',
  delay = 0,
  style,
}: Props) {
  const floatStyle = useFloat({ delay: delay * 1000 });
  const floatSlowStyle = useFloatSlow({ delay: delay * 1000 });
  const spinStyle = useSpin({ delay: delay * 1000 });
  const spinRevStyle = useSpin({ reverse: true, delay: delay * 1000 });

  const animStyle =
    anim === 'float' ? floatStyle
    : anim === 'floatSlow' ? floatSlowStyle
    : anim === 'spin' ? spinStyle
    : anim === 'spinRev' ? spinRevStyle
    : undefined;

  const petals = Array.from({ length: 6 });
  const content = (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {petals.map((_, i) => (
        <Ellipse
          key={i}
          cx="50"
          cy="28"
          rx="11"
          ry="22"
          fill={color}
          opacity="0.85"
          transform={`rotate(${i * 60} 50 50)`}
        />
      ))}
      <Circle cx="50" cy="50" r="8" fill="#FDF7F6" />
      <Circle cx="50" cy="50" r="3.5" fill={color} />
    </Svg>
  );
  return <Animated.View style={[{ width: size, height: size }, animStyle, style]}>{content}</Animated.View>;
}
