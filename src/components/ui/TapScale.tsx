// TapScale — wrapper Pressable + scale anim sur press (0.96 → 1)
// À utiliser autour de tous les CTA / cartes interactives
import React from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTapScale } from '../../theme/animations';

type Props = PressableProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function TapScale({ children, style, onPress, ...rest }: Props) {
  const { style: animStyle, onPressIn, onPressOut } = useTapScale();
  return (
    <Animated.View style={[animStyle]}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={style} {...rest}>
        {children}
      </Pressable>
    </Animated.View>
  );
}
