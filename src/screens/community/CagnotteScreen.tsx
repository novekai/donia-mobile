// Cagnotte — hero progress + barre shimmer + contributeurs
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
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

const CONTRIBUTORS = [
  { name: 'Marie', amt: '10 000', color: colors.pink, initial: 'M' },
  { name: 'Sam', amt: '5 000', color: colors.mint, initial: 'S' },
  { name: 'Léa', amt: '15 000', color: colors.indigo, initial: 'L' },
  { name: 'Aïcha', amt: '5 000', color: colors.mango, ink: colors.ink, initial: 'A' },
  { name: 'Kofi', amt: '20 000', color: colors.coral, initial: 'K' },
];

export function CagnotteScreen({ navigation }: RootStackScreenProps<'Cagnotte'>) {
  const total = 55000;
  const goal = 100000;
  const progress = (total / goal) * 100;

  return (
    <ScreenContainer>
      <FunBackground palette="cream" />
      <ScreenHeader
        title="Cagnotte"
        onBack={() => navigation.goBack()}
        rightAction={
          <Pressable>
            <Text style={styles.invite}>Inviter</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
          <BrandGradient variant="indigo" style={[styles.hero, shadow.indigo]}>
            <View style={{ position: 'absolute', top: -80, right: -80, opacity: 0.28 }}>
              <SunRays size={220} color={colors.mango} />
            </View>
            <Sparkle size={14} color={colors.mango} style={{ position: 'absolute', top: 24, right: 100 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 22 }}>🎁</Text>
              <Text style={styles.kicker}>Cagnotte active · 5 contrib.</Text>
            </View>
            <Text style={styles.heroTitle}>
              Anniversaire surprise de <Text style={styles.heroItalic}>Maman</Text>
            </Text>
            <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Text style={styles.amount}>{total.toLocaleString('fr-FR').replace(/,/g, ' ')}</Text>
              <Text style={styles.amountGoal}>/ {goal.toLocaleString('fr-FR').replace(/,/g, ' ')} FCFA</Text>
            </View>
            <View style={styles.bar}>
              <Shimmer style={{ opacity: 0.4 }} />
              <BrandGradient variant="mango" style={[styles.barFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.barHint}>
              {progress.toFixed(0)}% atteint · plus que {(goal - total).toLocaleString('fr-FR').replace(/,/g, ' ')} FCFA · clôture le 14 juin
            </Text>
          </BrandGradient>
        </View>

        <View style={{ paddingHorizontal: 22, marginTop: 16 }}>
          <Button label="Contribuer à la cagnotte" pulse leftIcon={<IconPlus size={16} color={colors.bg} strokeWidth={2.5} />} />
        </View>

        <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contributeurs</Text>
            <Text style={styles.sectionMeta}>5 personnes</Text>
          </View>
          <Card pad={0}>
            {CONTRIBUTORS.map((c, i) => (
              <View key={i} style={[styles.row, i < CONTRIBUTORS.length - 1 && styles.rowDivider]}>
                <View style={[styles.avatar, { backgroundColor: c.color }]}>
                  <Text style={[styles.avatarInitial, { color: c.ink || colors.bg }]}>{c.initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{c.name}</Text>
                  <Text style={styles.when}>Il y a {i + 1} jour{i > 0 ? 's' : ''}</Text>
                </View>
                <Text style={styles.amt}>+{c.amt}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  invite: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.coral },
  hero: { borderRadius: radius.xl, padding: 22, overflow: 'hidden' },
  kicker: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.mango, letterSpacing: 1.4, textTransform: 'uppercase' },
  heroTitle: { marginTop: 8, fontFamily: fonts.displayMedium, fontSize: 22, color: colors.bg, letterSpacing: -0.4, lineHeight: 24 },
  heroItalic: { fontFamily: fonts.displayItalic, color: colors.mango },
  amount: { fontFamily: fonts.bodyBold, fontSize: 36, color: colors.bg, letterSpacing: -1 },
  amountGoal: { fontSize: 13, color: colors.bg, opacity: 0.7 },
  bar: { marginTop: 12, height: 8, borderRadius: 99, backgroundColor: 'rgba(255,241,220,0.15)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 99 },
  barHint: { marginTop: 6, fontSize: 11, color: colors.bg, opacity: 0.8, fontStyle: 'italic' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  sectionTitle: { fontFamily: fonts.displayMedium, fontSize: 17, color: colors.ink },
  sectionMeta: { fontSize: 12, color: colors.ink2, fontFamily: fonts.displayItalic },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontFamily: fonts.displaySemiBold, fontSize: 14 },
  name: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  when: { fontFamily: fonts.displayItalic, fontSize: 11, color: colors.ink3 },
  amt: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.green },
});
