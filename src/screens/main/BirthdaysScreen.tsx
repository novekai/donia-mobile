// Birthdays — écran "Fêtes du jour" avec filtre J / Demain / Après-demain.
// Cliquer sur une personne → flow d'envoi de carte (catégorie anniv) pré-rempli.
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { Card } from '../../components/ui/Card';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { listBirthdays, type BirthdayPerson } from '../../api/birthdays';

type Filter = 'today' | 'tomorrow';

const FILTERS: { key: Filter; label: string; emoji: string }[] = [
  { key: 'today', label: "Aujourd'hui", emoji: '🎂' },
  { key: 'tomorrow', label: 'Demain', emoji: '✨' },
];

export function BirthdaysScreen({ navigation }: RootStackScreenProps<'Birthdays'>) {
  const [filter, setFilter] = useState<Filter>('today');
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['birthdays'], queryFn: listBirthdays });

  const all = query.data?.people ?? [];
  // On garde les users today / tomorrow (after-demain pas affiche).
  const filtered = useMemo(() => all.filter((p) => p.day === filter), [all, filter]);
  const counts = useMemo(() => {
    const map: Record<Filter, number> = { today: 0, tomorrow: 0 };
    for (const p of all) {
      if (p.day === 'today' || p.day === 'tomorrow') map[p.day]++;
    }
    return map;
  }, [all]);

  function onSendCard(p: BirthdayPerson) {
    // Pré-remplit le flow d'envoi avec la catégorie "anniv" + le téléphone du destinataire.
    navigation.navigate('SendAmount', {
      categoryKey: 'anniv',
      recipientPhone: p.phone,
      recipientName: p.name,
    });
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
                {f.emoji} {f.label}
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
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 40 }}
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
                : "Personne ne fête demain."}
            </Text>
            <Text style={styles.emptySub}>
              Tes proches doivent activer "Annoncer mon anniversaire" dans leurs paramètres pour apparaître ici.
            </Text>
          </View>
        )}

        <View style={{ gap: 10 }}>
          {filtered.map((p) => (
            <Card key={p.id} pad={0} style={{ overflow: 'hidden' }}>
              <View style={styles.row}>
                <BrandGradient variant={p.variant === 'plum' ? 'indigo' : p.variant} style={styles.avatar}>
                  {p.avatarUrl ? (
                    <Image source={{ uri: p.avatarUrl }} style={styles.avatarImg} />
                  ) : (
                    <Text style={styles.avatarInitial}>{p.initial}</Text>
                  )}
                </BrandGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{p.name}</Text>
                  <Text style={styles.sub}>
                    {p.day === 'today' ? "C'est aujourd'hui 🎂" : 'Demain ✨'}
                  </Text>
                </View>
                <Pressable onPress={() => onSendCard(p)} style={styles.sendBtn}>
                  <Text style={styles.sendBtnText}>Offrir une carte →</Text>
                </Pressable>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
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
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: 52, height: 52, borderRadius: 26 },
  avatarInitial: { fontFamily: fonts.displaySemiBold, fontSize: 20, color: colors.bg },
  name: { fontFamily: fonts.displaySemiBold, fontSize: 15, color: colors.ink },
  sub: { fontSize: 12, color: colors.ink2, marginTop: 2 },
  sendBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99, backgroundColor: colors.coral },
  sendBtnText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.bg },

  emptyCard: { padding: 28, alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, marginTop: 20 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontFamily: fonts.displayMedium, fontSize: 15, color: colors.ink, marginBottom: 6, textAlign: 'center' },
  emptySub: { fontSize: 12, color: colors.ink3, textAlign: 'center', lineHeight: 18 },
});
