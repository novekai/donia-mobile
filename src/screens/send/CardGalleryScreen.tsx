// CardGallery — grille 2 colonnes des 10 cartes thématiques + filtres + sélection
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ConcentricRings } from '../../components/deco/ConcentricRings';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { IconCheck } from '../../components/ui/Icons';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

const THEMES = [
  { key: 'anniversaire', label: 'Anniversaire', emoji: '🎂', bg: colors.coral, ink: colors.bg, deco: colors.coralSoft },
  { key: 'valentin', label: 'Saint-Valentin', emoji: '💖', bg: colors.pink, ink: colors.bg, deco: colors.pinkSoft },
  { key: 'mariage', label: 'Mariage', emoji: '💍', bg: colors.surface, ink: colors.ink, deco: colors.mango },
  { key: 'condoleances', label: 'Condoléances', emoji: '🕊️', bg: colors.plum, ink: colors.bg, deco: colors.mango },
  { key: 'bravo', label: 'Bravo', emoji: '🏆', bg: colors.mango, ink: colors.ink, deco: colors.indigo },
  { key: 'noel', label: 'Noël', emoji: '🎄', bg: colors.mint, ink: colors.bg, deco: colors.mango },
  { key: 'tabaski', label: 'Tabaski / Aïd', emoji: '🌙', bg: colors.indigo, ink: colors.bg, deco: colors.mango },
  { key: 'naissance', label: 'Naissance', emoji: '👶', bg: colors.sky, ink: colors.bg, deco: colors.mango },
  { key: 'voyage', label: 'Bon voyage', emoji: '✈️', bg: colors.indigoDeep, ink: colors.bg, deco: colors.mango },
  { key: 'goshop', label: 'GoShop', emoji: '🛍️', bg: colors.surface, ink: colors.ink, deco: colors.coral },
];

const FILTERS = ['Toutes', 'Fêtes', 'Famille', 'Pro', 'Saison'];

export function CardGalleryScreen({ navigation }: RootStackScreenProps<'CardGallery'>) {
  const [filter, setFilter] = useState(0);
  const [selected, setSelected] = useState('anniversaire');

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader
        title="Choisis ta carte"
        subtitle="10 OCCASIONS · MAI 2026"
        onBack={() => navigation.goBack()}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map((f, i) => {
          const on = i === filter;
          return (
            <Pressable key={f} onPress={() => setFilter(i)} style={[styles.chip, on && { backgroundColor: colors.coral }]}>
              <Text style={[styles.chipText, on && { color: colors.bg }]}>{f}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 100 }}>
        <View style={styles.grid}>
          {THEMES.map((t) => {
            const on = t.key === selected;
            return (
              <Pressable
                key={t.key}
                onPress={() => setSelected(t.key)}
                onLongPress={() => navigation.navigate('CardPreview', { themeKey: t.key })}
                style={[styles.card, { backgroundColor: t.bg }, on && styles.cardSelected, t.bg === colors.surface && { borderWidth: 1, borderColor: colors.lineSoft }]}
              >
                <View style={{ position: 'absolute', top: -20, right: -20 }}>
                  <ConcentricRings size={90} color={t.deco} opacity={0.12} />
                </View>
                <View style={styles.cardEmoji}><Text style={{ fontSize: 28 }}>{t.emoji}</Text></View>
                {on && (
                  <View style={styles.cardCheck}>
                    <IconCheck size={11} color={colors.bg} strokeWidth={3.5} />
                  </View>
                )}
                <View style={styles.cardFoot}>
                  <Text style={[styles.cardBrand, { color: t.ink }]}>donia</Text>
                  <Text style={[styles.cardLabel, { color: t.ink }]}>{t.label}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.tip}>
          <Text style={{ fontSize: 18 }}>✨</Text>
          <Text style={styles.tipText}>
            <Text style={{ fontFamily: fonts.bodyBold }}>Bientôt :</Text> cartes animées (Lottie), cartes des partenaires, cartes saisonnières.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label={`Continuer avec ${(THEMES.find((t) => t.key === selected) || {}).label || ''}`} pulse onPress={() => navigation.navigate('SendRecipient', { categoryKey: selected })} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filters: { paddingHorizontal: 22, paddingTop: 14, gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  chipText: { fontFamily: fonts.displaySemiBold, fontSize: 12, color: colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingTop: 16 },
  card: { width: '47.5%', aspectRatio: 0.78, borderRadius: radius.md, padding: 12, overflow: 'hidden' },
  cardSelected: { borderWidth: 3, borderColor: colors.ink },
  cardEmoji: { alignSelf: 'flex-end' },
  cardCheck: { position: 'absolute', top: 8, left: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  cardFoot: { position: 'absolute', bottom: 10, left: 12, right: 12 },
  cardBrand: { fontFamily: fonts.displayItalic, fontSize: 12, opacity: 0.85 },
  cardLabel: { fontFamily: fonts.displaySemiBold, fontSize: 14, letterSpacing: -0.2, marginTop: 1 },
  tip: { marginTop: 14, padding: 12, borderRadius: 14, backgroundColor: 'rgba(249,160,28,0.15)', flexDirection: 'row', alignItems: 'center', gap: 10 },
  tipText: { flex: 1, fontSize: 12, color: colors.ink, lineHeight: 17 },
  footer: { position: 'absolute', bottom: 22, left: 22, right: 22 },
});
