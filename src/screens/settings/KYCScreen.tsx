// KYC — progress 1/3 + 3 choix de pièce + note privacy
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { IconCheck, IconLock } from '../../components/ui/Icons';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

type DocId = 'cni' | 'passport' | 'permis';

const DOCS: { id: DocId; l: string; sub: string; emoji: string; color: string }[] = [
  { id: 'cni', l: "Carte nationale d'identité", sub: 'Recto + verso', emoji: '🪪', color: colors.coral },
  { id: 'passport', l: 'Passeport', sub: 'Page photo seule', emoji: '📘', color: colors.indigo },
  { id: 'permis', l: 'Permis de conduire', sub: 'Recto + verso', emoji: '🚗', color: colors.mango },
];

export function KYCScreen({ navigation }: RootStackScreenProps<'KYC'>) {
  const [doc, setDoc] = useState<DocId>('cni');

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Vérification d'identité" onBack={() => navigation.goBack()} />

      <View style={styles.bars}>
        <View style={[styles.bar, { backgroundColor: colors.coral }]} />
        <View style={[styles.bar, { backgroundColor: colors.coralSoft }]} />
        <View style={[styles.bar, { backgroundColor: colors.coralSoft }]} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 24, paddingBottom: 130 }}>
        <Text style={styles.kicker}>Étape 1 sur 3 · Pièce d'identité</Text>
        <Text style={styles.title}>Choisis ta pièce 🪪</Text>
        <Text style={styles.subtitle}>
          Pour respecter les règles de paiement Mobile Money, on doit vérifier qui tu es. C'est rapide.
        </Text>

        <View style={{ marginTop: 22, gap: 10 }}>
          {DOCS.map((d) => {
            const on = d.id === doc;
            return (
              <Pressable
                key={d.id}
                onPress={() => setDoc(d.id)}
                style={[styles.opt, on && { borderWidth: 2, borderColor: d.color }]}
              >
                <View style={[styles.optIcon, { backgroundColor: `${d.color}22` }]}>
                  <Text style={{ fontSize: 22 }}>{d.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optTitle}>{d.l}</Text>
                  <Text style={styles.optSub}>{d.sub}</Text>
                </View>
                <View style={[styles.radio, on && { backgroundColor: d.color, borderWidth: 0 }]}>
                  {on && <IconCheck size={12} color={colors.bg} strokeWidth={3.5} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.privacy}>
          <IconLock color={colors.mint} />
          <Text style={styles.privacyText}>
            Tes documents sont chiffrés et stockés sous 7 jours. Personne d'autre que la vérification ne les voit.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Continuer" pulse onPress={() => navigation.goBack()} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  bars: { marginHorizontal: 22, marginTop: 14, flexDirection: 'row', gap: 5 },
  bar: { flex: 1, height: 4, borderRadius: 99 },
  kicker: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.ink2, letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { marginTop: 6, fontFamily: fonts.displayMedium, fontSize: 26, color: colors.ink, letterSpacing: -0.5, lineHeight: 28 },
  subtitle: { marginTop: 6, fontSize: 13, color: colors.ink2, lineHeight: 19 },
  opt: { padding: 14, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.lineSoft, flexDirection: 'row', alignItems: 'center', gap: 12 },
  optIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  optTitle: { fontFamily: fonts.displaySemiBold, fontSize: 15, color: colors.ink },
  optSub: { fontSize: 12, color: colors.ink2 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.ink3, alignItems: 'center', justifyContent: 'center' },
  privacy: { marginTop: 22, padding: 14, borderRadius: 14, backgroundColor: 'rgba(93,191,160,0.12)', flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  privacyText: { flex: 1, fontSize: 12, color: colors.ink, lineHeight: 18 },
  footer: { position: 'absolute', bottom: 28, left: 22, right: 22 },
});
