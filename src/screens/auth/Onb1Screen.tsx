// Onboarding 1 — "Envoie un cadeau en 30 secondes"
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ConcentricRings } from '../../components/deco/ConcentricRings';
import { SunRays } from '../../components/deco/SunRays';
import { Sparkle } from '../../components/deco/Sparkle';
import { GiftGlyph } from '../../components/deco/GiftGlyph';
import { Button } from '../../components/ui/Button';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { useBob } from '../../theme/animations';
import { colors, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

export function Onb1Screen({ navigation }: RootStackScreenProps<'Onb1'>) {
  const bobStyle = useBob();
  return (
    <ScreenContainer>
      <FunBackground palette="cream" />
      <View style={styles.body}>
        <View style={styles.progressRow}>
          <View style={[styles.dot, { backgroundColor: colors.coral }]} />
          <View style={[styles.dot, { backgroundColor: colors.coralSoft }]} />
          <View style={[styles.dot, { backgroundColor: colors.coralSoft }]} />
          <Pressable onPress={() => navigation.replace('Login')}>
            <Text style={styles.skip}>Passer</Text>
          </Pressable>
        </View>

        <View style={styles.center}>
          <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
            <View style={{ position: 'absolute' }}>
              <ConcentricRings size={220} color={colors.coral} opacity={0.2} anim="spin" />
            </View>
            <View style={{ position: 'absolute', opacity: 0.4 }}>
              <SunRays size={200} color={colors.mango} reverse />
            </View>
            <Animated.View style={[bobStyle, styles.gift, shadow.coral]}>
              <BrandGradient variant="coral" style={styles.giftInner}>
                <GiftGlyph size={70} stroke={colors.bg} strokeWidth={1.6} />
              </BrandGradient>
            </Animated.View>
            <Sparkle size={18} color={colors.mango} style={{ position: 'absolute', top: -10, right: 20 }} />
            <Sparkle size={14} color={colors.pink} delay={1} style={{ position: 'absolute', bottom: 10, left: -10 }} />
            <Sparkle size={12} color={colors.mint} delay={0.5} style={{ position: 'absolute', top: 60, left: -15 }} />
          </View>

          <Text style={styles.title}>
            Envoie un cadeau{'\n'}
            <Text style={styles.titleItalic}>en 30 secondes</Text>
          </Text>
          <Text style={styles.subtitle}>
            Offre un crédit Mobile Money à tes proches partout en Afrique de l'Ouest — sans formulaire, sans friction.
          </Text>
        </View>

        <View style={{ padding: 22 }}>
          <Button label="Suivant" pulse onPress={() => navigation.navigate('Onb2')} />
          <Pressable onPress={() => navigation.replace('Login')} style={{ marginTop: 14 }}>
            <Text style={styles.bottomLink}>J'ai déjà un compte</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  progressRow: { paddingHorizontal: 22, paddingTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { flex: 1, height: 4, borderRadius: 99 },
  skip: { fontSize: 13, color: colors.ink2, fontFamily: fonts.displayItalic, marginLeft: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  gift: { width: 160, height: 160, borderRadius: 80, overflow: 'hidden' },
  giftInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.displayMedium, fontSize: 32, color: colors.ink, textAlign: 'center', letterSpacing: -0.6, lineHeight: 36 },
  titleItalic: { fontFamily: fonts.displayItalic, color: colors.coral },
  subtitle: { marginTop: 14, fontSize: 14, color: colors.ink2, textAlign: 'center', lineHeight: 21, maxWidth: 280, fontFamily: fonts.bodyRegular },
  bottomLink: { textAlign: 'center', fontSize: 13, color: colors.coral, fontFamily: fonts.bodyBold },
});
