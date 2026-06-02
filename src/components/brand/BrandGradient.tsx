// BrandGradient — presets de dégradés utilisés partout (CTA, balance card, cards, splash bg).
// Wrappe expo-linear-gradient pour cohérence visuelle.
import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/tokens';

export type GradientVariant =
  | 'indigo'      // splash bg, balance cards
  | 'coral'       // primary CTA
  | 'pink'        // secondary CTA / cards
  | 'mango'       // highlight cards
  | 'mint'        // success CTA
  | 'plum'        // condoléances / extras
  | 'pinkPlum';   // referral hero

const GRADIENTS: Record<GradientVariant, { colors: readonly [string, string]; start: { x: number; y: number }; end: { x: number; y: number } }> = {
  indigo:   { colors: [colors.indigo, colors.indigoDeep], start: { x: 0.1, y: 0 }, end: { x: 0.9, y: 1 } },
  coral:    { colors: [colors.coral, colors.coralDeep], start: { x: 0.2, y: 0 }, end: { x: 0.8, y: 1 } },
  pink:     { colors: [colors.pink, '#B83359'], start: { x: 0.2, y: 0 }, end: { x: 0.8, y: 1 } },
  mango:    { colors: [colors.mango, colors.mangoDeep], start: { x: 0.2, y: 0 }, end: { x: 0.8, y: 1 } },
  mint:     { colors: [colors.mint, '#4A9E84'], start: { x: 0.2, y: 0 }, end: { x: 0.8, y: 1 } },
  plum:     { colors: [colors.plum, colors.plumDeep], start: { x: 0.2, y: 0 }, end: { x: 0.8, y: 1 } },
  pinkPlum: { colors: [colors.pink, colors.plum], start: { x: 0.1, y: 0 }, end: { x: 0.9, y: 1 } },
};

type Props = {
  variant: GradientVariant;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function BrandGradient({ variant, style, children }: Props) {
  const g = GRADIENTS[variant];
  return (
    <LinearGradient colors={g.colors as unknown as readonly [string, string, ...string[]]} start={g.start} end={g.end} style={style}>
      {children}
    </LinearGradient>
  );
}
