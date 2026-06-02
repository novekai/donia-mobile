// RedeemSuccess — explosion confettis + gros gift glyph + "Carte convertie!" + KenteStrip
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { SunRays } from '../../components/deco/SunRays';
import { ConcentricRings } from '../../components/deco/ConcentricRings';
import { HibiscusBurst } from '../../components/deco/HibiscusBurst';
import { Sparkle } from '../../components/deco/Sparkle';
import { GiftGlyph } from '../../components/deco/GiftGlyph';
import { KenteStrip } from '../../components/deco/KenteStrip';
import { Confetti } from '../../components/ui/Confetti';
import { useBob, useRingGrow } from '../../theme/animations';
import { colors, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

export function RedeemSuccessScreen({ navigation, route }: RootStackScreenProps<'RedeemSuccess'>) {
  const { amount = '4 750', sender = 'Marie' } = route.params || {};
  const bobStyle = useBob();
  const ringStyle = useRingGrow();

  return (
    <ScreenContainer dark edges={[]}>
      <BrandGradient variant="coral" style={{ flex: 1 }}>
        <Confetti count={120} fallSpeed={3400} />

        {/* Big sun */}
        <View style={{ position: 'absolute', top: -100, left: '50%', marginLeft: -250, opacity: 0.22 }} pointerEvents="none">
          <SunRays size={500} color={colors.mango} />
        </View>
        <View style={{ position: 'absolute', top: 0, left: '50%', marginLeft: -200 }} pointerEvents="none">
          <ConcentricRings size={400} color={colors.bg} opacity={0.18} anim="spinRev" />
        </View>

        {/* Floating hibiscus */}
        <HibiscusBurst size={50} color={colors.mango} anim="float" style={{ position: 'absolute', top: 90, left: 30 }} />
        <HibiscusBurst size={40} color={colors.pink} anim="floatSlow" delay={0.5} style={{ position: 'absolute', top: 130, right: 40 }} />
        <Sparkle size={22} color={colors.bg} style={{ position: 'absolute', top: 200, left: 60 }} />
        <Sparkle size={18} color={colors.mango} delay={1.2} style={{ position: 'absolute', top: 240, right: 70 }} />

        {/* Center content */}
        <View style={styles.center}>
          <Animated.View style={[bobStyle, styles.giftWrap, shadow.coral]}>
            <Animated.View style={[ringStyle, styles.ring]} />
            <GiftGlyph size={64} stroke={colors.coral} strokeWidth={1.8} />
          </Animated.View>

          <Text style={styles.title}>Carte convertie !</Text>
          <Text style={styles.subtitle}>
            <Text style={styles.amount}>{amount} FCFA</Text> envoyés sur ton MTN Bénin.{'\n'}Tu devrais le recevoir d'ici 1 minute.
          </Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>5 000 carte − 250 commission (5%) = 4 750</Text>
          </View>
          <KenteStrip height={6} width={'40%'} style={{ marginTop: 24 }} />
        </View>

        {/* CTAs */}
        <View style={styles.footer}>
          <Pressable style={styles.cta} onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
            <Text style={styles.ctaText}>Renvoyer un mot à {sender} 💌</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Main', { screen: 'Home' })} style={{ marginTop: 14 }}>
            <Text style={styles.openLink}>Ouvrir Donia</Text>
          </Pressable>
        </View>
      </BrandGradient>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  giftWrap: { width: 130, height: 130, borderRadius: 65, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  ring: { position: 'absolute', width: 130, height: 130, borderRadius: 65, borderWidth: 2, borderColor: colors.bg },
  title: { fontFamily: fonts.displayMedium, fontSize: 44, color: colors.bg, letterSpacing: -1.3, textAlign: 'center', lineHeight: 46 },
  subtitle: { marginTop: 14, fontSize: 15, color: colors.bg, opacity: 0.9, textAlign: 'center', lineHeight: 22 },
  amount: { fontFamily: fonts.bodyBold },
  pill: { marginTop: 14, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, backgroundColor: 'rgba(255,241,220,0.18)' },
  pillText: { fontFamily: fonts.displayItalic, fontSize: 11, color: colors.bg, opacity: 0.85 },
  footer: { paddingHorizontal: 28, paddingBottom: 50 },
  cta: { height: 56, borderRadius: 18, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontFamily: fonts.displaySemiBold, fontSize: 16, color: colors.coralDeep },
  openLink: { textAlign: 'center', color: colors.bg, fontSize: 14, fontFamily: fonts.bodyBold, opacity: 0.85 },
});
