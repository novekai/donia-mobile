// TopUpMobileMoney — recharge solde via MM (FedaPay/KKiaPay selon provider actif)
// Presets + saisie manuelle (keypad), solde live, ouverture WebView FedaPay/KKiaPay.
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Linking } from 'react-native';
import Animated from 'react-native-reanimated';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { IconCheck } from '../../components/ui/Icons';
import { usePulse } from '../../theme/animations';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { topupMobileMoney } from '../../api/wallet';
import { getMe } from '../../api/me';
import { getApiErrorMessage } from '../../api/client';

const PRESETS = ['500', '1 000', '5 000', '10 000', '25 000'];

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
  tg: [
    { id: 'tmoney', name: 'T-Money', color: colors.mango, ink: colors.indigo },
    { id: 'flooz', name: 'Flooz', color: colors.indigo },
  ],
  bf: [{ id: 'orange', name: 'Orange', color: colors.coral }, { id: 'moov', name: 'Moov', color: colors.indigo }],
  ml: [{ id: 'orange', name: 'Orange', color: colors.coral }, { id: 'moov', name: 'Moov', color: colors.indigo }],
  ne: [{ id: 'airtel', name: 'Airtel', color: colors.coral }, { id: 'orange', name: 'Orange', color: colors.coral }],
  gn: [{ id: 'orange', name: 'Orange', color: colors.coral }, { id: 'mtn', name: 'MTN', color: colors.mango, ink: colors.indigo }],
  gh: [{ id: 'mtn', name: 'MTN', color: colors.mango, ink: colors.indigo }, { id: 'airtel', name: 'AirtelTigo', color: colors.coral }],
  cm: [{ id: 'mtn', name: 'MTN', color: colors.mango, ink: colors.indigo }, { id: 'orange', name: 'Orange', color: colors.coral }],
};

function fmt(n: number): string {
  return Math.round(n).toLocaleString('fr-FR').replace(/,/g, ' ');
}

export function TopUpMobileMoneyScreen({ navigation }: RootStackScreenProps<'TopUpMobileMoney'>) {
  const queryClient = useQueryClient();
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const balance = Number(meQuery.data?.user.wallet?.balancePrincipal ?? 0);
  const userCountry = (meQuery.data?.user.country ?? 'BJ').toLowerCase();

  const [raw, setRaw] = useState('10000');
  const [country, setCountry] = useState(userCountry);
  const [operator, setOperator] = useState('mtn');
  const [loading, setLoading] = useState(false);
  const pulseStyle = usePulse({ intensity: 0.15 });

  const operators = OPERATORS_BY_COUNTRY[country] || [];
  const opName = operators.find((o) => o.id === operator)?.name ?? 'MTN';
  const amountNum = Number(raw || '0');
  const displayedAmount = fmt(amountNum);
  const newBalance = balance + amountNum;
  const valid = amountNum >= 100 && amountNum <= 500_000;

  async function onSubmit() {
    if (loading || !valid) return;
    setLoading(true);
    try {
      const res = await topupMobileMoney({
        amount: amountNum,
        operator,
        country: country.toUpperCase(),
        currency: 'XOF',
      });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      if (res.paymentUrl) {
        await Linking.openURL(res.paymentUrl);
        Alert.alert(
          '💰 Paiement Mobile Money',
          "Termine le paiement dans la fenêtre qui s'est ouverte. Ton solde sera crédité dès confirmation.",
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      } else {
        Alert.alert(
          'Demande envoyée',
          'Ton solde sera crédité dès confirmation du paiement.',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      }
    } catch (e) {
      Alert.alert('Recharge impossible', getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer avoidKeyboard>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Recharger mon solde" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: 22, paddingTop: 16 }}>
          <Text style={styles.kicker}>Solde actuel</Text>
          <Text style={styles.balance}>{fmt(balance)} <Text style={styles.balanceUnit}>FCFA</Text></Text>
        </View>

        <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
          <Text style={styles.section}>Choisis un montant</Text>

          {/* Affichage du montant en cours */}
          <Card pad={16}>
            <Text style={styles.amountInput}>
              {displayedAmount} <Text style={styles.amountUnit}>FCFA</Text>
            </Text>

            <View style={styles.chipsRow}>
              {PRESETS.map((p) => {
                const on = p.replace(/\s/g, '') === raw;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setRaw(p.replace(/\s/g, ''))}
                    style={[styles.chip, on && { backgroundColor: colors.coral, borderColor: colors.coral }]}
                  >
                    <Text style={[styles.chipText, on && { color: colors.bg }]}>{p}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Clavier numerique */}
            <View style={styles.keypadHint}>
              <Text style={styles.keypadHintText}>Touche un preset ou saisis-le directement</Text>
            </View>
            <View style={styles.keypad}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 'X'].map((d, i) => (
                <Pressable
                  key={`${d}-${i}`}
                  onPress={() => {
                    if (d === 'X') setRaw((r) => r.slice(0, -1));
                    else setRaw((r) => (r === '0' ? '' : r) + String(d));
                  }}
                  style={[styles.key, d === 0 && i === 9 && { width: '66%' }]}
                >
                  <Text style={styles.keyText}>{d === 'X' ? '⌫' : d}</Text>
                </Pressable>
              ))}
            </View>
          </Card>
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
        {valid && (
          <View style={{ paddingHorizontal: 22, marginTop: 16 }}>
            <View style={styles.recap}>
              <View style={styles.recapRow}>
                <Text style={styles.recapLabel}>Montant à recharger</Text>
                <Text style={styles.recapValue}>{displayedAmount} FCFA</Text>
              </View>
              <View style={styles.recapRow}>
                <Text style={styles.recapLabel}>Nouveau solde estimé</Text>
                <Text style={[styles.recapValue, { color: colors.green }]}>{fmt(newBalance)} FCFA</Text>
              </View>
              <View style={styles.recapInfo}>
                <IconCheck size={10} color={colors.green} strokeWidth={3} />
                <Text style={styles.recapInfoText}>Recharge gratuite — aucun frais</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ padding: 22 }}>
          <Button
            label={loading ? 'Préparation…' : `Recharger ${displayedAmount} FCFA via ${opName}`}
            pulse
            disabled={!valid || loading}
            onPress={onSubmit}
          />
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

  amountInput: { fontFamily: fonts.bodyBold, fontSize: 36, color: colors.coral, letterSpacing: -1.2, textAlign: 'center' },
  amountUnit: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.ink2 },
  chipsRow: { marginTop: 14, flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { flex: 1, minWidth: 70, height: 36, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  chipText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.ink },

  keypadHint: { marginTop: 14, alignItems: 'center' },
  keypadHintText: { fontSize: 11, color: colors.ink3, fontStyle: 'italic' },
  keypad: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  key: { width: '32%', aspectRatio: 1.8, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.lineSoft },
  keyText: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.ink },

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
