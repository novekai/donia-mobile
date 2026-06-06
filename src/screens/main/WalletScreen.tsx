// Wallet — solde + 2 poches (Principal/Parrainage) + carte parrainage (live API)
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ConcentricRings } from '../../components/deco/ConcentricRings';
import { Sparkle } from '../../components/deco/Sparkle';
import { HibiscusBurst } from '../../components/deco/HibiscusBurst';
import { BalanceCard } from '../../components/composed/BalanceCard';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { useBob } from '../../theme/animations';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { getMe } from '../../api/me';
import { getReferral } from '../../api/referral';
import { useAuthStore } from '../../store/auth';

function fmt(s: string | number | undefined): string {
  if (s === undefined || s === null) return '0';
  const n = typeof s === 'string' ? Number(s) : s;
  return n.toLocaleString('fr-FR').replace(/,/g, ' ');
}

function PocketCard({ pocket, delay }: { pocket: any; delay: number }) {
  const bobStyle = useBob({ delay });
  return (
    <Animated.View style={[bobStyle, styles.pocket, { backgroundColor: pocket.bg }]}>
      <View style={{ position: 'absolute', top: -40, right: -40 }}>
        <ConcentricRings size={120} color={pocket.ink} opacity={0.18} />
      </View>
      <View style={styles.pocketHeader}>
        <Text style={[styles.pocketLabel, { color: pocket.ink }]}>{pocket.l}</Text>
        <Text style={{ fontSize: 22 }}>{pocket.emoji}</Text>
      </View>
      <View>
        <Text style={[styles.pocketAmount, { color: pocket.ink }]}>{pocket.v}</Text>
        <Text style={[styles.pocketSub, { color: pocket.ink }]}>{pocket.sub} FCFA</Text>
      </View>
    </Animated.View>
  );
}

export function WalletScreen({ navigation }: RootStackScreenProps<'Wallet'>) {
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const refQuery = useQuery({ queryKey: ['referral'], queryFn: getReferral });
  const storedUser = useAuthStore((s) => s.user);

  const wallet = meQuery.data?.user.wallet;
  const principal = wallet?.balancePrincipal ?? '0';
  const referral = wallet?.balanceReferral ?? '0';
  const total = (Number(principal) + Number(referral)).toString();
  const code = refQuery.data?.code ?? storedUser?.referralCode ?? '—';
  const filleuls = refQuery.data?.filleulsCount ?? 0;

  return (
    <ScreenContainer tabBar="home">
      <FunBackground palette="cream" density="sparse" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={
          <RefreshControl
            refreshing={meQuery.isRefetching || refQuery.isRefetching}
            onRefresh={() => { meQuery.refetch(); refQuery.refetch(); }}
            tintColor={colors.coral}
          />
        }
      >
        <ScreenHeader subtitle="Mon" title="solde Donia" onBack={() => navigation.goBack()} />

        <View style={{ paddingHorizontal: 18, marginTop: 18 }}>
          <BalanceCard
            amount={fmt(total)}
            label="Disponible"
            onTopUp={() => navigation.navigate('TopUpMethod')}
            onWithdraw={() => {
              Alert.alert(
                'Retrait Mobile Money',
                "Le retrait depuis ton solde arrive bientôt. Pour le moment, tu peux convertir une carte reçue directement en Mobile Money via son code de retrait.",
                [{ text: 'OK' }],
              );
            }}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Répartition</Text>
            <Text style={styles.sectionMeta}>2 poches</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <PocketCard pocket={{ l: 'PRINCIPAL', v: fmt(principal), sub: 'À dépenser', bg: colors.coral, ink: colors.bg, emoji: '💸' }} delay={0} />
            <PocketCard pocket={{ l: 'PARRAINAGE', v: fmt(referral), sub: `${filleuls} filleul${filleuls !== 1 ? 's' : ''}`, bg: colors.mango, ink: colors.ink, emoji: '✨' }} delay={500} />
          </View>
        </View>

        {/* Referral pill */}
        <Pressable onPress={() => navigation.navigate('Referral')} style={styles.section}>
          <BrandGradient variant="pinkPlum" style={[styles.refCard, shadow.coral]}>
            <View style={{ position: 'absolute', top: -10, right: -10 }}>
              <HibiscusBurst size={70} color={colors.bg} anim="spin" />
            </View>
            <Sparkle size={14} color={colors.mango} delay={0.4} style={{ position: 'absolute', top: 14, right: 60 }} />
            <View style={styles.refIconWrap}>
              <Text style={{ fontSize: 22 }}>🎁</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.refTitle}>Code parrainage</Text>
              <Text style={styles.refSub}>{code} · 1% à vie</Text>
            </View>
            <View style={styles.refCta}>
              <Text style={styles.refCtaText}>Inviter</Text>
            </View>
          </BrandGradient>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 18, marginTop: 22 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  sectionTitle: { fontFamily: fonts.displayMedium, fontSize: 17, color: colors.ink },
  sectionMeta: { fontSize: 11, color: colors.ink2, fontFamily: fonts.displayItalic },
  pocket: { flex: 1, aspectRatio: 1.05, borderRadius: radius.lg, padding: 14, overflow: 'hidden', justifyContent: 'space-between' },
  pocketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pocketLabel: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1, opacity: 0.85 },
  pocketAmount: { fontFamily: fonts.bodyBold, fontSize: 26, letterSpacing: -0.7 },
  pocketSub: { fontFamily: fonts.displayItalic, fontSize: 11, marginTop: 2, opacity: 0.8 },
  refCard: { borderRadius: radius.lg, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden' },
  refIconWrap: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(253,247,246,0.2)', alignItems: 'center', justifyContent: 'center' },
  refTitle: { fontFamily: fonts.displaySemiBold, fontSize: 15, color: colors.bg },
  refSub: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.bg, opacity: 0.9, letterSpacing: 0.6 },
  refCta: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 99, backgroundColor: colors.bg },
  refCtaText: { fontFamily: fonts.displayBold, fontSize: 12, color: colors.plum },
});
