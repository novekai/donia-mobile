// TopUpMobileMoney — montants chips + 10 pays + opérateurs + recap
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { IconCheck } from '../../components/ui/Icons';
import { usePulse } from '../../theme/animations';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';

const AMOUNTS = ['5 000', '10 000', '25 000', '50 000', '100 000', 'Autre'];
const COUNTRIES = [
  { code: 'bj', name: 'Bénin', flag: '🇧🇯' },
  { code: 'ci', name: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: 'sn', name: 'Sénégal', flag: '🇸🇳' },
  { code: 'tg', name: 'Togo', flag: '🇹🇬' },
  { code: 'bf', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'ml', name: 'Mali', flag: '🇲🇱' },
  { code: 'ne', name: 'Niger', flag: '🇳🇪' },
  { code: 'gn', name: 'Guinée', flag: '🇬🇳' },
  { code: 'gh', name: 'Ghana', flag: '🇬🇭' },
  { code: 'cm', name: 'Cameroun', flag: '🇨🇲' },
];
const OPERATORS_BY_COUNTRY: Record<string, { id: string; name: string; color: string; ink?: string }[]> = {
  bj: [
    { id: 'mtn', name: 'MTN', color: colors.mango, ink: colors.indigo },
    { id: 'moov', name: 'Moov', color: colors.indigo },
    { id: 'celtiis', name: 'Celtiis', color: colors.plum },
  ],
  ci: [
    { id: 'mtn', name: 'MTN', color: colors.mango, ink: colors.indigo },
    { id: 'orange', name: 'Orange', color: colors.coral },
    { id: 'moov', name: 'Moov', color: colors.indigo },
  ],
  sn: [
    { id: 'orange', name: 'Orange', color: colors.coral },
    { id: 'wave', name: 'Wave', color: colors.mint },
    { id: 'free', name: 'Free', color: colors.pink },
  ],
  tg: [{ id: 'tmoney', name: 'T-Money', color: colors.mango, ink: colors.indigo }, { id: 'flooz', name: 'Flooz', color: colors.indigo }],
  bf: [{ id: 'orange', name: 'Orange', color: colors.coral }, { id: 'moov', name: 'Moov', color: colors.indigo }],
  ml: [{ id: 'orange', name: 'Orange', color: colors.coral }, { id: 'moov', name: 'Moov', color: colors.indigo }],
  ne: [{ id: 'airtel', name: 'Airtel', color: colors.coral }, { id: 'orange', name: 'Orange', color: colors.coral }],
  gn: [{ id: 'orange', name: 'Orange', color: colors.coral }, { id: 'mtn', name: 'MTN', color: colors.mango, ink: colors.indigo }],
  gh: [{ id: 'mtn', name: 'MTN', color: colors.mango, ink: colors.indigo }, { id: 'airtel', name: 'AirtelTigo', color: colors.coral }],
  cm: [{ id: 'mtn', name: 'MTN', color: colors.mango, ink: colors.indigo }, { id: 'orange', name: 'Orange', color: colors.coral }],
};

export function TopUpMobileMoneyScreen({ navigation }: RootStackScreenProps<'TopUpMobileMoney'>) {
  const [amount, setAmount] = useState('10 000');
  const [country, setCountry] = useState('bj');
  const [operator, setOperator] = useState('mtn');
  const pulseStyle = usePulse({ intensity: 0.15 });

  const operators = OPERATORS_BY_COUNTRY[country] || [];

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Recharger mon solde" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ paddingHorizontal: 22, paddingTop: 16 }}>
          <Text style={styles.kicker}>Solde actuel</Text>
          <Text style={styles.balance}>125 800 <Text style={styles.balanceUnit}>FCFA</Text></Text>
        </View>

        <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
          <Text style={styles.section}>Choisis un montant</Text>
          <View style={styles.amountGrid}>
            {AMOUNTS.map((a) => {
              const on = a === amount;
              return (
                <Pressable
                  key={a}
                  onPress={() => setAmount(a)}
                  style={[styles.amountBtn, on && { backgroundColor: colors.coral, transform: [{ scale: 1.04 }] }]}
                >
                  <Text style={[styles.amountText, on && { color: colors.bg }, a === 'Autre' && { fontSize: 13 }]}>{a}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={[styles.section, { paddingHorizontal: 22 }]}>Depuis quel pays ?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, gap: 6 }}>
            {COUNTRIES.map((c) => {
              const on = c.code === country;
              return (
                <Pressable
                  key={c.code}
                  onPress={() => {
                    setCountry(c.code);
                    setOperator(OPERATORS_BY_COUNTRY[c.code]?.[0]?.id || '');
                  }}
                  style={[styles.countryChip, on && { backgroundColor: colors.indigo }]}
                >
                  <Text style={{ fontSize: 14 }}>{c.flag}</Text>
                  <Text style={[styles.countryText, on && { color: colors.bg }]}>{c.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 22, marginTop: 18 }}>
          <View style={styles.opsHeader}>
            <Text style={styles.section}>Opérateur Mobile Money</Text>
            <View style={styles.opsAvail}>
              <Animated.View style={[pulseStyle, { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green }]} />
              <Text style={styles.opsAvailText}>{operators.length} disponibles</Text>
            </View>
          </View>
          <View style={styles.opsGrid}>
            {operators.map((op) => {
              const on = op.id === operator;
              return (
                <Pressable
                  key={op.id}
                  onPress={() => setOperator(op.id)}
                  style={[styles.opBtn, on ? { backgroundColor: op.color } : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft }]}
                >
                  <Text style={[styles.opText, { color: on ? (op.ink || colors.bg) : colors.ink }]}>{op.name}</Text>
                  {on && (
                    <View style={styles.opCheck}>
                      <IconCheck size={9} color={colors.bg} strokeWidth={3.5} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
          <View style={styles.opsInfo}>
            <Text style={{ fontSize: 13 }}>ℹ️</Text>
            <Text style={styles.opsInfoText}>
              Donia couvre <Text style={{ fontFamily: fonts.bodyBold }}>17 opérateurs</Text> sur 8 pays — MTN, Moov, Orange, Wave, Free, Celtiis, Yas, Airtel et plus.
            </Text>
          </View>
        </View>

        {/* Recap */}
        <View style={{ paddingHorizontal: 22, marginTop: 16 }}>
          <View style={styles.recap}>
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>Montant à recharger</Text>
              <Text style={styles.recapValue}>{amount} FCFA</Text>
            </View>
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>Nouveau solde estimé</Text>
              <Text style={[styles.recapValue, { color: colors.green }]}>135 800 FCFA</Text>
            </View>
            <View style={styles.recapInfo}>
              <IconCheck size={10} color={colors.green} strokeWidth={3} />
              <Text style={styles.recapInfoText}>Recharge gratuite — aucun frais</Text>
            </View>
          </View>
        </View>

        <View style={{ padding: 22 }}>
          <Button label={`Recharger ${amount} FCFA via ${(operators.find((o) => o.id === operator) || {}).name || 'MTN'}`} pulse onPress={() => {}} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.ink2, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  balance: { fontFamily: fonts.bodyBold, fontSize: 30, color: colors.ink, letterSpacing: -0.9 },
  balanceUnit: { fontSize: 13, color: colors.ink2, fontFamily: fonts.bodyMedium },
  section: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2, marginBottom: 10 },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amountBtn: { width: '31.5%', height: 50, borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, alignItems: 'center', justifyContent: 'center' },
  amountText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  countryChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft },
  countryText: { fontFamily: fonts.displaySemiBold, fontSize: 12, color: colors.ink },
  opsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  opsAvail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  opsAvailText: { fontSize: 11, fontFamily: fonts.bodyBold, color: colors.green },
  opsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opBtn: { flex: 1, minWidth: '30%', maxWidth: '32%', padding: 14, borderRadius: radius.sm, alignItems: 'center' },
  opText: { fontFamily: fonts.displaySemiBold, fontSize: 13 },
  opCheck: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  opsInfo: { marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: 'rgba(31,68,88,0.08)', flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  opsInfoText: { flex: 1, fontSize: 11, color: colors.indigo, lineHeight: 16 },
  recap: { padding: 14, borderRadius: 14, backgroundColor: 'rgba(93,191,160,0.12)', borderWidth: 1, borderColor: 'rgba(93,191,160,0.3)' },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  recapLabel: { fontSize: 12, color: colors.ink },
  recapValue: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.ink },
  recapInfo: { marginTop: 3, flexDirection: 'row', alignItems: 'center', gap: 4 },
  recapInfoText: { fontSize: 11, color: colors.green, fontFamily: fonts.displayItalic },
});
