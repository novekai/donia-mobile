// Withdraw — retrait Mobile Money ou carte bancaire depuis le solde Donia.
// V1 : la demande est créée en PENDING, traitée manuellement côté admin.
// Saisie en FCFA ou EUR (toggle discret) ; le backend reçoit toujours du FCFA.
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, TextInput } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CurrencyToggle } from '../../components/ui/CurrencyToggle';
import { PhoneInput, DEFAULT_COUNTRY, toE164, type Country } from '../../components/ui/PhoneInput';
import { IconCheck } from '../../components/ui/Icons';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { withdraw } from '../../api/wallet';
import { getMe } from '../../api/me';
import { getPlatformSettings } from '../../api/platformSettings';
import { getApiErrorMessage } from '../../api/client';
import { formatAmount, parseAmountToFcfa, fcfaToEur, type Currency } from '../../lib/currency';

const PRESETS_FCFA = ['500', '1 000', '5 000', '10 000', '25 000'];
const PRESETS_EUR = ['1', '2', '10', '20', '50'];

const OPERATORS: { key: string; label: string; emoji: string; color: string }[] = [
  { key: 'mtn', label: 'MTN', emoji: '🟡', color: colors.mango },
  { key: 'moov', label: 'Moov', emoji: '🔵', color: colors.indigo },
  { key: 'orange', label: 'Orange', emoji: '🟠', color: colors.coral },
  { key: 'wave', label: 'Wave', emoji: '💙', color: colors.mint },
  { key: 'bank_card', label: 'Carte bancaire', emoji: '💳', color: colors.plum },
];

function fmtFcfa(n: number): string {
  return Math.round(n).toLocaleString('fr-FR').replace(/,/g, ' ');
}

export function WithdrawScreen({ navigation }: RootStackScreenProps<'Withdraw'>) {
  const queryClient = useQueryClient();
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const settingsQuery = useQuery({ queryKey: ['platformSettings'], queryFn: getPlatformSettings });

  const user = meQuery.data?.user;
  const balance = Number(user?.wallet?.balancePrincipal ?? 0);
  const kycApproved = user?.kycStatus === 'APPROVED';
  const minWithdrawal = settingsQuery.data?.minWithdrawalAmount ?? 1000;
  const withdrawalFee = settingsQuery.data?.withdrawalFeeFixed ?? 200;

  const [currency, setCurrency] = useState<Currency>('FCFA');
  const [raw, setRaw] = useState('');
  const [operator, setOperator] = useState<string>('mtn');
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  // Pas de pré-remplissage : on retire souvent vers un autre numéro (proche, second compte MM, etc.)
  const [localPhone, setLocalPhone] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const isBankCard = operator === 'bank_card';

  // Le backend raisonne toujours en FCFA. La devise n'est qu'une couche d'affichage.
  const amountFcfa = parseAmountToFcfa(raw || '0', currency);
  const displayedAmount =
    currency === 'EUR'
      ? (raw || '0').replace('.', ',')
      : Number(raw || '0').toLocaleString('fr-FR').replace(/,/g, ' ');

  // Le user paie amount + frais. Le solde doit couvrir les 2.
  const totalNeeded = amountFcfa + withdrawalFee;
  const enough = balance >= totalNeeded;
  const reachesMin = amountFcfa >= minWithdrawal;
  const destinationValid = isBankCard
    ? accountNumber.replace(/\s/g, '').length >= 8
    : localPhone.replace(/\D/g, '').length >= 8;
  const valid = amountFcfa > 0 && reachesMin && enough && destinationValid;

  async function onConfirm() {
    if (loading || !valid) return;
    if (!kycApproved) {
      Alert.alert(
        'KYC requis',
        "Tu dois d'abord valider ta pièce d'identité avant de retirer ton solde. Va dans Paramètres → Vérification d'identité.",
        [
          { text: 'Plus tard', style: 'cancel' },
          { text: "Valider mon identité", onPress: () => navigation.navigate('KYC') },
        ],
      );
      return;
    }
    setLoading(true);
    try {
      const res = await withdraw({
        amount: amountFcfa,
        operator,
        currency: currency === 'EUR' ? 'EUR' : 'XOF',
        ...(isBankCard
          ? { accountNumber: accountNumber.replace(/\s/g, '') }
          : { phoneNumber: toE164(country, localPhone) }),
      });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      Alert.alert(
        '✅ Demande envoyée',
        res.message ?? "Ton retrait sera traité sous 24-48h.",
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (e) {
      Alert.alert('Retrait impossible', getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  const ctaLabel = loading
    ? 'Envoi…'
    : currency === 'EUR'
      ? `Retirer ${displayedAmount || '0'} €`
      : `Retirer ${displayedAmount || '0'} FCFA`;

  const minLabel =
    currency === 'EUR'
      ? `${fcfaToEur(minWithdrawal).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
      : `${fmtFcfa(minWithdrawal)} FCFA`;

  return (
    <ScreenContainer avoidKeyboard>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Retirer mon solde" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 12, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Solde disponible */}
        <Card pad={16} style={{ alignItems: 'center' }}>
          <Text style={styles.balanceLabel}>SOLDE DISPONIBLE</Text>
          <Text style={styles.balanceValue}>{formatAmount(balance, currency)}</Text>
        </Card>

        {/* KYC warning si pas validé */}
        {!kycApproved && (
          <View style={styles.warnCard}>
            <Text style={styles.warnEmoji}>🪪</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.warnTitle}>Vérification d'identité requise</Text>
              <Text style={styles.warnBody}>
                La loi BCEAO impose une vérification d'identité avant tout retrait. Valide ta pièce dans Paramètres → Vérification d'identité.
              </Text>
            </View>
          </View>
        )}

        {/* Toggle FCFA / EUR */}
        <View style={styles.amountHeader}>
          <Text style={[styles.sectionLabel, { marginTop: 0, marginBottom: 0 }]}>MONTANT À RETIRER</Text>
          <CurrencyToggle value={currency} onChange={(c) => { setCurrency(c); setRaw(''); }} />
        </View>

        <Card pad={16}>
          <Text style={styles.amountInput}>
            {displayedAmount} <Text style={styles.amountUnit}>{currency === 'EUR' ? '€' : 'FCFA'}</Text>
          </Text>
          {currency === 'EUR' && amountFcfa > 0 && (
            <Text style={styles.conv}>≈ {fmtFcfa(amountFcfa)} FCFA</Text>
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

          {/* Clavier numérique : saisie libre du montant */}
          <View style={styles.keypadHint}>
            <Text style={styles.keypadHintText}>Touche un preset ou saisis-le directement</Text>
          </View>
          <View style={styles.keypad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, currency === 'EUR' ? '.' : '0', 0, 'X'].map((d, i) => (
              <Pressable
                key={`${d}-${i}`}
                onPress={() => {
                  if (d === 'X') {
                    setRaw((r) => r.slice(0, -1));
                  } else if (d === '.') {
                    setRaw((r) => (r.includes('.') ? r : (r || '0') + '.'));
                  } else {
                    setRaw((r) => (r === '0' ? '' : r) + String(d));
                  }
                }}
                style={styles.key}
              >
                <Text style={styles.keyText}>{d === 'X' ? '⌫' : d}</Text>
              </Pressable>
            ))}
          </View>

          {amountFcfa > 0 && !reachesMin && (
            <Text style={styles.warn}>⚠️ Minimum requis : {minLabel}.</Text>
          )}
          {amountFcfa > 0 && reachesMin && !enough && (
            <Text style={styles.warn}>
              ⚠️ Solde insuffisant. Il te faut {fmtFcfa(totalNeeded)} FCFA ({fmtFcfa(amountFcfa)} + {fmtFcfa(withdrawalFee)} frais). Tu as {formatAmount(balance, currency)}.
            </Text>
          )}

          {/* Recap frais */}
          {amountFcfa > 0 && reachesMin && (
            <View style={styles.feeRecap}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Montant retiré</Text>
                <Text style={styles.feeValue}>{fmtFcfa(amountFcfa)} FCFA</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Frais de transaction</Text>
                <Text style={styles.feeValue}>+ {fmtFcfa(withdrawalFee)} FCFA</Text>
              </View>
              <View style={[styles.feeRow, styles.feeRowTotal]}>
                <Text style={styles.feeLabelTotal}>Débité de ton solde</Text>
                <Text style={styles.feeValueTotal}>{fmtFcfa(totalNeeded)} FCFA</Text>
              </View>
            </View>
          )}
        </Card>

        {/* Opérateur */}
        <Text style={styles.sectionLabel}>OPÉRATEUR MOBILE MONEY</Text>
        <View style={styles.opsRow}>
          {OPERATORS.map((op) => {
            const on = op.key === operator;
            return (
              <Pressable
                key={op.key}
                onPress={() => setOperator(op.key)}
                style={[styles.opCard, on && { borderColor: op.color, borderWidth: 2 }]}
              >
                <Text style={styles.opEmoji}>{op.emoji}</Text>
                <Text style={[styles.opLabel, on && { color: op.color }]}>{op.label}</Text>
                {on && (
                  <View style={[styles.opCheck, { backgroundColor: op.color }]}>
                    <IconCheck size={10} color={colors.bg} strokeWidth={3.5} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Destinataire : Mobile Money OU carte bancaire selon operator */}
        <Text style={styles.sectionLabel}>
          {isBankCard ? 'NUMÉRO DE CARTE OU IBAN' : 'NUMÉRO MOBILE MONEY À CRÉDITER'}
        </Text>
        {isBankCard ? (
          <View style={styles.cardInputWrap}>
            <Text style={styles.cardInputEmoji}>💳</Text>
            <TextInput
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="FR76 1234 5678 9012 3456 7890 123"
              placeholderTextColor={colors.ink3}
              autoCapitalize="characters"
              autoCorrect={false}
              style={styles.cardInput}
            />
          </View>
        ) : (
          <PhoneInput
            country={country}
            onCountryChange={setCountry}
            localNumber={localPhone}
            onLocalNumberChange={setLocalPhone}
          />
        )}
        <Text style={styles.hint}>
          {isBankCard
            ? `Tu recevras tes ${displayedAmount || '0'} ${currency === 'EUR' ? '€' : 'FCFA'} sur ce compte bancaire sous 2-5 jours ouvrés.`
            : `Tu recevras tes ${displayedAmount || '0'} ${currency === 'EUR' ? '€' : 'FCFA'} sur ce numéro ${OPERATORS.find((o) => o.key === operator)?.label ?? ''} sous 24-48h ouvrées.`}
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={ctaLabel}
          pulse
          disabled={!valid || loading}
          onPress={onConfirm}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  balanceLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.indigo, letterSpacing: 1.2 },
  balanceValue: { marginTop: 6, fontFamily: fonts.bodyBold, fontSize: 36, color: colors.ink, letterSpacing: -1 },

  warnCard: { marginTop: 14, padding: 14, borderRadius: radius.md, backgroundColor: 'rgba(255,199,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,199,0,0.35)', flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  warnEmoji: { fontSize: 24 },
  warnTitle: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  warnBody: { marginTop: 4, fontSize: 12, color: colors.ink2, lineHeight: 17 },

  amountHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 8 },
  sectionLabel: { marginTop: 22, marginBottom: 8, fontFamily: fonts.bodyBold, fontSize: 11, color: colors.indigo, letterSpacing: 1.2 },

  amountInput: { fontFamily: fonts.bodyBold, fontSize: 40, color: colors.coral, letterSpacing: -1.5, textAlign: 'center' },
  amountUnit: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.ink2 },
  conv: { marginTop: 4, textAlign: 'center', fontSize: 12, color: colors.ink3, fontStyle: 'italic' },
  chipsRow: { marginTop: 14, flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { flex: 1, minWidth: 70, height: 36, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  chipText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.ink },

  keypadHint: { marginTop: 14, alignItems: 'center' },
  keypadHintText: { fontSize: 11, color: colors.ink3, fontStyle: 'italic' },
  keypad: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  key: { width: '32%', aspectRatio: 1.8, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.lineSoft },
  keyText: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.ink },

  opsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  opCard: { flex: 1, minWidth: '22%', aspectRatio: 1, padding: 10, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, alignItems: 'center', justifyContent: 'center', gap: 4, position: 'relative' },
  opEmoji: { fontSize: 24 },
  opLabel: { fontFamily: fonts.displaySemiBold, fontSize: 12, color: colors.ink },
  opCheck: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

  hint: { marginTop: 8, fontSize: 11, color: colors.ink3, fontStyle: 'italic', lineHeight: 16 },
  warn: { marginTop: 8, fontSize: 12, color: colors.coralDeep, textAlign: 'center', fontFamily: fonts.bodyMedium },

  feeRecap: { marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: 'rgba(31,68,88,0.06)', borderWidth: 1, borderColor: 'rgba(31,68,88,0.12)' },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  feeRowTotal: { marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(31,68,88,0.15)' },
  feeLabel: { fontSize: 12, color: colors.ink2, fontFamily: fonts.bodyRegular },
  feeValue: { fontSize: 12, color: colors.ink, fontFamily: fonts.bodyMedium },
  feeLabelTotal: { fontSize: 13, color: colors.ink, fontFamily: fonts.displaySemiBold },
  feeValueTotal: { fontSize: 14, color: colors.coralDeep, fontFamily: fonts.bodyBold },

  cardInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, height: 50, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft },
  cardInputEmoji: { fontSize: 22 },
  cardInput: { flex: 1, fontFamily: 'monospace', fontSize: 15, color: colors.ink, letterSpacing: 0.5 },

  footer: { position: 'absolute', bottom: 28, left: 22, right: 22 },
});
