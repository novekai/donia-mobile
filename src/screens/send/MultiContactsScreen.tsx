// MultiContacts — header avec compteur + recherche + chips sélectionnés + liste
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { IconCheck } from '../../components/ui/Icons';
import { usePulse } from '../../theme/animations';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

const CONTACTS = [
  { name: 'Kofi Mensah', phone: '+229 94 50 21 87', op: 'MTN', initial: 'K', color: colors.coral, ink: colors.bg },
  { name: 'Marie Dossou', phone: '+229 95 11 03 42', op: 'Moov', initial: 'M', color: colors.pink, ink: colors.bg },
  { name: 'Aïcha Traoré', phone: '+221 77 312 88 45', op: 'Orange SN', initial: 'A', color: colors.mango, ink: colors.ink },
  { name: 'Sam Adigun', phone: '+229 90 22 18 04', op: 'MTN', initial: 'S', color: colors.mint, ink: colors.bg },
  { name: 'Léa Tchao', phone: '+229 96 55 67 19', op: 'Moov', initial: 'L', color: colors.plum, ink: colors.bg },
];

export function MultiContactsScreen({ navigation }: RootStackScreenProps<'MultiContacts'>) {
  const [selected, setSelected] = useState<Set<number>>(new Set([0, 1, 2]));
  const [q, setQ] = useState('');
  const pulseStyle = usePulse();

  const toggle = (i: number) => {
    const next = new Set(selected);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setSelected(next);
  };

  const selectedContacts = CONTACTS.filter((_, i) => selected.has(i));

  return (
    <ScreenContainer avoidKeyboard>
      <FunBackground palette="cream" density="sparse" />

      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>
        <Text style={styles.title}>Tes contacts</Text>
        <Animated.View style={[pulseStyle, styles.counter]}>
          <Text style={styles.counterText}>{selected.size} sélectionnés</Text>
        </Animated.View>
      </View>

      <View style={styles.searchWrap}>
        <Text style={{ fontSize: 14, color: colors.ink2 }}>🔍</Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Rechercher un contact"
          placeholderTextColor={colors.ink3}
          style={styles.searchInput}
        />
      </View>

      {/* Chips selected */}
      {selectedContacts.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {selectedContacts.map((c, i) => (
            <View key={i} style={styles.chip}>
              <View style={[styles.chipAvatar, { backgroundColor: c.color }]}>
                <Text style={[styles.chipInitial, { color: c.ink }]}>{c.initial}</Text>
              </View>
              <Text style={styles.chipName}>{c.name.split(' ')[0]} ×</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 110 }}>
        <Text style={styles.listLabel}>Tous les contacts</Text>
        <Card pad={0}>
          {CONTACTS.map((c, i) => {
            const on = selected.has(i);
            return (
              <Pressable key={i} onPress={() => toggle(i)} style={[styles.row, i < CONTACTS.length - 1 && styles.rowDivider]}>
                <View style={[styles.avatar, { backgroundColor: c.color }]}>
                  <Text style={[styles.avatarInitial, { color: c.ink }]}>{c.initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{c.name}</Text>
                  <Text style={styles.sub}>{c.phone} · {c.op}</Text>
                </View>
                <View style={[styles.radio, on && { backgroundColor: colors.coral, borderWidth: 0 }]}>
                  {on && <IconCheck size={12} color={colors.bg} strokeWidth={3.5} />}
                </View>
              </Pressable>
            );
          })}
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button label={`Continuer avec ${selected.size} contact${selected.size > 1 ? 's' : ''}`} pulse onPress={() => navigation.goBack()} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 22, paddingTop: 8 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 24, fontFamily: fonts.bodyBold, color: colors.ink, lineHeight: 24, marginTop: -2 },
  title: { flex: 1, fontFamily: fonts.displayMedium, fontSize: 19, color: colors.ink, letterSpacing: -0.4 },
  counter: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: colors.coral },
  counterText: { fontSize: 12, fontFamily: fonts.bodyBold, color: colors.bg },
  searchWrap: { marginHorizontal: 22, marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10, height: 46, paddingHorizontal: 14, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.lineSoft },
  searchInput: { flex: 1, fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.ink },
  chipsRow: { paddingHorizontal: 22, paddingTop: 14, gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4, paddingRight: 10, paddingVertical: 4, borderRadius: 99, backgroundColor: colors.indigo },
  chipAvatar: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  chipInitial: { fontFamily: fonts.bodyBold, fontSize: 11 },
  chipName: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.bg },
  listLabel: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontFamily: fonts.displaySemiBold, fontSize: 16 },
  name: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  sub: { fontSize: 11, color: colors.ink3, fontFamily: fonts.bodyMedium },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.ink3, alignItems: 'center', justifyContent: 'center' },
  footer: { position: 'absolute', bottom: 28, left: 22, right: 22 },
});
