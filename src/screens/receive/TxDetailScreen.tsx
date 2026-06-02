// TxDetail — success header + detail rows + 2 CTA
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ConcentricRings } from '../../components/deco/ConcentricRings';
import { Sparkle } from '../../components/deco/Sparkle';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { IconCheck } from '../../components/ui/Icons';
import { colors, radius, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

const ROWS = [
  { l: 'Destinataire', v: '+229 94 50 21 87' },
  { l: 'Opérateur', v: 'MTN Bénin' },
  { l: 'Montant de la carte', v: '10 000 FCFA', accent: true, bold: true },
  { l: 'Référence', v: 'DON-2026-A7K91', mono: true },
  { l: 'Date', v: '26 mai 2026 · 14:32' },
];

export function TxDetailScreen({ navigation }: RootStackScreenProps<'TxDetail'>) {
  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader
        title="Détail"
        onBack={() => navigation.goBack()}
        rightAction={
          <Pressable>
            <Text style={styles.share}>Partager</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 130 }}>
        {/* Success header */}
        <Card pad={22} style={styles.successWrap}>
          <View style={{ position: 'absolute', top: -50, left: '50%', marginLeft: -90 }} pointerEvents="none">
            <ConcentricRings size={180} color={colors.mint} opacity={0.18} anim="spin" />
          </View>
          <BrandGradient variant="mint" style={[styles.checkIcon, shadow.mint]}>
            <IconCheck size={28} color={colors.bg} strokeWidth={3.5} />
          </BrandGradient>
          <Sparkle size={14} color={colors.mango} style={{ position: 'absolute', top: 24, right: 60 }} />
          <Sparkle size={10} color={colors.pink} delay={0.8} style={{ position: 'absolute', top: 60, left: 50 }} />
          <Text style={styles.successTitle}>Envoi réussi !</Text>
          <Text style={styles.successSub}>
            <Text style={styles.successAmount}>10 000 FCFA</Text> à Kofi Mensah
          </Text>
          <View style={styles.occBadge}>
            <Text style={{ fontSize: 13 }}>👋</Text>
            <Text style={styles.occText}>Bonjour</Text>
          </View>
        </Card>

        {/* Rows */}
        <Card pad={0} style={{ marginTop: 14 }}>
          {ROWS.map((r, i) => (
            <View key={i} style={[styles.row, i < ROWS.length - 1 && styles.rowDivider]}>
              <Text style={styles.rowLabel}>{r.l}</Text>
              <Text
                style={[
                  styles.rowValue,
                  r.accent && { color: colors.coral },
                  r.bold && { fontFamily: fonts.bodyBold },
                  r.mono && { fontFamily: fonts.bodyBold, letterSpacing: 0.3 },
                ]}
              >
                {r.v}
              </Text>
            </View>
          ))}
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Renvoyer le même cadeau" pulse onPress={() => navigation.navigate('SendCategory' as any)} />
        <Pressable style={styles.report}>
          <Text style={styles.reportText}>Signaler un problème</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  share: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.coral },
  successWrap: { alignItems: 'center', overflow: 'hidden' },
  checkIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  successTitle: { marginTop: 14, fontFamily: fonts.displayMedium, fontSize: 22, color: colors.ink, letterSpacing: -0.4 },
  successSub: { marginTop: 4, fontSize: 13, color: colors.ink2 },
  successAmount: { fontFamily: fonts.bodyBold, color: colors.ink },
  occBadge: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, backgroundColor: colors.coral },
  occText: { fontSize: 11, fontFamily: fonts.bodyBold, color: colors.bg },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13, alignItems: 'center' },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  rowLabel: { fontSize: 13, color: colors.ink2 },
  rowValue: { fontSize: 13, color: colors.ink, fontFamily: fonts.bodySemiBold },
  footer: { position: 'absolute', bottom: 28, left: 22, right: 22, gap: 8 },
  report: { height: 48, borderRadius: 16, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  reportText: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.ink2 },
});
