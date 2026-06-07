// TopUpCard — recharge par carte bancaire (Visa, Mastercard) via FedaPay.
// L'utilisateur saisit le montant (en EUR ou FCFA), tape Continuer.
// Backend cree une transaction FedaPay avec currency=EUR + operator=card,
// renvoie une URL de paiement. On ouvre cette URL dans le navigateur du
// telephone ; le webhook FedaPay credite ensuite le solde Donia.
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Linking } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CurrencyToggle } from '../../components/ui/CurrencyToggle';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { topupMobileMoney } from '../../api/wallet';
import { getMe } from '../../api/me';
import { getApiErrorMessage } from '../../api/client';
import { formatAmount, parseAmountToFcfa, type Currency, fcfaToEur, FCFA_PER_EUR } from '../../lib/currency';

const PRESETS_EUR = ['5', '15', '30', '75', '150'];
const PRESETS_FCFA = ['5 000', '10 000', '25 000', '50 000', '100 000'];

export function TopUpCardScreen({ navigation }: RootStackScreenProps<'TopUpCard'>) {
  const queryClient = useQueryClient();
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const balance = Number(meQuery.data?.user.wallet?.balancePrincipal ?? 0);

  const [currency, setCurrency] = useState<Currency>('EUR');
  const [raw, setRaw] = useState('');
  const [loading, setLoading] = useState(false);

  const amountFcfa = parseAmountToFcfa(raw || '0', currency);
  const formatted = currency === 'EUR'
    ? (raw || '0').replace('.', ',')
    : Number(raw || '0').toLocaleString('fr-FR').replace(/,/g, ' ');
  const newBalance = balance + amountFcfa;
  const valid = amountFcfa > 0;

  async function onSubmit() {
    if (loading || !valid) return;
    setLoading(true);
    try {
      const res = await topupMobileMoney({
        amount: amountFcfa,
        operator: 'card',
        country: meQuery.data?.user.country ?? 'BJ',
        currency: 'EUR',
      });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      if (res.paymentUrl) {
        // Ouvre la page de paiement FedaPay (formulaire carte) dans le navigateur
        await Linking.openURL(res.paymentUrl);
        Alert.alert(
          '💳 Paiement par carte',
          "Termine le paiement dans ton navigateur. Ton solde sera crédité dès confirmation FedaPay (quelques minutes).",
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
      <ScreenHeader title="Recharge par carte 💳" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 12, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        {/* Solde actuel */}
        <Card pad={16} style={{ alignItems: 'center' }}>
          <Text style={styles.balanceLabel}>SOLDE ACTUEL</Text>
          <Text style={styles.balanceValue}>{formatAmount(balance, currency)}</Text>
        </Card>

        {/* Toggle FCFA / EUR */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 8 }}>
          <Text style={styles.sectionLabel}>MONTANT À RECHARGER</Text>
          <CurrencyToggle value={currency} onChange={(c) => { setCurrency(c); setRaw(''); }} />
        </View>

        <Card pad={16}>
          <Text style={styles.amountInput}>
            {formatted} <Text style={styles.amountUnit}>{currency === 'EUR' ? '€' : 'FCFA'}</Text>
          </Text>
          {currency === 'EUR' && amountFcfa > 0 && (
            <Text style={styles.conv}>≈ {amountFcfa.toLocaleString('fr-FR').replace(/,/g, ' ')} FCFA</Text>
          )}

          <View style={styles.chipsRow}>
            {(currency === 'EUR' ? PRESETS_EUR : PRESETS_FCFA).map((p) => {
              const on = p.replace(/\s/g, '') === raw;
              return (
                <Pressable
                  key={p}
                  onPress={() => setRaw(p.replace(/\s/g, ''))}
                  style={[styles.chip, on && { backgroundColor: colors.coral, borderColor: colors.coral }]}
                >
                  <Text style={[styles.chipText, on && { color: colors.bg }]}>
                    {currency === 'EUR' ? `${p} €` : p}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Saisie manuelle simple */}
          <View style={styles.keypadHint}>
            <Text style={styles.hint}>Touche un preset ou saisis-le directement</Text>
          </View>
          <View style={{ marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, currency === 'EUR' ? '.' : '0', 0, 'X'].map((d, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  if (d === 'X') setRaw((r) => r.slice(0, -1));
                  else setRaw((r) => (r === '0' ? '' : r) + String(d));
                }}
                style={styles.key}
              >
                <Text style={styles.keyText}>{d === 'X' ? '⌫' : d}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {valid && (
          <Card pad={14} style={{ marginTop: 14 }}>
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>Montant à recharger</Text>
              <Text style={styles.recapValue}>{formatted} {currency === 'EUR' ? '€' : 'FCFA'}</Text>
            </View>
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>Nouveau solde estimé</Text>
              <Text style={[styles.recapValue, { color: colors.green }]}>
                {formatAmount(newBalance, currency)}
              </Text>
            </View>
          </Card>
        )}

        <Text style={styles.footnote}>
          🔒 Paiement sécurisé via FedaPay. Aucun numéro de carte ne transite par Donia.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={loading ? 'Préparation…' : `Recharger avec ma carte 💳`}
          pulse
          disabled={!valid || loading}
          onPress={onSubmit}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  balanceLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.indigo, letterSpacing: 1.2 },
  balanceValue: { marginTop: 6, fontFamily: fonts.bodyBold, fontSize: 30, color: colors.ink, letterSpacing: -0.7 },

  sectionLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.indigo, letterSpacing: 1.2 },

  amountInput: { fontFamily: fonts.bodyBold, fontSize: 36, color: colors.coral, letterSpacing: -1.2, textAlign: 'center' },
  amountUnit: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.ink2 },
  conv: { marginTop: 4, textAlign: 'center', fontSize: 12, color: colors.ink3, fontStyle: 'italic' },

  chipsRow: { marginTop: 16, flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { flex: 1, minWidth: 70, height: 36, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  chipText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.ink },

  keypadHint: { marginTop: 14, alignItems: 'center' },
  hint: { fontSize: 11, color: colors.ink3, fontStyle: 'italic' },
  key: { width: '32%', aspectRatio: 1.8, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.lineSoft },
  keyText: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.ink },

  recapRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  recapLabel: { fontSize: 12, color: colors.ink2 },
  recapValue: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },

  footnote: { marginTop: 18, fontSize: 11, color: colors.ink3, textAlign: 'center', fontStyle: 'italic' },
  footer: { position: 'absolute', bottom: 28, left: 22, right: 22 },
});
