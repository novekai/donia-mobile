// Notifications — vraies notifs depuis l'API (plus de mock).
// Tabs : Toutes / Non lues (Mentions retiré le 06/2026, pas de fonctionnalité dédiée).
// Groupes par jour : Aujourd'hui / Hier / Cette semaine / Plus ancien.
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import Animated from 'react-native-reanimated';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { usePulse } from '../../theme/animations';
import { colors } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { listNotifications, markRead } from '../../api/notifications';
import type { Notification } from '../../api/types';

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (diff < 172800) return 'hier';
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function dayBucket(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400_000;
  const weekAgo = today - 7 * 86400_000;
  const t = d.getTime();
  if (t >= today) return "Aujourd'hui";
  if (t >= yesterday) return 'Hier';
  if (t >= weekAgo) return 'Cette semaine';
  return 'Plus ancien';
}

// Couleur + emoji par type — par défaut quand le backend ne fournit pas d'emoji.
function styleFor(n: Notification): { color: string; emoji: string } {
  if (n.emoji) {
    // Couleur dérivée du type ; fallback indigo.
    const c =
      n.type === 'card_received' ? colors.pink :
      n.type === 'card_redeemed' ? colors.mint :
      n.type === 'new_filleul' ? colors.mango :
      n.type === 'topup_received' ? colors.mint :
      n.type === 'kyc_approved' ? colors.mint :
      n.type === 'anonymous_message' ? colors.coral :
      colors.indigo;
    return { color: c, emoji: n.emoji };
  }
  return { color: colors.indigo, emoji: '🔔' };
}

export function NotificationsScreen({ navigation }: RootStackScreenProps<'Notifications'>) {
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const pulseStyle = usePulse();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', tab],
    queryFn: () => listNotifications({ unreadOnly: tab === 'unread', limit: 50 }),
    refetchInterval: 60_000,
  });

  const all = query.data?.items ?? [];
  const unreadCount = query.data?.unread ?? 0;

  async function onMarkAllRead() {
    if (all.length === 0) return;
    try {
      await markRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch {}
  }

  // Groupe par bucket, en préservant l'ordre desc.
  const groups = useMemo(() => {
    const buckets = new Map<string, Notification[]>();
    for (const n of all) {
      const b = dayBucket(n.createdAt);
      if (!buckets.has(b)) buckets.set(b, []);
      buckets.get(b)!.push(n);
    }
    return Array.from(buckets, ([day, items]) => ({ day, items }));
  }, [all]);

  const TABS = [
    { key: 'all' as const, l: 'Toutes', count: all.length },
    { key: 'unread' as const, l: 'Non lues', count: unreadCount },
  ];

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader
        title="Notifications"
        onBack={() => navigation.goBack()}
        rightAction={
          unreadCount > 0 ? (
            <Pressable onPress={onMarkAllRead}>
              <Text style={styles.markRead}>Tout marquer lu</Text>
            </Pressable>
          ) : undefined
        }
      />

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <Pressable key={t.key} onPress={() => setTab(t.key)} style={[styles.tab, on && { backgroundColor: colors.coral }]}>
              <Text style={[styles.tabLabel, on && { color: colors.bg }]}>{t.l}</Text>
              {t.count > 0 && (
                <View style={[styles.tabCount, { backgroundColor: on ? 'rgba(253,247,246,0.25)' : 'rgba(244,72,111,0.15)' }]}>
                  <Text style={[styles.tabCountText, { color: on ? colors.bg : colors.coral }]}>{t.count}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 22 }}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ['notifications'] })}
            tintColor={colors.coral}
          />
        }
      >
        {query.isLoading && (
          <Text style={styles.empty}>Chargement…</Text>
        )}

        {!query.isLoading && groups.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🔕</Text>
            <Text style={styles.emptyTitle}>
              {tab === 'unread' ? 'Aucune notif non lue' : 'Aucune notification'}
            </Text>
            <Text style={styles.emptySub}>
              {tab === 'unread'
                ? 'Tu es à jour 🎉'
                : 'Tes notifications apparaîtront ici dès qu\'il y aura de l\'activité.'}
            </Text>
          </View>
        )}

        {groups.map((g) => (
          <View key={g.day} style={{ marginBottom: 18 }}>
            <Text style={styles.dayLabel}>{g.day}</Text>
            <Card pad={0}>
              {g.items.map((n, i) => {
                const { color, emoji } = styleFor(n);
                const unread = !n.readAt;
                return (
                  <View key={n.id} style={[styles.row, i < g.items.length - 1 && styles.rowDivider]}>
                    {unread && <Animated.View style={[pulseStyle, styles.unreadDot]} />}
                    <View style={[styles.icon, { backgroundColor: `${color}22` }]}>
                      <Text style={{ fontSize: 18 }}>{emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.text}>
                        <Text style={styles.who}>{n.title}</Text>
                        {n.body ? ` ${n.body}` : ''}
                      </Text>
                      <Text style={styles.time}>{relativeTime(n.createdAt)}</Text>
                    </View>
                  </View>
                );
              })}
            </Card>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  markRead: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.coral },
  tabs: { paddingHorizontal: 22, paddingTop: 14, flexDirection: 'row', gap: 6 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  tabLabel: { fontFamily: fonts.displaySemiBold, fontSize: 12, color: colors.ink },
  tabCount: { paddingHorizontal: 6, borderRadius: 99, minWidth: 16, alignItems: 'center' },
  tabCountText: { fontSize: 10, fontFamily: fonts.bodyBold },
  dayLabel: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2, marginBottom: 8, paddingLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  unreadDot: { position: 'absolute', top: 18, left: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.coral },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 13, lineHeight: 18, color: colors.ink },
  who: { fontFamily: fonts.displaySemiBold },
  time: { fontFamily: fonts.displayItalic, fontSize: 11, color: colors.ink3, marginTop: 3 },
  empty: { textAlign: 'center', paddingVertical: 40, color: colors.ink2, fontFamily: fonts.displayItalic },
  emptyCard: { padding: 28, alignItems: 'center', borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, marginTop: 20 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontFamily: fonts.displayMedium, fontSize: 15, color: colors.ink, marginBottom: 4 },
  emptySub: { fontSize: 12, color: colors.ink3, textAlign: 'center', lineHeight: 18 },
});
