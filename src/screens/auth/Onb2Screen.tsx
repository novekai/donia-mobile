// Onboarding 2 — "Tous les opérateurs, une seule app" avec chips d'opérateurs flottants
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { Sparkle } from '../../components/deco/Sparkle';
import { Button } from '../../components/ui/Button';
import { useFloat } from '../../theme/animations';
import { colors, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

const OPS = [
  { l: 'MTN', bg: colors.mango, ink: colors.indigo, rot: -8, x: 0, y: 40, delay: 0 },
  { l: 'Moov', bg: colors.indigo, ink: colors.bg, rot: 4, x: 50, y: 0, delay: 500 },
  { l: 'Orange', bg: colors.coral, ink: colors.bg, rot: -3, x: 100, y: 60, delay: 1000 },
  { l: 'Wave', bg: colors.mint, ink: colors.bg, rot: 6, x: 30, y: 110, delay: 1500 },
  { l: 'Free', bg: colors.pink, ink: colors.bg, rot: -5, x: 120, y: 130, delay: 2000 },
];

function OpChip({ op }: { op: typeof OPS[number] }) {
  const animStyle = useFloat({ delay: op.delay });
  return (
    <Animated.View
      style={[
        animStyle,
        styles.chip,
        shadow.e2,
        {
          position: 'absolute',
          left: op.x,
          top: op.y,
          backgroundColor: op.bg,
          transform: [{ rotate: `${op.rot}deg` }],
        },
      ]}
    >
      <Text style={[styles.chipLabel, { color: op.ink }]}>{op.l}</Text>
    </Animated.View>
  );
}

export function Onb2Screen({ navigation }: RootStackScreenProps<'Onb2'>) {
  return (
    <ScreenContainer>
      <FunBackground palette="cream" />
      <View style={{ flex: 1 }}>
        <View style={styles.progressRow}>
          <View style={[styles.dot, { backgroundColor: colors.coralSoft }]} />
          <View style={[styles.dot, { backgroundColor: colors.coral }]} />
          <View style={[styles.dot, { backgroundColor: colors.coralSoft }]} />
          <Pressable onPress={() => navigation.replace('Login')}>
            <Text style={styles.skip}>Passer</Text>
          </Pressable>
        </View>

        <View style={styles.center}>
          <View style={{ width: 240, height: 220, marginBottom: 28 }}>
            {OPS.map((op, i) => <OpChip key={i} op={op} />)}
            <Sparkle size={20} color={colors.mango} style={{ position: 'absolute', top: -10, right: 0 }} />
          </View>

          <Text style={styles.title}>
            Tous les opérateurs,{'\n'}
            <Text style={styles.titleItalic}>une seule app</Text>
          </Text>
          <Text style={styles.subtitle}>
            MTN, Moov, Orange, Wave, Free — peu importe l'opérateur du destinataire, Donia s'occupe de tout.
          </Text>
        </View>

        <View style={{ padding: 22 }}>
          <Button label="Suivant" variant="secondary" onPress={() => navigation.navigate('Onb3')} />
          <Pressable onPress={() => navigation.replace('Login')} style={{ marginTop: 14 }}>
            <Text style={styles.bottomLink}>J'ai déjà un compte</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  progressRow: { paddingHorizontal: 22, paddingTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { flex: 1, height: 4, borderRadius: 99 },
  skip: { fontSize: 13, color: colors.ink2, fontFamily: fonts.displayItalic, marginLeft: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  chip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 16 },
  chipLabel: { fontFamily: fonts.displaySemiBold, fontSize: 18 },
  title: { fontFamily: fonts.displayMedium, fontSize: 32, color: colors.ink, textAlign: 'center', letterSpacing: -0.6, lineHeight: 36 },
  titleItalic: { fontFamily: fonts.displayItalic, color: colors.indigo },
  subtitle: { marginTop: 14, fontSize: 14, color: colors.ink2, textAlign: 'center', lineHeight: 21, maxWidth: 280, fontFamily: fonts.bodyRegular },
  bottomLink: { textAlign: 'center', fontSize: 13, color: colors.coral, fontFamily: fonts.bodyBold },
});
