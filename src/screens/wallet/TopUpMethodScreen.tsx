// TopUpMethod — 2 cartes (Mobile Money / Code reçu) + tip + recharges récentes
import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { SunRays } from '../../components/deco/SunRays';
import { ConcentricRings } from '../../components/deco/ConcentricRings';
import { Sparkle } from '../../components/deco/Sparkle';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { IconChevR } from '../../components/ui/Icons';
import { useBob } from '../../theme/animations';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { getMe } from '../../api/me';
import { listTransactions } from '../../api/transactions';
import type { Transaction } from '../../api/types';

function fmt(s: string | number | undefined): string {
  if (s === undefined || s === null) return '0';
  const n = typeof s === 'string' ? Number(s) : s;
  return n.toLocaleString('fr-FR').replace(/,/g, ' ');
}

function relativeDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

function recentMeta(tx: Transaction): { l: string; sub: string; emoji: string; color: string } {
  const day = relativeDay(tx.createdAt);
  if (tx.type === 'TOPUP_CODE') {
    const code = (tx.metadata as { code?: string } | null)?.code || tx.ref || '—';
    return { l: `Code ${code}`, sub: `Carte reçue · ${day}`, emoji: '🎁', color: colors.indigo };
  }
  const provider = (tx.metadata as { provider?: string } | null)?.provider || 'Mobile Money';
  return { l: provider, sub: `Via Mobile Money · ${day}`, emoji: '📱', color: colors.coral };
}

export function TopUpMethodScreen({ navigation }: RootStackScreenProps<'TopUpMethod'>) {
  const bobA = useBob();
  const bobB = useBob({ delay: 500 });
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const topupsQuery = useQuery({
    queryKey: ['transactions', 'topups'],
    queryFn: () => listTransactions({ limit: 50 }),
    select: (d) => d.items.filter((t) => t.type === 'TOPUP_MOBILE_MONEY' || t.type === 'TOPUP_CODE').slice(0, 5),
  });

  const balance = Number(meQuery.data?.user.wallet?.balancePrincipal ?? 0);
  const recent = topupsQuery.data ?? [];

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Recharger mon solde" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ paddingHorizontal: 22, paddingTop: 20 }}>
          <Text style={styles.kicker}>Solde actuel</Text>
          <Text style={styles.balance}>{fmt(balance)} <Text style={styles.balanceUnit}>FCFA</Text></Text>
        </View>

        <View style={{ paddingHorizontal: 22, marginTop: 24 }}>
          <Text style={styles.label}>Comment veux-tu recharger ?</Text>

          {/* Mobile Money */}
          <Animated.View style={[bobA, { marginTop: 14 }]}>
            <Pressable onPress={() => navigation.navigate('TopUpMobileMoney')}>
              <BrandGradient variant="coral" style={[styles.option, shadow.coral]}>
                <View pointerEvents="none" style={{ position: 'absolute', top: -60, right: -50, opacity: 0.3 }}>
                  <SunRays size={150} color={colors.mango} />
                </View>
                <View style={styles.optIcon}><Text style={{ fontSize: 24 }}>📱</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optTitle}>Mobile Money</Text>
                  <Text style={styles.optSub}>MTN, Moov, Orange, Wave & co · gratuit</Text>
                </View>
                <IconChevR size={18} color={colors.bg} />
              </BrandGradient>
            </Pressable>
          </Animated.View>

          {/* Carte bancaire */}
          <Animated.View style={[bobB, { marginTop: 10 }]}>
            <Pressable onPress={() => navigation.navigate('TopUpCard')}>
              <BrandGradient variant="plum" style={[styles.option, shadow.indigo]}>
                <View style={[styles.optIcon, { backgroundColor: 'rgba(253,247,246,0.18)' }]}>
                  <Text style={{ fontSize: 24 }}>💳</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optTitle}>Carte bancaire</Text>
                  <Text style={styles.optSub}>Visa, Mastercard · paiement sécurisé via FedaPay</Text>
                </View>
                <IconChevR size={18} color={colors.bg} />
              </BrandGradient>
            </Pressable>
          </Animated.View>

          {/* Code received */}
          <Animated.View style={[bobB, { marginTop: 10 }]}>
            <Pressable onPress={() => navigation.navigate('TopUpCode')}>
              <BrandGradient variant="indigo" style={[styles.option, shadow.indigo]}>
                <View pointerEvents="none" style={{ position: 'absolute', bottom: -50, right: -40 }}>
                  <ConcentricRings size={140} color={colors.mango} opacity={0.3} anim="spinRev" />
                </View>
                <Sparkle size={12} color={colors.mango} style={{ position: 'absolute', top: 12, right: 50 }} />
                <View style={[styles.optIcon, { backgroundColor: 'rgba(249,160,28,0.2)' }]}><Text style={{ fontSize: 24 }}>📧</Text></View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.optTitle}>Code reçu</Text>
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  </View>
                  <Text style={styles.optSub}>Tu as reçu une carte ? Entre le code de retrait</Text>
                </View>
                <IconChevR size={18} color={colors.bg} />
              </BrandGradient>
            </Pressable>
          </Animated.View>

          {/* Tip */}
          <View style={styles.tip}>
            <Text style={{ fontSize: 16 }}>💡</Text>
            <Text style={styles.tipText}>
              <Text style={{ fontFamily: fonts.bodyBold }}>Tu as reçu un cadeau Donia ?</Text>{' '}
              Si tu as un email ou WhatsApp avec un code à 8 caractères, choisis « Code reçu ».
            </Text>
          </View>
        </View>

        {/* Recent recharges */}
        {recent.length > 0 && (
          <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
            <Text style={styles.sectionLabel}>Récentes recharges</Text>
            <Card pad={0}>
              {recent.map((tx, i) => {
                const r = recentMeta(tx);
                return (
                  <View key={tx.id} style={[styles.recent, i < recent.length - 1 && styles.recentDivider]}>
                    <View style={[styles.recentIcon, { backgroundColor: `${r.color}22` }]}>
                      <Text style={{ fontSize: 14 }}>{r.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recentTitle}>{r.l}</Text>
                      <Text style={styles.recentSub}>{r.sub}</Text>
                    </View>
                    <Text style={styles.recentAmt}>+{fmt(tx.amount)}</Text>
                  </View>
                );
              })}
            </Card>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.ink2, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  balance: { fontFamily: fonts.bodyBold, fontSize: 30, color: colors.ink, letterSpacing: -0.9 },
  balanceUnit: { fontSize: 13, color: colors.ink2, fontFamily: fonts.bodyMedium },
  label: { fontFamily: fonts.displayItalic, fontSize: 14, color: colors.ink2 },
  option: { borderRadius: radius.lg, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, overflow: 'hidden' },
  optIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(253,247,246,0.18)', alignItems: 'center', justifyContent: 'center' },
  optTitle: { fontFamily: fonts.displaySemiBold, fontSize: 16, color: colors.bg },
  optSub: { fontSize: 12, color: colors.bg, opacity: 0.9, marginTop: 2 },
  newBadge: { backgroundColor: colors.mango, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  newBadgeText: { fontFamily: fonts.bodyBold, fontSize: 9, color: colors.indigoDeep, letterSpacing: 0.5 },
  tip: { marginTop: 16, padding: 12, borderRadius: 14, backgroundColor: 'rgba(249,160,28,0.12)', flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  tipText: { flex: 1, fontSize: 12, color: colors.ink, lineHeight: 17 },
  sectionLabel: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2, marginBottom: 10 },
  recent: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  recentDivider: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  recentIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  recentTitle: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.ink },
  recentSub: { fontSize: 11, color: colors.ink3 },
  recentAmt: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.green },
});
