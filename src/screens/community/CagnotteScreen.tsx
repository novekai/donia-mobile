// Cagnotte — hero progress + barre shimmer + contributeurs (branche API)
// Si `id` est passe en route param : affiche cette cagnotte.
// Sinon : affiche la 1ere de mes cagnottes actives, ou ecran vide + CTA "Creer une cagnotte".
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { SunRays } from '../../components/deco/SunRays';
import { Sparkle } from '../../components/deco/Sparkle';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Shimmer } from '../../components/ui/Shimmer';
import { IconPlus } from '../../components/ui/Icons';
import { colors, radius, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { getCagnotte, listMyCagnottes, contributeCagnotte } from '../../api/cagnottes';
import { getApiErrorMessage } from '../../api/client';

function fmt(s: string | number): string {
  const n = typeof s === 'string' ? Number(s) : s;
  return Math.round(n).toLocaleString('fr-FR').replace(/,/g, ' ');
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86400000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return 'il y a 1 jour';
  return `il y a ${days} jours`;
}

const AVATAR_COLORS = [colors.coral, colors.indigo, colors.pink, colors.mango, colors.mint, colors.plum];
function colorFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]!;
}

export function CagnotteScreen({ navigation, route }: RootStackScreenProps<'Cagnotte'>) {
  const queryClient = useQueryClient();
  const explicitId = route.params?.id;
  const [contributing, setContributing] = useState(false);

  const minePromise = useQuery({ queryKey: ['cagnottes-mine'], queryFn: listMyCagnottes, enabled: !explicitId });
  const targetId = explicitId ?? minePromise.data?.items.find((c) => c.status === 'ACTIVE')?.id ?? null;

  const detailQuery = useQuery({
    queryKey: ['cagnotte', targetId],
    queryFn: () => getCagnotte(targetId!),
    enabled: Boolean(targetId),
  });

  const isLoading = minePromise.isLoading || (Boolean(targetId) && detailQuery.isLoading);
  const cagnotte = detailQuery.data?.cagnotte;

  async function onContribute() {
    if (!cagnotte || contributing) return;
    Alert.prompt(
      'Contribuer à la cagnotte',
      `Montant en FCFA (min 100, max ${Math.max(1, Number(cagnotte.goalAmount) - Number(cagnotte.totalRaised)).toLocaleString('fr-FR')})`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Contribuer',
          onPress: async (val?: string) => {
            const amount = Number(val ?? '0');
            if (!Number.isFinite(amount) || amount < 100) {
              return Alert.alert('Montant invalide', 'Au moins 100 FCFA.');
            }
            setContributing(true);
            try {
              await contributeCagnotte(cagnotte.id, { amount });
              await queryClient.invalidateQueries({ queryKey: ['cagnotte', cagnotte.id] });
              await queryClient.invalidateQueries({ queryKey: ['cagnottes-mine'] });
              await queryClient.invalidateQueries({ queryKey: ['me'] });
              Alert.alert('Merci !', `Tu as contribué ${amount.toLocaleString('fr-FR').replace(/,/g, ' ')} FCFA à la cagnotte.`);
            } catch (e) {
              Alert.alert('Contribution impossible', getApiErrorMessage(e));
            } finally {
              setContributing(false);
            }
          },
        },
      ],
      'plain-text',
      '1000',
      'numeric',
    );
  }

  return (
    <ScreenContainer>
      <FunBackground palette="cream" />
      <ScreenHeader
        title="Cagnotte"
        onBack={() => navigation.goBack()}
        rightAction={
          cagnotte && (
            <Pressable onPress={() => Alert.alert('Bientôt', 'Le partage par lien arrivera bientôt.')}>
              <Text style={styles.invite}>Inviter</Text>
            </Pressable>
          )
        }
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={detailQuery.isRefetching}
            onRefresh={() => {
              if (cagnotte) queryClient.invalidateQueries({ queryKey: ['cagnotte', cagnotte.id] });
              else queryClient.invalidateQueries({ queryKey: ['cagnottes-mine'] });
            }}
            tintColor={colors.coral}
          />
        }
      >
        {isLoading && (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <ActivityIndicator color={colors.coral} />
          </View>
        )}

        {!isLoading && !cagnotte && (
          <View style={{ paddingHorizontal: 22, paddingTop: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 48 }}>🎁</Text>
            <Text style={styles.emptyTitle}>Aucune cagnotte active</Text>
            <Text style={styles.emptySub}>
              Crée une cagnotte pour rassembler tes proches autour d’un cadeau commun (anniversaire surprise, mariage, condoléances…).
            </Text>
            <View style={{ marginTop: 22, width: '100%' }}>
              <Button
                label="Créer une cagnotte"
                pulse
                leftIcon={<IconPlus size={16} color={colors.bg} strokeWidth={2.5} />}
                onPress={() => navigation.navigate('CagnotteCreate')}
              />
            </View>
          </View>
        )}

        {cagnotte && (
          <>
            <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
              <BrandGradient variant="indigo" style={[styles.hero, shadow.indigo]}>
                <View style={{ position: 'absolute', top: -80, right: -80, opacity: 0.28 }}>
                  <SunRays size={220} color={colors.mango} />
                </View>
                <Sparkle size={14} color={colors.mango} style={{ position: 'absolute', top: 24, right: 100 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 22 }}>🎁</Text>
                  <Text style={styles.kicker}>
                    {cagnotte.status === 'ACTIVE' ? `Cagnotte active · ${cagnotte.contributions.length} contrib.` : `Cagnotte ${cagnotte.status.toLowerCase()}`}
                  </Text>
                </View>
                <Text style={styles.heroTitle}>{cagnotte.title}</Text>
                {cagnotte.description && <Text style={styles.heroDesc}>{cagnotte.description}</Text>}
                <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                  <Text style={styles.amount}>{fmt(cagnotte.totalRaised)}</Text>
                  <Text style={styles.amountGoal}>/ {fmt(cagnotte.goalAmount)} FCFA</Text>
                </View>
                <View style={styles.bar}>
                  <Shimmer style={{ opacity: 0.4 }} />
                  <BrandGradient
                    variant="mango"
                    style={[styles.barFill, { width: `${Math.min(100, (Number(cagnotte.totalRaised) / Number(cagnotte.goalAmount)) * 100)}%` }]}
                  />
                </View>
                <Text style={styles.barHint}>
                  {((Number(cagnotte.totalRaised) / Number(cagnotte.goalAmount)) * 100).toFixed(0)}% atteint
                  {Number(cagnotte.goalAmount) > Number(cagnotte.totalRaised) && (
                    ` · plus que ${fmt(Number(cagnotte.goalAmount) - Number(cagnotte.totalRaised))} FCFA`
                  )}
                  {cagnotte.deadline && ` · clôture le ${new Date(cagnotte.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`}
                </Text>
              </BrandGradient>
            </View>

            {cagnotte.status === 'ACTIVE' && (
              <View style={{ paddingHorizontal: 22, marginTop: 16 }}>
                <Button
                  label={contributing ? 'Contribution…' : 'Contribuer à la cagnotte'}
                  pulse
                  leftIcon={<IconPlus size={16} color={colors.bg} strokeWidth={2.5} />}
                  onPress={onContribute}
                  disabled={contributing}
                />
              </View>
            )}

            <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Contributeurs</Text>
                <Text style={styles.sectionMeta}>
                  {cagnotte.contributions.length} {cagnotte.contributions.length === 1 ? 'personne' : 'personnes'}
                </Text>
              </View>
              {cagnotte.contributions.length === 0 ? (
                <View style={{ padding: 18, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.lineSoft, alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, color: colors.ink2, textAlign: 'center', lineHeight: 18 }}>
                    Sois le premier à contribuer 🌟
                  </Text>
                </View>
              ) : (
                <Card pad={0}>
                  {cagnotte.contributions.map((c, i) => {
                    const color = colorFor(c.contributorId);
                    const initial = (c.contributor.name[0] ?? '?').toUpperCase();
                    return (
                      <View key={c.id} style={[styles.row, i < cagnotte.contributions.length - 1 && styles.rowDivider]}>
                        <View style={[styles.avatar, { backgroundColor: color }]}>
                          <Text style={[styles.avatarInitial, { color: colors.bg }]}>{initial}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.name}>{c.contributor.name}</Text>
                          <Text style={styles.when}>{timeAgo(c.createdAt)}</Text>
                        </View>
                        <Text style={styles.amt}>+{fmt(c.amount)}</Text>
                      </View>
                    );
                  })}
                </Card>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  invite: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.coral },

  hero: { padding: 22, borderRadius: radius.lg, overflow: 'hidden' },
  kicker: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.mango, letterSpacing: 1.2 },
  heroTitle: { marginTop: 12, fontFamily: fonts.displayMedium, fontSize: 22, color: colors.bg, letterSpacing: -0.3, lineHeight: 28 },
  heroDesc: { marginTop: 4, fontSize: 12, color: colors.bg, opacity: 0.78 },
  amount: { fontFamily: fonts.bodyBold, fontSize: 34, color: colors.bg, letterSpacing: -1 },
  amountGoal: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.bg, opacity: 0.75 },
  bar: { marginTop: 12, height: 8, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 99 },
  barHint: { marginTop: 8, fontSize: 11, color: colors.bg, opacity: 0.85, fontStyle: 'italic' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  sectionTitle: { fontFamily: fonts.displaySemiBold, fontSize: 15, color: colors.ink },
  sectionMeta: { fontSize: 11, color: colors.ink2, fontFamily: fonts.bodyRegular },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontFamily: fonts.displaySemiBold, fontSize: 15, color: colors.bg },
  name: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.ink },
  when: { fontSize: 11, color: colors.ink3, marginTop: 1 },
  amt: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.green },

  emptyTitle: { marginTop: 14, fontFamily: fonts.displayMedium, fontSize: 18, color: colors.ink, textAlign: 'center' },
  emptySub: { marginTop: 8, fontSize: 13, color: colors.ink2, textAlign: 'center', lineHeight: 19 },
});
