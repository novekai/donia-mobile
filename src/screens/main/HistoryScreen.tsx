// History — filtres + summary card indigo + groupes Aujourd'hui / Hier — wiré à l'API
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { Sparkle } from '../../components/deco/Sparkle';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { HeaderAvatar } from '../../components/composed/HeaderAvatar';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { Card } from '../../components/ui/Card';
import { colors, radius, spacing } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { MainTabScreenProps } from '../../navigation/types';
import { listTransactions } from '../../api/transactions';
import type { Transaction, TxType, TxStatus } from '../../api/types';

// Petit badge inline pour distinguer les transactions PENDING/FAILED/REFUNDED des SUCCESS.
// Le label est traduit dans le composant via t() — ici on garde juste les couleurs.
const STATUS_STYLE: Partial<Record<TxStatus, { bg: string; fg: string }>> = {
  PENDING: { bg: 'rgba(255,199,0,0.18)', fg: '#8a6800' },
  FAILED: { bg: 'rgba(214,46,85,0.14)', fg: colors.coralDeep },
  REFUNDED: { bg: 'rgba(92,138,69,0.15)', fg: colors.green },
};

type FilterKey = 'all' | 'sent' | 'received' | 'topups';
const FILTERS: { key: FilterKey; type?: TxType; isTopup?: boolean }[] = [
  { key: 'all', type: undefined },
  { key: 'sent', type: 'SEND' },
  { key: 'received', type: 'RECEIVE' },
  { key: 'topups', type: undefined, isTopup: true },
];

type FilterItem = (typeof FILTERS)[number];

const TX_META: Record<TxType, { initial: string; emoji: string; color: string; whoPrefix: string; neg: boolean }> = {
  SEND:               { initial: 'E', emoji: '✉️', color: colors.coral, whoPrefix: 'Envoi',         neg: true },
  RECEIVE:            { initial: 'R', emoji: '🎁', color: colors.pink,  whoPrefix: 'Reçu',          neg: false },
  TOPUP_MOBILE_MONEY: { initial: '+', emoji: '📱', color: colors.mint,  whoPrefix: 'Recharge MM',    neg: false },
  TOPUP_CODE:         { initial: '+', emoji: '🎟️', color: colors.mango, whoPrefix: 'Recharge code',  neg: false },
  WITHDRAWAL:         { initial: '-', emoji: '🏧', color: colors.plum,  whoPrefix: 'Retrait',        neg: true },
  COMMISSION:         { initial: '%', emoji: '💼', color: colors.indigo, whoPrefix: 'Commission',    neg: false },
  REFERRAL_BONUS:     { initial: '*', emoji: '✨', color: colors.mango, whoPrefix: 'Parrainage',     neg: false },
  CAGNOTTE_IN:        { initial: 'C', emoji: '🎂', color: colors.plum,  whoPrefix: 'Cagnotte',       neg: true },
};

function fmt(s: string | number | undefined): string {
  if (s === undefined || s === null) return '0';
  const n = typeof s === 'string' ? Number(s) : s;
  return n.toLocaleString('fr-FR').replace(/,/g, ' ');
}

function dayGroupLabel(d: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

export function HistoryScreen({ navigation }: MainTabScreenProps<'History'>) {
  const { t } = useTranslation();
  const [filterIdx, setFilterIdx] = useState(0);
  const filter = FILTERS[filterIdx] as FilterItem;

  const FILTER_LABELS: Record<FilterKey, string> = {
    all: t('history.filterAll'),
    sent: t('history.filterSent'),
    received: t('history.filterReceived'),
    topups: t('history.filterTopups'),
  };

  const STATUS_LABELS: Record<TxStatus, string | null> = {
    SUCCESS: null,
    PENDING: t('history.statusPending'),
    FAILED: t('history.statusFailed'),
    REFUNDED: t('history.statusRefunded'),
  };

  const txQuery = useQuery({
    queryKey: ['transactions', filter.key],
    queryFn: () => listTransactions({ type: filter.type, limit: 50 }),
  });

  const items = txQuery.data?.items ?? [];

  // Le sommaire mensuel ne doit refléter QUE les transactions abouties (SUCCESS).
  // Les paiements en attente ou refusés ne sont pas du vrai cash entrant/sortant.
  const monthSummary = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let sent = 0;
    let received = 0;
    for (const tx of items) {
      if (tx.status !== 'SUCCESS') continue;
      const d = new Date(tx.createdAt);
      if (d < monthStart) continue;
      const amt = Number(tx.amount);
      if (tx.type === 'SEND' || tx.type === 'WITHDRAWAL' || tx.type === 'CAGNOTTE_IN') sent += amt;
      else if (tx.type === 'RECEIVE' || tx.type === 'TOPUP_MOBILE_MONEY' || tx.type === 'TOPUP_CODE' || tx.type === 'COMMISSION' || tx.type === 'REFERRAL_BONUS') received += amt;
    }
    return { sent, received };
  }, [items]);

  // Filter for "topups" view (combines TOPUP types)
  const filteredItems = useMemo(() => {
    if (filter.key === 'topups') return items.filter((tx) => tx.type === 'TOPUP_MOBILE_MONEY' || tx.type === 'TOPUP_CODE');
    return items;
  }, [items, filter]);

  // Group by day
  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of filteredItems) {
      const d = new Date(tx.createdAt);
      const label = dayGroupLabel(d);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(tx);
    }
    return Array.from(map, ([day, items]) => ({ day, items }));
  }, [filteredItems]);

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title={t('history.title')} hideBack rightAction={<HeaderAvatar />} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={txQuery.isRefetching} onRefresh={() => txQuery.refetch()} tintColor={colors.coral} />}
      >
        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((f, i) => {
            const on = i === filterIdx;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilterIdx(i)}
                style={[styles.chip, on && { backgroundColor: colors.coral }]}
              >
                <Text style={[styles.chipText, on && { color: colors.bg }]}>{FILTER_LABELS[f.key]}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Summary card */}
        <View style={{ paddingHorizontal: 22 }}>
          <BrandGradient variant="indigo" style={styles.summary}>
            <Sparkle size={14} color={colors.mango} style={{ position: 'absolute', top: 10, right: 14 }} />
            <View style={styles.summaryRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>{t('history.sentThisMonth')}</Text>
                <Text style={styles.summaryValue}>{fmt(monthSummary.sent)} <Text style={styles.summaryUnit}>FCFA</Text></Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={{ flex: 1, paddingLeft: 14 }}>
                <Text style={styles.summaryLabel}>{t('history.receivedThisMonth')}</Text>
                <Text style={[styles.summaryValue, { color: colors.mint }]}>+{fmt(monthSummary.received)} <Text style={styles.summaryUnit}>FCFA</Text></Text>
              </View>
            </View>
          </BrandGradient>
        </View>

        {/* Groups */}
        <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
          {groups.length === 0 ? (
            <Card pad={20}>
              <Text style={styles.emptyText}>
                {txQuery.isLoading ? t('common.loading') : t('history.empty')}
              </Text>
            </Card>
          ) : (
            groups.map((g) => (
              <View key={g.day} style={{ marginBottom: 16 }}>
                <Text style={styles.dayLabel}>{g.day}</Text>
                <Card pad={0}>
                  {g.items.map((t, i) => {
                    const meta = TX_META[t.type];
                    const time = new Date(t.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                    const sign = meta.neg ? '−' : '+';
                    const statusStyle = STATUS_STYLE[t.status];
                    const statusLabel = STATUS_LABELS[t.status];
                    const dim = t.status !== 'SUCCESS';
                    return (
                      <Pressable key={t.id} onPress={() => navigation.navigate('TxDetail', { txId: t.id })}>
                        <View style={[styles.row, i < g.items.length - 1 && styles.rowDivider]}>
                          <View style={[styles.avatar, { backgroundColor: meta.color }, dim && { opacity: 0.55 }]}>
                            <Text style={styles.avatarText}>{meta.initial}</Text>
                            <View style={styles.avatarBadge}>
                              <Text style={{ fontSize: 10 }}>{meta.emoji}</Text>
                            </View>
                          </View>
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <Text style={[styles.who, dim && { color: colors.ink2 }]}>{meta.whoPrefix}</Text>
                              {statusStyle && statusLabel && (
                                <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
                                  <Text style={[styles.statusPillText, { color: statusStyle.fg }]}>{statusLabel}</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.note}>{time}</Text>
                          </View>
                          <Text
                            style={[
                              styles.amt,
                              { color: meta.neg ? colors.ink : colors.green },
                              t.status === 'FAILED' && { color: colors.ink3, textDecorationLine: 'line-through' },
                              t.status === 'PENDING' && { color: colors.ink3 },
                            ]}
                          >
                            {sign}{fmt(t.amount)}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </Card>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filters: { paddingHorizontal: 22, paddingTop: 16, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  chipText: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.ink },
  summary: { borderRadius: radius.md, padding: 14, marginTop: 18, overflow: 'hidden' },
  summaryRow: { flexDirection: 'row' },
  summaryLabel: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.bg, opacity: 0.7, letterSpacing: 0.8, textTransform: 'uppercase' },
  summaryValue: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.bg, marginTop: 2 },
  summaryUnit: { fontSize: 11, opacity: 0.7 },
  summaryDivider: { width: 1, backgroundColor: 'rgba(253,247,246,0.2)' },
  dayLabel: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2, marginBottom: 8, paddingLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.displaySemiBold, fontSize: 15, color: colors.bg },
  avatarBadge: { position: 'absolute', bottom: -2, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  who: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  note: { fontSize: 11, color: colors.ink3 },
  amt: { fontFamily: fonts.bodyBold, fontSize: 14 },
  statusPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  statusPillText: { fontFamily: fonts.bodyBold, fontSize: 9.5, letterSpacing: 0.4, textTransform: 'uppercase' },
  emptyText: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink3, textAlign: 'center', padding: 8, lineHeight: 20 },
});
