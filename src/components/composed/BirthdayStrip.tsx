// BirthdayStrip — section "Fêtes du jour" sur l'accueil.
// Affiche un compteur + avatars horizontaux des users qui fêtent leur anniv.
// Phase 1 : placeholder graphique sans données (le backend /v1/birthdays arrive en Phase 3).
// Phase 3 : brancher sur useQuery(getBirthdays).
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { BrandGradient } from '../brand/BrandGradient';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';

type Person = {
  initial: string;
  name: string;
  variant: 'coral' | 'pink' | 'mint' | 'mango' | 'indigo' | 'plum';
  day: 'today' | 'tomorrow' | 'after';
};

type Props = {
  people?: Person[];
  onSeeAll?: () => void;
  onPick?: (p: Person) => void;
};

export function BirthdayStrip({ people = [], onSeeAll, onPick }: Props) {
  const todayCount = people.filter((p) => p.day === 'today').length;

  if (people.length === 0) {
    return (
      <View style={[styles.wrap, styles.empty]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Fêtes du jour 🎉</Text>
          <Text style={styles.sub}>
            Quand un proche fête son anniversaire, il apparaît ici.
          </Text>
        </View>
        <Text style={styles.giftEmoji}>🎂</Text>
      </View>
    );
  }

  return (
    <Pressable onPress={onSeeAll} style={styles.wrap}>
      <Text style={styles.giftDeco}>🎉</Text>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Fêtes du jour 🎉</Text>
          <Text style={styles.sub}>
            <Text style={styles.subAccent}>{todayCount} personne{todayCount > 1 ? 's' : ''}</Text> fête{todayCount > 1 ? 'nt' : ''} son anniversaire aujourd'hui
          </Text>
        </View>
        <Text style={styles.seeAll}>Voir tout →</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.peopleRow}>
        {people.map((p, i) => (
          <Pressable key={i} onPress={() => onPick?.(p)} style={styles.person}>
            <View style={{ position: 'relative' }}>
              <BrandGradient variant={p.variant} style={[styles.avatar, p.day === 'today' && styles.avatarRing]}>
                <Text style={styles.initial}>{p.initial}</Text>
              </BrandGradient>
              <Text style={styles.cakeEmoji}>🎂</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
            <Text style={[styles.dayTag, p.day === 'today' ? styles.dayToday : styles.dayLater]}>
              {p.day === 'today' ? 'AUJ.' : p.day === 'tomorrow' ? 'DEMAIN' : 'APRÈS-D.'}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    backgroundColor: 'rgba(252,238,242,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(244,72,111,0.2)',
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  empty: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  giftDeco: { position: 'absolute', top: -10, right: -6, fontSize: 56, opacity: 0.12 },
  giftEmoji: { fontSize: 36 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  title: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.ink, letterSpacing: -0.3 },
  sub: { fontSize: 12, color: colors.ink2, marginTop: 2, lineHeight: 16 },
  subAccent: { fontFamily: fonts.bodyBold, color: colors.coral },
  seeAll: { fontSize: 12, color: colors.coral, fontFamily: fonts.bodyBold, marginTop: 2 },
  peopleRow: { gap: 14, paddingRight: 6 },
  person: { alignItems: 'center', width: 64 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarRing: { borderWidth: 2, borderColor: colors.mango },
  initial: { fontFamily: fonts.displaySemiBold, fontSize: 18, color: colors.bg },
  cakeEmoji: { position: 'absolute', bottom: -2, right: -4, fontSize: 16 },
  name: { fontFamily: fonts.displaySemiBold, fontSize: 11, color: colors.ink, marginTop: 8 },
  dayTag: { fontFamily: fonts.bodyBold, fontSize: 9, marginTop: 1, letterSpacing: 0.4 },
  dayToday: { color: colors.coral },
  dayLater: { color: colors.ink3 },
});
