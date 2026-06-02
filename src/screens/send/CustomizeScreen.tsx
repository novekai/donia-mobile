// Customize — preview carte qui flotte + sélecteur de style + message + suggestions
import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { Sparkle } from '../../components/deco/Sparkle';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { GiftCard } from '../../components/ui/GiftCard';
import { useFloat } from '../../theme/animations';
import { colors, radius, CardPalette } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

const STYLES: { key: CardPalette; l: string; bg: string }[] = [
  { key: 'coral', l: 'Corail', bg: colors.coral },
  { key: 'indigo', l: 'Indigo', bg: colors.indigo },
  { key: 'mango', l: 'Mango', bg: colors.mango },
  { key: 'pink', l: 'Rose', bg: colors.pink },
  { key: 'mint', l: 'Mint', bg: colors.mint },
];

const SUGGESTIONS = ['Joyeux anniv 🎂', 'Profite bien 💕', 'Une belle année', 'Bonne fête 🌻'];

export function CustomizeScreen({ navigation, route }: RootStackScreenProps<'Customize'>) {
  const { recipientName, recipientPhone, amount = '10 000', categoryKey = 'anniv' } = route.params || {};
  const displayName = recipientName || 'Ton destinataire';
  const [palette, setPalette] = useState<CardPalette>('coral');
  const [message, setMessage] = useState('');
  const floatStyle = useFloat({ duration: 6000 });

  function onSave() {
    navigation.navigate('SendConfirm', {
      categoryKey,
      recipientPhone,
      recipientName,
      amount,
      palette,
      message: message || undefined,
    });
  }

  return (
    <ScreenContainer avoidKeyboard>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Personnaliser la carte" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 130 }} keyboardShouldPersistTaps="handled">
        <Animated.View style={floatStyle}>
          <GiftCard
            amount={amount}
            recipient={displayName}
            message={message || undefined}
            palette={palette}
          />
        </Animated.View>

        <View style={{ marginTop: 18 }}>
          <Text style={styles.label}>Style de carte</Text>
          <View style={styles.styles}>
            {STYLES.map((s) => {
              const on = s.key === palette;
              return (
                <Pressable
                  key={s.key}
                  onPress={() => setPalette(s.key)}
                  style={[styles.styleBtn, on && { borderWidth: 2, borderColor: colors.ink }]}
                >
                  <View style={[styles.styleSwatch, { backgroundColor: s.bg }]} />
                  <Text style={[styles.styleLabel, on && { fontFamily: fonts.bodyBold }]}>{s.l}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          <View style={styles.msgHeader}>
            <Text style={styles.label}>Ton message</Text>
            <Text style={styles.msgCount}>{message.length} / 140</Text>
          </View>
          <TextInput
            value={message}
            onChangeText={(v) => v.length <= 140 && setMessage(v)}
            multiline
            style={styles.msgInput}
            placeholderTextColor={colors.ink3}
          />
        </View>

        <View style={{ marginTop: 14 }}>
          <View style={styles.sugHeader}>
            <Sparkle size={12} color={colors.mango} />
            <Text style={styles.sugLabel}>Suggestions Anniversaire</Text>
          </View>
          <View style={styles.sugRow}>
            {SUGGESTIONS.map((s) => (
              <Pressable key={s} onPress={() => setMessage(s)} style={styles.sug}>
                <Text style={styles.sugText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Enregistrer ✨" pulse onPress={onSave} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2, marginBottom: 8 },
  styles: { flexDirection: 'row', gap: 8 },
  styleBtn: { flex: 1, padding: 6, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft },
  styleSwatch: { height: 32, borderRadius: 8, marginBottom: 4 },
  styleLabel: { fontSize: 10, textAlign: 'center', color: colors.ink, fontFamily: fonts.bodyMedium },
  msgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  msgCount: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.ink3 },
  msgInput: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.lineSoft, fontSize: 13, color: colors.ink, lineHeight: 20, minHeight: 60, textAlignVertical: 'top' },
  sugHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  sugLabel: { fontSize: 12, color: colors.ink2 },
  sugRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  sug: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  sugText: { fontSize: 12, color: colors.ink, fontFamily: fonts.bodyMedium },
  footer: { position: 'absolute', bottom: 28, left: 22, right: 22 },
});
