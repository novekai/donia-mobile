// Birthdays — écran "Fêtes du jour" avec filtres J / Demain / Après-demain.
// Cliquer sur une personne → BirthdayProfile (profil + actions).
// FAB en bas à droite pour creer une cagnotte (anniversaire surprise).
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { Card } from '../../components/ui/Card';
import { colors, radius, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { listBirthdays, type BirthdayPerson } from '../../api/birthdays';

type Filter = 'today' | 'tomorrow' | 'after';

const FILTERS: { key: Filter; label: string; emoji: string }[] = [
  { key: 'today', label: "Aujourd'hui", emoji: '🎂' },
  { key: 'tomorrow', label: 'Demain', emoji: '✨' },
  { key: 'after', label: 'Après-demain', emoji: '🎉' },
];

export function BirthdaysScreen({ navigation }: RootStackScreenProps<'Birthdays'>) {
  const [filter, setFilter] = useState<Filter>('today');
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['birthdays'], queryFn: listBirthdays });

  const all = query.data?.people ?? [];
  const filtered = useMemo(() => all.filter((p) => p.day === filter), [all, filter]);
  const counts = useMemo(() => {
    const map: Record<Filter, number> = { today: 0, tomorrow: 0, after: 0 };
    for (const p of all) map[p.day]++;
    return map;
  }, [all]);

  function onOpenProfile(p: BirthdayPerson) {
    navigation.navigate('BirthdayProfile', { userId: p.id });
  }

  return (
    <ScreenContainer tabBar="home">
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Fêtes du jour 🎉" onBack={() => navigation.goBack()} />

      {/* Filtres — 3 chips de largeur egale sur une seule ligne */}
      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const on = f.key === filter;
          const n = counts[f.key];
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.chip, on && { backgroundColor: colors.coral, borderColor: colors.coral }]}
            >
              <Text style={[styles.chipText, on && { color: colors.bg }]} numberOfLines={1}>
                {f.label}
              </Text>
              {n > 0 && (
                <View style={[styles.chipBadge, on && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                  <Text style={[styles.chipBadgeText, on && { color: colors.bg }]}>{n}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ['birthdays'] })}
            tintColor={colors.coral}
          />
        }
      >
        {query.isLoading && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.coral} />
          </View>
        )}

        {!query.isLoading && filtered.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🎂</Text>
            <Text style={styles.emptyTitle}>
              {filter === 'today'
                ? "Personne ne fête son anniversaire aujourd'hui."
                : filter === 'tomorrow'
                  ? 'Personne ne fête demain.'
                  : 'Personne ne fête après-demain.'}
            </Text>
            <Text style={styles.emptySub}>
              Tes proches doivent activer "Être visible dans les Fêtes le jour J" pour apparaître ici.
            </Text>
          </View>
        )}

        <View style={{ gap: 10 }}>
          {filtered.map((p) => (
            <Pressable key={p.id} onPress={() => onOpenProfile(p)}>
              <Card pad={0} style={{ overflow: 'hidden' }}>
                <View style={styles.row}>
                  <BrandGradient variant={p.variant === 'plum' ? 'indigo' : p.variant} style={styles.avatar}>
                    {p.avatarUrl ? (
                      <Image source={{ uri: p.avatarUrl }} style={styles.avatarImg} />
                    ) : (
                      <Text style={styles.avatarInitial}>{p.initial}</Text>
                    )}
                  </BrandGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>
                      {p.name}
                      {p.age !== null && <Text style={styles.age}> · {p.age} ans</Text>}
                    </Text>
                    <Text style={styles.sub}>
                      {p.friendsInCommon > 0
                        ? `${p.friendsInCommon} ${p.friendsInCommon === 1 ? 'ami en commun' : 'amis en commun'}`
                        : p.day === 'today' ? "C'est aujourd'hui 🎂" : p.day === 'tomorrow' ? 'Demain ✨' : 'Après-demain 🎉'}
                    </Text>
                    <View style={styles.sendBtn}>
                      <Text style={styles.sendBtnText}>🎁 Offrir un cadeau</Text>
                    </View>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* FAB — créer une cagnotte d'anniversaire surprise */}
      <Pressable
        style={[styles.fab, shadow.coral]}
        onPress={() => navigation.navigate('CagnotteCreate')}
      >
        <BrandGradient variant="coral" style={styles.fabInner}>
          <Text style={styles.fabIcon}>+</Text>
        </BrandGradient>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filters: { paddingHorizontal: 22, paddingTop: 14, flexDirection: 'row', gap: 6 },
  chip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 8, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  chipText: { fontFamily: fonts.displaySemiBold, fontSize: 12, color: colors.ink, textAlign: 'center' },
  chipBadge: { paddingHorizontal: 6, borderRadius: 99, minWidth: 18, alignItems: 'center', backgroundColor: 'rgba(244,72,111,0.18)' },
  chipBadgeText: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.coralDeep },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: 56, height: 56, borderRadius: 28 },
  avatarInitial: { fontFamily: fonts.displaySemiBold, fontSize: 22, color: colors.bg },
  name: { fontFamily: fonts.displaySemiBold, fontSize: 15, color: colors.ink },
  age: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.ink2 },
  sub: { fontSize: 12, color: colors.ink2, marginTop: 2 },
  sendBtn: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, backgroundColor: colors.coral },
  sendBtnText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.bg },

  emptyCard: { padding: 28, alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, marginTop: 20 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontFamily: fonts.displayMedium, fontSize: 15, color: colors.ink, marginBottom: 6, textAlign: 'center' },
  emptySub: { fontSize: 12, color: colors.ink3, textAlign: 'center', lineHeight: 18 },

  fab: { position: 'absolute', bottom: 90, right: 22, width: 56, height: 56, borderRadius: 28, overflow: 'hidden' },
  fabInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { fontSize: 32, color: colors.bg, fontFamily: fonts.bodyBold, lineHeight: 36 },
});
