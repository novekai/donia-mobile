// SendCategory — 8 occasions en grille 2x4 + sélectionnée en relief
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ConcentricRings } from '../../components/deco/ConcentricRings';
import { Sparkle } from '../../components/deco/Sparkle';
import { StepHeader } from '../../components/composed/StepHeader';
import { HeaderAvatar } from '../../components/composed/HeaderAvatar';
import { Button } from '../../components/ui/Button';
import { IconCheck } from '../../components/ui/Icons';
import { useWiggle } from '../../theme/animations';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { MainTabScreenProps } from '../../navigation/types';

const OCCASIONS = [
  { key: 'bonjour', l: 'Bonjour', bg: colors.coral, ink: colors.bg, emoji: '👋' },
  { key: 'anniv', l: 'Anniversaire', bg: colors.pink, ink: colors.bg, emoji: '🎂' },
  { key: 'bravo', l: 'Bravo', bg: colors.mango, ink: colors.ink, emoji: '🎉' },
  { key: 'amour', l: "Je t'aime", bg: colors.plum, ink: colors.bg, emoji: '💖' },
  { key: 'condo', l: 'Condoléances', bg: colors.indigo, ink: colors.bg, emoji: '🕊️' },
  { key: 'mariage', l: 'Mariage', bg: colors.mint, ink: colors.ink, emoji: '💍' },
  { key: 'noel', l: 'Noël', bg: colors.coralDeep, ink: colors.bg, emoji: '🎄' },
  { key: 'goshop', l: 'GoShop', bg: colors.mango, ink: colors.ink, emoji: '🛍️' },
];

function CategoryTile({ o, selected, onPress }: { o: typeof OCCASIONS[number]; selected: boolean; onPress: () => void }) {
  const wiggleStyle = useWiggle();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tile,
        { backgroundColor: o.bg, transform: [{ scale: selected ? 1.03 : 1 }] },
        selected && styles.tileSelected,
      ]}
    >
      <View style={{ position: 'absolute', top: -30, right: -30 }}>
        <ConcentricRings size={110} color={o.ink} opacity={0.22} />
      </View>
      <Sparkle size={11} color={o.ink} style={{ position: 'absolute', top: 14, right: 14, opacity: 0.7 }} />
      <Animated.Text style={[selected ? wiggleStyle : undefined, { fontSize: 28 }]}>{o.emoji}</Animated.Text>
      <Text style={[styles.tileLabel, { color: o.ink }]}>{o.l}</Text>
      {selected && (
        <View style={styles.tileCheck}>
          <IconCheck size={11} color={colors.bg} strokeWidth={3.5} />
        </View>
      )}
    </Pressable>
  );
}

export function SendCategoryScreen({ navigation }: MainTabScreenProps<'Send'>) {
  const [selected, setSelected] = useState<string>('anniv');
  const selectedOcc = OCCASIONS.find((o) => o.key === selected);

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <StepHeader step={1} of={4} title="Choisis l'occasion" sub="Catégorie" onBack={() => navigation.navigate('Home')} rightSlot={<HeaderAvatar />} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 140 }}>
        <Text style={styles.kicker}>8 cartes thématiques · plus à venir</Text>
        <View style={styles.grid}>
          {OCCASIONS.map((o) => (
            <CategoryTile key={o.key} o={o} selected={o.key === selected} onPress={() => setSelected(o.key)} />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={`Continuer avec ${selectedOcc?.l || ''}`}
          pulse
          onPress={() => navigation.navigate('SendRecipient', { categoryKey: selected })}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: fonts.displayItalic, fontSize: 14, color: colors.ink2, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '47.5%', aspectRatio: 1.2, borderRadius: radius.md, padding: 14, overflow: 'hidden', justifyContent: 'space-between' },
  tileSelected: { borderWidth: 3, borderColor: colors.ink },
  tileLabel: { fontFamily: fonts.displaySemiBold, fontSize: 16 },
  tileCheck: { position: 'absolute', top: 10, left: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  footer: { position: 'absolute', bottom: 100, left: 22, right: 22 },
});
