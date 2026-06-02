// SplashScreen — logo qui bobbe + halo + sun + sparkles + hibiscus + kente
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { LogoMark } from '../../components/brand/LogoMark';
import { SunRays } from '../../components/deco/SunRays';
import { ConcentricRings } from '../../components/deco/ConcentricRings';
import { Sparkle } from '../../components/deco/Sparkle';
import { HibiscusBurst } from '../../components/deco/HibiscusBurst';
import { Squiggle } from '../../components/deco/Squiggle';
import { KenteStrip } from '../../components/deco/KenteStrip';
import { useBob, useRingGrow } from '../../theme/animations';
import { colors } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../store/auth';

export function SplashScreen({ navigation }: RootStackScreenProps<'Splash'>) {
  const bobStyle = useBob();
  const ringStyle = useRingGrow();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    const t = setTimeout(() => {
      // If already logged in, skip onboarding and go straight to Home
      if (token) navigation.replace('Main', { screen: 'Home' });
      else navigation.replace('Onb1');
    }, 2400);
    return () => clearTimeout(t);
  }, [navigation, token]);

  return (
    <BrandGradient variant="indigo" style={styles.container}>
      {/* big spinning sun */}
      <View style={{ position: 'absolute', top: 60, left: '50%', marginLeft: -230, opacity: 0.18 }}>
        <SunRays size={460} color={colors.mango} />
      </View>
      <View style={{ position: 'absolute', top: 130, left: '50%', marginLeft: -160 }}>
        <ConcentricRings size={320} color={colors.mango} opacity={0.25} anim="pulse" />
      </View>

      {/* Floating shapes */}
      <HibiscusBurst size={48} color={colors.coral} anim="float" style={{ position: 'absolute', top: 70, left: 30 }} />
      <HibiscusBurst size={36} color={colors.pink} anim="floatSlow" delay={1} style={{ position: 'absolute', top: 110, right: 40 }} />
      <Sparkle size={20} color={colors.bg} delay={0} style={{ position: 'absolute', top: 200, left: 60 }} />
      <Sparkle size={26} color={colors.mango} delay={1.2} style={{ position: 'absolute', top: 240, right: 70 }} />
      <Sparkle size={14} color={colors.pink} delay={0.6} style={{ position: 'absolute', bottom: 280, left: 40 }} />
      <Sparkle size={18} color={colors.plum} delay={1.8} style={{ position: 'absolute', bottom: 200, right: 50 }} />
      <Squiggle width={70} color={colors.coral} strokeWidth={3} style={{ position: 'absolute', bottom: 250, left: 40 }} />
      <Squiggle width={60} color={colors.mango} strokeWidth={3} delay={1} style={{ position: 'absolute', bottom: 180, right: 40 }} />

      {/* Center logo */}
      <View style={styles.center}>
        <Animated.View style={[bobStyle, { alignItems: 'center', justifyContent: 'center' }]}>
          <Animated.View style={[styles.ring, ringStyle]} />
          <LogoMark size={130} />
        </Animated.View>
        <View style={styles.wordmarkRow}>
          <Text style={styles.wordmark}>Don</Text>
          <Text style={[styles.wordmark, styles.wordmarkI]}>i</Text>
          <Text style={styles.wordmark}>a</Text>
        </View>
        <Text style={styles.tagline}>Le cadeau qui se partage ✨</Text>
        <KenteStrip height={10} width={'56%'} style={{ marginTop: 30 }} />
      </View>

      <Text style={styles.footer}>BÉNIN · CÔTE D'IVOIRE · SÉNÉGAL · TOGO</Text>
    </BrandGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', paddingBottom: 80 },
  ring: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 2, borderColor: colors.mango },
  wordmarkRow: { marginTop: 28, flexDirection: 'row', alignItems: 'baseline' },
  wordmark: { fontFamily: fonts.displayMedium, fontSize: 56, letterSpacing: -1.7, color: colors.bg, lineHeight: 64 },
  wordmarkI: { fontFamily: fonts.displayItalic, color: colors.coral },
  tagline: { marginTop: 12, color: colors.mango, fontFamily: fonts.displayItalic, fontSize: 15 },
  footer: { position: 'absolute', bottom: 50, color: colors.ink3, fontFamily: fonts.bodySemiBold, fontSize: 11, letterSpacing: 2 },
});
