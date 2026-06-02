// KeyPad — clavier numérique custom 4x3 (1-9, 000, 0, ⌫)
// Pour l'écran "Send · Montant" où l'utilisateur tape son montant chiffre par chiffre
import React from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { fonts } from '../../theme/typography';

type KeyValue = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '000' | '0' | 'back';

const KEYS: KeyValue[] = ['1','2','3','4','5','6','7','8','9','000','0','back'];

type Props = {
  onPress: (k: KeyValue) => void;
  style?: StyleProp<ViewStyle>;
};

export function KeyPad({ onPress, style }: Props) {
  return (
    <View style={[styles.grid, style]}>
      {KEYS.map((k) => (
        <Pressable
          key={k}
          onPress={() => onPress(k)}
          android_ripple={{ color: colors.coralSoft, borderless: false }}
          style={({ pressed }) => [
            styles.key,
            pressed && { backgroundColor: colors.bg2 },
          ]}
        >
          {k === 'back' ? (
            <BackIcon />
          ) : (
            <Text style={styles.label}>{k}</Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

function BackIcon() {
  return (
    <Text style={[styles.label, { color: colors.ink2 }]}>⌫</Text>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  key: {
    width: '31.5%',
    aspectRatio: 1.9,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(42,15,26,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.bodyBold, fontSize: 24, color: colors.ink, letterSpacing: -0.5 },
});
