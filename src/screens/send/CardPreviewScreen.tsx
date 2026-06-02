// CardPreview — gros aperçu d'une carte + métadonnées + messages suggérés
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { GiftCard } from '../../components/ui/GiftCard';
import { Card } from '../../components/ui/Card';
import { useFloat } from '../../theme/animations';
import { colors, radius, CardPalette } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

const FACTS = [
  { l: 'Designer', v: 'Équipe Donia · interne' },
  { l: 'Publiée le', v: '12 mars 2026' },
  { l: 'Catégorie', v: 'Famille · Fêtes' },
  { l: 'Variantes', v: '5 messages suggérés' },
];

const SUGGESTIONS = [
  'Joyeux anniversaire 🎂',
  'Une belle année qui commence !',
  'Profite bien de ta journée 💕',
  'Une pensée pour toi ✨',
];

export function CardPreviewScreen({ navigation, route }: RootStackScreenProps<'CardPreview'>) {
  const themeKey = (route.params?.themeKey as CardPalette) || 'coral';
  const floatStyle = useFloat({ duration: 6000 });

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader
        title="Aperçu"
        onBack={() => navigation.goBack()}
        rightAction={
          <Pressable>
            <Text style={styles.share}>Partager</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 130 }}>
        <Animated.View style={floatStyle}>
          <GiftCard
            occasion="Joyeux anniversaire,"
            amount="10 000"
            recipient="Kofi"
            sender="Awa"
            message="Profite bien de ta journée mon frère, je pense à toi."
            palette={themeKey}
          />
        </Animated.View>

        {/* Facts */}
        <Card pad={16} style={{ marginTop: 16 }}>
          <Text style={styles.label}>À propos de cette carte</Text>
          {FACTS.map((r, i) => (
            <View key={i} style={[styles.row, i < FACTS.length - 1 && styles.rowDivider]}>
              <Text style={styles.rowLabel}>{r.l}</Text>
              <Text style={styles.rowValue}>{r.v}</Text>
            </View>
          ))}
        </Card>

        {/* Suggestions */}
        <View style={{ marginTop: 14 }}>
          <Text style={styles.label}>Messages suggérés ✨</Text>
          <View style={{ gap: 6 }}>
            {SUGGESTIONS.map((m) => (
              <Pressable key={m} style={styles.sug}>
                <Text style={styles.sugText}>{m}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Utiliser cette carte" pulse onPress={() => navigation.navigate('SendRecipient', { categoryKey: themeKey })} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  share: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.coral },
  label: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  rowLabel: { fontSize: 13, color: colors.ink2 },
  rowValue: { fontSize: 13, fontFamily: fonts.bodySemiBold, color: colors.ink },
  sug: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft },
  sugText: { fontSize: 13, color: colors.ink },
  footer: { position: 'absolute', bottom: 28, left: 22, right: 22 },
});
