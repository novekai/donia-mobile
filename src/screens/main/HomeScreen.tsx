// Home — "Akwaaba, {name}" + balance + Fêtes du jour + 4 occasions + activité récente (live API)
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import Animated from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ConcentricRings } from '../../components/deco/ConcentricRings';
import { Sparkle } from '../../components/deco/Sparkle';
import { BalanceCard } from '../../components/composed/BalanceCard';
import { Card } from '../../components/ui/Card';
import { HeaderAvatar } from '../../components/composed/HeaderAvatar';
import { BirthdayStrip } from '../../components/composed/BirthdayStrip';
import { useWiggle, usePulse, useBob, useFloat } from '../../theme/animations';
import { colors, radius, spacing } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { MainTabScreenProps } from '../../navigation/types';
import { getMe } from '../../api/me';
import { listTransactions } from '../../api/transactions';
import { useAuthStore } from '../../store/auth';
import type { Transaction } from '../../api/types';

const OCCASIONS = [
  { l: 'Bonjour', bg: colors.coral, ink: colors.bg, emoji: '👋' },
  { l: "Je t'aime", bg: colors.pink, ink: colors.bg, emoji: '💖' },
  { l: 'Bravo', bg: colors.mango, ink: colors.ink, emoji: '🎉' },
  { l: 'Condo-\nléances', bg: colors.plum, ink: colors.bg, emoji: '🕊️' },
];

function fmtFCFA(s: string | number | undefined): string {
  if (!s) return '0';
  const n = typeof s === 'string' ? Number(s) : s;
  return n.toLocaleString('fr-FR').replace(/,/g, ' ');
}

function txInitial(tx: Transaction): { initial: string; color: string; who: string; neg: boolean } {
  const map = {
    SEND: { initial: 'E', color: colors.coral, who: 'Envoi', neg: true },
    RECEIVE: { initial: 'R', color: colors.pink, who: 'Reçu', neg: false },
    TOPUP_MOBILE_MONEY: { initial: '+', color: colors.mint, who: 'Recharge MM', neg: false },
    TOPUP_CODE: { initial: '+', color: colors.mango, who: 'Recharge code', neg: false },
    WITHDRAWAL: { initial: '-', color: colors.plum, who: 'Retrait', neg: true },
    COMMISSION: { initial: '%', color: colors.indigo, who: 'Commission', neg: false },
    REFERRAL_BONUS: { initial: '*', color: colors.mango, who: 'Parrainage', neg: false },
    CAGNOTTE_IN: { initial: 'C', color: colors.plum, who: 'Cagnotte', neg: true },
  };
  return map[tx.type];
}

function OccasionTile({ o, anim }: { o: typeof OCCASIONS[number]; anim: any }) {
  return (
    <View style={[styles.occ, { backgroundColor: o.bg }]}>
      <View style={{ position: 'absolute', top: -20, right: -20 }}>
        <ConcentricRings size={70} color={o.ink} opacity={0.25} />
      </View>
      <Animated.Text style={[anim, { fontSize: 22 }]}>{o.emoji}</Animated.Text>
      <Text style={[styles.occLabel, { color: o.ink }]}>{o.l}</Text>
    </View>
  );
}

function ActivityRow({ tx, last }: { tx: Transaction; last: boolean }) {
  const meta = txInitial(tx);
  const time = new Date(tx.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const sign = meta.neg ? '−' : '+';
  return (
    <View style={[styles.act, !last && styles.actDivider]}>
      <View style={[styles.actAvatar, { backgroundColor: meta.color }]}>
        <Text style={styles.actInitial}>{meta.initial}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actName}>{meta.who}</Text>
        <Text style={styles.actNote}>{time}</Text>
      </View>
      <Text style={[styles.actAmt, { color: meta.neg ? colors.ink : colors.green }]}>
        {sign}{fmtFCFA(tx.amount)}
      </Text>
    </View>
  );
}

export function HomeScreen({ navigation }: MainTabScreenProps<'Home'>) {
  const wiggleStyle = useWiggle();
  const pulseStyle = usePulse();
  const bobStyle = useBob();
  const floatStyle = useFloat();
  const storedUser = useAuthStore((s) => s.user);

  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const txQuery = useQuery({ queryKey: ['transactions', 'recent'], queryFn: () => listTransactions({ limit: 5 }) });

  const onRefresh = () => {
    meQuery.refetch();
    txQuery.refetch();
  };

  const displayName = meQuery.data?.user.name?.split(' ')[0] ?? storedUser?.name?.split(' ')[0] ?? 'Toi';
  const balance = meQuery.data?.user.wallet?.balancePrincipal ?? '0';
  const recentTx = txQuery.data?.items ?? [];

  // Si c'est l'anniversaire du user aujourd'hui ET qu'il a opté pour la visibilité publique
  // → on affiche un bandeau "C'est mon anniv 🎉" sur la home.
  const meUser = meQuery.data?.user;
  const isMyBirthdayToday = (() => {
    if (!meUser?.dob || !meUser?.birthdayPublic) return false;
    const dob = new Date(meUser.dob);
    const today = new Date();
    return dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();
  })();

  return (
    <ScreenContainer>
      <FunBackground palette="cream" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={meQuery.isRefetching || txQuery.isRefetching} onRefresh={onRefresh} tintColor={colors.coral} />}
      >
        {/* Greeting */}
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.akwaaba}>Akwaaba,</Text>
            <Text style={styles.name}>
              {displayName} <Animated.Text style={[wiggleStyle, { display: 'flex' }]}>👋</Animated.Text>
            </Text>
            {isMyBirthdayToday && (
              <View style={styles.birthdayBanner}>
                <Text style={styles.birthdayBannerEmoji}>🎂</Text>
                <Text style={styles.birthdayBannerText}>
                  C'est ton anniv aujourd'hui ! Tes proches sont notifiés.
                </Text>
              </View>
            )}
          </View>
          <HeaderAvatar />
        </View>

        {/* Balance */}
        <View style={{ paddingHorizontal: 18, marginTop: 18 }}>
          <BalanceCard
            amount={fmtFCFA(balance)}
            onTopUp={() => navigation.navigate('TopUpMethod')}
            onWithdraw={() => {}}
          />
        </View>

        {/* Fêtes du jour — section dédiée sur l'accueil */}
        <View style={{ paddingHorizontal: 22, marginTop: 18 }}>
          <BirthdayStrip onSeeAll={() => {}} />
        </View>

        {/* Occasions */}
        <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Envoie un cadeau <Sparkle size={14} color={colors.mango} />
            </Text>
            <Text style={styles.sectionMeta}>10 occasions</Text>
          </View>
          <View style={styles.occGrid}>
            <OccasionTile o={OCCASIONS[0]} anim={wiggleStyle} />
            <OccasionTile o={OCCASIONS[1]} anim={pulseStyle} />
            <OccasionTile o={OCCASIONS[2]} anim={bobStyle} />
            <OccasionTile o={OCCASIONS[3]} anim={floatStyle} />
          </View>
        </View>

        {/* Activity */}
        <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activité récente</Text>
            <Pressable onPress={() => navigation.navigate('History')}>
              <Text style={styles.sectionLink}>Tout voir →</Text>
            </Pressable>
          </View>
          <Card pad={0}>
            {recentTx.length === 0 ? (
              <Text style={styles.emptyText}>
                Aucune activité pour l'instant. Envoie ton premier cadeau !
              </Text>
            ) : (
              recentTx.map((tx, i) => <ActivityRow key={tx.id} tx={tx} last={i === recentTx.length - 1} />)
            )}
          </Card>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  greetingRow: { paddingHorizontal: 22, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  akwaaba: { fontFamily: fonts.displayItalic, fontSize: 14, color: colors.ink2 },
  name: { fontFamily: fonts.displayMedium, fontSize: 26, color: colors.ink, letterSpacing: -0.5 },
  birthdayBanner: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: 'rgba(244,72,111,0.12)', borderWidth: 1, borderColor: 'rgba(244,72,111,0.3)', maxWidth: 260 },
  birthdayBannerEmoji: { fontSize: 18 },
  birthdayBannerText: { flex: 1, fontFamily: fonts.displaySemiBold, fontSize: 12, color: colors.coralDeep },
  bellBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.pink },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  sectionTitle: { fontFamily: fonts.displayMedium, fontSize: 20, color: colors.ink, letterSpacing: -0.4 },
  sectionMeta: { fontSize: 12, color: colors.ink2, fontFamily: fonts.displayItalic },
  sectionLink: { fontSize: 12, color: colors.coral, fontFamily: fonts.bodyBold },
  occGrid: { flexDirection: 'row', gap: 8 },
  occ: { flex: 1, aspectRatio: 1, borderRadius: 16, padding: 10, justifyContent: 'space-between', overflow: 'hidden' },
  occLabel: { fontFamily: fonts.displaySemiBold, fontSize: 13, lineHeight: 14 },
  act: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  actDivider: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  actAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  actInitial: { fontFamily: fonts.displaySemiBold, fontSize: 15, color: colors.bg },
  actName: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  actNote: { fontFamily: fonts.displayItalic, fontSize: 12, color: colors.ink3 },
  actAmt: { fontFamily: fonts.bodyBold, fontSize: 14 },
  emptyText: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink3, textAlign: 'center', padding: 20 },
});
