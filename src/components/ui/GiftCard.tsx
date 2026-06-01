// GiftCard — la carte cadeau animée Donia (6 palettes)
// Source : _prototype/donia/project/direction-c.jsx:163-215 (GiftCardC)
// Composé de : SunRays bg (spin), ConcentricRings, 2 Sparkles (twinkle),
// AdinkraMark (spin-rev), wordmark donia, occasion (Fraunces),
// pour <recipient>, amount + FCFA, message optionnel, sender, KenteStrip
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SunRays } from '../deco/SunRays';
import { ConcentricRings } from '../deco/ConcentricRings';
import { Sparkle } from '../deco/Sparkle';
import { AdinkraMark } from '../deco/AdinkraMark';
import { KenteStrip } from '../deco/KenteStrip';
import { colors, radius, shadow, CardPalette } from '../../theme/tokens';
import { fonts } from '../../theme/typography';

// Lets the caller provide an arbitrary background color (single or 2-stop gradient).
// `ink`/`accent`/`deco` are auto-derived from luminance unless explicitly passed.
export type CardColorOverride = {
  bg: string | [string, string];   // single hex or [start, end] for a gradient
  ink?: string;
  accent?: string;
  deco?: string;
};

type Props = {
  occasion?: string;
  amount?: string;
  recipient?: string;
  sender?: string;
  message?: string;
  palette?: CardPalette;
  customColors?: CardColorOverride;
  animate?: boolean;
  style?: StyleProp<ViewStyle>;
};

function hexLuma(hex: string): number {
  const c = hex.replace('#', '');
  if (c.length !== 6) return 200;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function paletteFromColors(colorsOv: CardColorOverride) {
  const firstHex = Array.isArray(colorsOv.bg) ? colorsOv.bg[0] : colorsOv.bg;
  const isDark = hexLuma(firstHex) < 140;
  const inkAuto = isDark ? '#FDF7F6' : '#2A0F1A';
  return {
    bg: colorsOv.bg,
    ink: colorsOv.ink ?? inkAuto,
    accent: colorsOv.accent ?? (isDark ? '#F9A01C' : '#41087B'),
    deco: colorsOv.deco ?? inkAuto,
  };
}

export function GiftCard({
  occasion = 'Bonjour à toi,',
  amount = '10 000',
  recipient = 'Kofi',
  sender,
  message,
  palette = 'coral',
  customColors,
  animate = true,
  style,
}: Props) {
  const p = customColors ? paletteFromColors(customColors) : colors.card[palette];
  const isGradient = Array.isArray(p.bg);
  const bgFlat = isGradient ? (p.bg as [string, string])[0] : (p.bg as string);

  const content = (
    <>
      {/* Layered illustrated background */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <SunRays
          size={140}
          color={p.deco}
          animate={animate}
          style={{ position: 'absolute', top: -50, right: -30, opacity: 0.25 }}
        />
        <ConcentricRings
          size={140}
          color={p.deco}
          opacity={0.3}
          style={{ position: 'absolute', bottom: -50, left: -30 }}
        />
        <Sparkle
          size={14}
          color={p.accent}
          animate={animate}
          delay={0.5}
          style={{ position: 'absolute', top: 30, right: 70 }}
        />
        <Sparkle
          size={10}
          color={p.accent}
          animate={animate}
          delay={1.4}
          style={{ position: 'absolute', bottom: 30, right: 30 }}
        />
      </View>

      {/* Foreground content */}
      <View style={{ position: 'relative' }}>
        <View style={styles.header}>
          <Text style={[styles.brand, { color: p.ink }]}>donia</Text>
          <AdinkraMark
            size={26}
            color={p.accent}
            innerColor={bgFlat}
            animate={animate}
            style={{ opacity: 0.7 }}
          />
        </View>

        <Text style={[styles.occasion, { color: p.ink }]} numberOfLines={2}>
          {occasion}
        </Text>
        <Text style={[styles.recipient, { color: p.ink }]}>
          pour <Text style={{ fontFamily: fonts.bodyBold }}>{recipient}</Text>
        </Text>

        <Text style={[styles.amount, { color: p.ink }]}>
          {amount}
          <Text style={[styles.amountUnit, { color: p.ink }]}> FCFA</Text>
        </Text>

        {message && (
          <View style={[styles.messageWrap, { borderTopColor: `${p.ink}40` }]}>
            <Text style={[styles.message, { color: p.ink }]}>« {message} »</Text>
          </View>
        )}
        {sender && (
          <Text style={[styles.sender, { color: p.ink }]}>— {sender}</Text>
        )}

        <KenteStrip height={6} style={{ marginTop: 16, opacity: 0.9 }} />
      </View>
    </>
  );

  if (isGradient) {
    return (
      <LinearGradient
        colors={p.bg as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, shadow.coral, style]}
      >
        {content}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: bgFlat }, shadow.coral, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    paddingHorizontal: 22,
    paddingVertical: 22,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontFamily: fonts.displayItalic, fontSize: 14, opacity: 0.85 },
  occasion: {
    marginTop: 22,
    fontFamily: fonts.displayMedium,
    fontSize: 30,
    letterSpacing: -0.6,
    lineHeight: 32,
    maxWidth: 220,
  },
  recipient: { marginTop: 4, fontFamily: fonts.bodyRegular, fontSize: 13, opacity: 0.85 },
  amount: {
    marginTop: 20,
    fontFamily: fonts.bodyBold,
    fontSize: 48,
    letterSpacing: -1.4,
    lineHeight: 48,
  },
  amountUnit: { fontSize: 17, opacity: 0.85, fontFamily: fonts.bodySemiBold },
  messageWrap: { marginTop: 18, paddingTop: 14, borderTopWidth: 1.5, borderStyle: 'dashed' },
  message: { fontFamily: fonts.displayItalic, fontSize: 13, lineHeight: 20, opacity: 0.92 },
  sender: { marginTop: 10, fontFamily: fonts.displayMedium, fontSize: 14, opacity: 0.85 },
});
