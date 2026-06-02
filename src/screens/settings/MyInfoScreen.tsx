// MyInfo — 7 champs incluant WhatsApp + téléphone verrouillé
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { IconLock } from '../../components/ui/Icons';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

const FIELDS = [
  { l: 'Prénom et nom', v: 'Awa Diallo' },
  { l: 'Email', v: 'awa@donia.com' },
  { l: 'Numéro de téléphone', v: '+229 90 12 34 56', locked: true },
  { l: 'Numéro WhatsApp', v: '+229 90 12 34 56', wa: true, sub: 'identique au téléphone' },
  { l: 'Sexe', v: 'Femme' },
  { l: 'Date de naissance', v: '14 mars 1995' },
  { l: 'Adresse', v: 'Cotonou, Bénin' },
];

export function MyInfoScreen({ navigation }: RootStackScreenProps<'MyInfo'>) {
  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Mes informations" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 22, paddingBottom: 120, gap: 14 }}>
        {FIELDS.map((f, i) => (
          <View key={i}>
            <View style={styles.header}>
              <Text style={styles.label}>
                {f.wa && <Text style={{ color: '#25D366' }}>💬 </Text>}
                {f.l}
              </Text>
              {f.locked && (
                <View style={styles.lock}>
                  <IconLock color={colors.mangoDeep} />
                  <Text style={styles.lockText}>VERROUILLÉ</Text>
                </View>
              )}
              {f.sub && <Text style={styles.sub}>{f.sub}</Text>}
            </View>
            <View
              style={[
                styles.field,
                f.locked && { backgroundColor: colors.bg2 },
                f.wa && {
                  backgroundColor: 'rgba(93,191,160,0.10)',
                  borderColor: 'rgba(93,191,160,0.4)',
                  borderStyle: 'dashed',
                },
              ]}
            >
              <Text style={styles.value}>{f.v}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Enregistrer" pulse onPress={() => navigation.goBack()} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2 },
  lock: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99, backgroundColor: 'rgba(249,160,28,0.18)' },
  lockText: { fontSize: 10, fontFamily: fonts.bodyBold, color: colors.mangoDeep, letterSpacing: 0.4 },
  sub: { fontSize: 10, fontFamily: fonts.displayItalic, color: colors.green },
  field: { height: 52, borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, justifyContent: 'center', paddingHorizontal: 14 },
  value: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  footer: { position: 'absolute', bottom: 28, left: 22, right: 22 },
});
