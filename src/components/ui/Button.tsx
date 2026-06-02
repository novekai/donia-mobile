// Button — 5 variantes alignées sur le prototype
// primary  : gradient coral, ombre coral, shimmer (le CTA principal)
// secondary: gradient indigo, ombre indigo
// mango    : fond mango plein, texte indigo
// mint     : gradient mint, ombre mint (CTA de conversion)
// ghost    : transparent + border crème (sur fond foncé)
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated from 'react-native-reanimated';
import { TapScale } from './TapScale';
import { Shimmer } from './Shimmer';
import { BrandGradient, GradientVariant } from '../brand/BrandGradient';
import { usePulse } from '../../theme/animations';
import { colors, radius, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';

type Variant = 'primary' | 'secondary' | 'mango' | 'mint' | 'ghost';
type Size = 'lg' | 'md' | 'sm';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  pulse?: boolean;          // active la pulse anim (CTA hero)
  shimmer?: boolean;        // active le shimmer overlay (CTA hero)
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

const SIZES: Record<Size, { height: number; padX: number; fontSize: number; radius: number }> = {
  lg: { height: 58, padX: 24, fontSize: 17, radius: radius.md },
  md: { height: 44, padX: 18, fontSize: 14, radius: radius.sm },
  sm: { height: 36, padX: 14, fontSize: 13, radius: radius.sm },
};

export function Button({
  label, onPress, variant = 'primary', size = 'lg',
  pulse = false, shimmer = false, leftIcon, rightIcon, style, disabled,
}: Props) {
  const s = SIZES[size];
  const pulseStyle = usePulse({ intensity: 0.04 });

  const textColor =
    variant === 'mango' ? colors.indigo
    : variant === 'ghost' ? colors.bg
    : colors.bg;

  const shadowStyle =
    variant === 'primary' ? shadow.coral
    : variant === 'mint' ? shadow.mint
    : variant === 'secondary' ? shadow.indigo
    : undefined;

  const inner = (
    <View
      style={[
        styles.row,
        { height: s.height, paddingHorizontal: s.padX, borderRadius: s.radius },
      ]}
    >
      {leftIcon}
      <Text style={[styles.label, { fontSize: s.fontSize, color: textColor, marginLeft: leftIcon ? 8 : 0, marginRight: rightIcon ? 8 : 0 }]}>
        {label}
      </Text>
      {rightIcon}
      {shimmer && <Shimmer style={{ borderRadius: s.radius }} />}
    </View>
  );

  const body =
    variant === 'ghost' ? (
      <View style={[styles.ghost, { height: s.height, paddingHorizontal: s.padX, borderRadius: s.radius }]}>
        {leftIcon}
        <Text style={[styles.label, { fontSize: s.fontSize, color: textColor, marginLeft: leftIcon ? 8 : 0, marginRight: rightIcon ? 8 : 0 }]}>
          {label}
        </Text>
        {rightIcon}
      </View>
    ) : variant === 'mango' ? (
      <View style={[{ backgroundColor: colors.mango, borderRadius: s.radius }, shadowStyle]}>{inner}</View>
    ) : (
      <BrandGradient variant={variantToGradient(variant)} style={[{ borderRadius: s.radius, overflow: 'hidden' }, shadowStyle]}>
        {inner}
      </BrandGradient>
    );

  return (
    <Animated.View style={[pulse ? pulseStyle : undefined, style, disabled && { opacity: 0.5 }]}>
      <TapScale onPress={disabled ? undefined : onPress} disabled={disabled}>
        {body}
      </TapScale>
    </Animated.View>
  );
}

function variantToGradient(v: Exclude<Variant, 'ghost' | 'mango'>): GradientVariant {
  switch (v) {
    case 'primary': return 'coral';
    case 'secondary': return 'indigo';
    case 'mint': return 'mint';
  }
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.displayMedium, letterSpacing: -0.3 },
  ghost: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent', borderWidth: 1.5, borderColor: 'rgba(253,247,246,0.3)',
  },
});
