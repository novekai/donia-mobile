// Onboarding 3 — "Gratuit à recevoir, transparent à envoyer" avec disque 100%
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { SunRays } from '../../components/deco/SunRays';
import { Sparkle } from '../../components/deco/Sparkle';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { Button } from '../../components/ui/Button';
import { useBob } from '../../theme/animations';
import { colors, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

export function Onb3Screen({ navigation }: RootStackScreenProps<'Onb3'>) {
  const bobStyle = useBob();
  return (
    <ScreenContainer>
      <FunBackground palette="cream" />
      <View style={{ flex: 1 }}>
        <View style={styles.progressRow}>
          <View style={[styles.dot, { backgroundColor: colors.coralSoft }]} />
          <View style={[styles.dot, { backgroundColor: colors.coralSoft }]} />
          <View style={[styles.dot, { backgroundColor: colors.coral }]} />
        </View>

        <View style={styles.center}>
          <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
            <View style={{ position: 'absolute', opacity: 0.5 }}>
              <SunRays size={220} color={colors.mango} />
            </View>
            <Animated.View style={[bobStyle, styles.disc, shadow.coral]}>
              <BrandGradient variant="mango" style={styles.discInner}>
                <Text style={styles.discText}>100%</Text>
              </BrandGradient>
            </Animated.View>
            <Sparkle size={20} color={colors.coral} style={{ position: 'absolute', top: 20, right: 0 }} />
            <Sparkle size={14} color={colors.pink} delay={1} style={{ position: 'absolute', bottom: 20, left: 0 }} />
          </View>

          <Text style={styles.title}>
            Gratuit à recevoir,{'\n'}
            <Text style={styles.titleItalic}>transparent à envoyer</Text>
          </Text>
          <Text style={styles.subtitle}>
            Le destinataire reçoit 100% du montant. Les frais sont affichés clairement avant chaque envoi.
          </Text>
        </View>

        <View style={{ padding: 22 }}>
          <Button label="Commencer ✨" pulse onPress={() => navigation.replace('Signup')} />
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  disc: { width: 160, height: 160, borderRadius: 80, overflow: 'hidden' },
  discInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  discText: { fontFamily: fonts.bodyBold, fontSize: 46, color: colors.ink, letterSpacing: -1.5, textAlign: 'center' },
  title: { fontFamily: fonts.displayMedium, fontSize: 32, color: colors.ink, textAlign: 'center', letterSpacing: -0.6, lineHeight: 36 },
  titleItalic: { fontFamily: fonts.displayItalic, color: colors.mango },
  subtitle: { marginTop: 14, fontSize: 14, color: colors.ink2, textAlign: 'center', lineHeight: 21, maxWidth: 280, fontFamily: fonts.bodyRegular },
  bottomLink: { textAlign: 'center', fontSize: 13, color: colors.coral, fontFamily: fonts.bodyBold },
});
