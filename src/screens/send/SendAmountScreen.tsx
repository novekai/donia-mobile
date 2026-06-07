// SendAmount — gros montant + clavier custom + presets + recap
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { Sparkle } from '../../components/deco/Sparkle';
import { StepHeader } from '../../components/composed/StepHeader';
import { Button } from '../../components/ui/Button';
import { KeyPad } from '../../components/ui/KeyPad';
import { IconCheck } from '../../components/ui/Icons';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { getMe } from '../../api/me';
import { getPlatformSettings } from '../../api/platformSettings';
import { CurrencyToggle } from '../../components/ui/CurrencyToggle';
import { formatAmount, parseAmountToFcfa, type Currency, fcfaToEur } from '../../lib/currency';

// Presets adaptes a la devise. Equivalences approximatives :
// 1 000 FCFA ~ 1.5 EUR, 5 000 FCFA ~ 7.5 EUR, 10 000 FCFA ~ 15 EUR, 25 000 FCFA ~ 38 EUR
const PRESETS_FCFA = ['1 000', '5 000', '10 000', '25 000'];
const PRESETS_EUR = ['5', '15', '30', '75'];

function useBlink() {
  const v = useSharedValue(1);
  React.useEffect(() => {
    v.value = withRepeat(
      withSequence(withTiming(1, { duration: 500, easing: Easing.steps(1) }), withTiming(0, { duration: 500, easing: Easing.steps(1) })),
      -1,
    );
  }, [v]);
  return useAnimatedStyle(() => ({ opacity: v.value }));
}

export function SendAmountScreen({ navigation, route }: RootStackScreenProps<'SendAmount'>) {
  const { categoryKey, recipientPhone, recipientName } = route.params || {};
  const [raw, setRaw] = useState('');
  const [currency, setCurrency] = useState<Currency>('FCFA');
  const blinkStyle = useBlink();

  // Real wallet balance — used to show the user how much they'll have left after sending.
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const balance = Number(meQuery.data?.user?.wallet?.balancePrincipal ?? 0);

  // Contraintes de plateforme pilotées depuis l'admin (montants min / max sans KYC).
  // On lit ces valeurs au démarrage (cached 5 min côté React Query) au lieu de hardcoder.
  const settingsQuery = useQuery({
    queryKey: ['platform-settings'],
    queryFn: getPlatformSettings,
    staleTime: 5 * 60_000,
  });
  const minCard = settingsQuery.data?.minCardAmount ?? 500;
  const maxNoKyc = settingsQuery.data?.maxAmountNoKyc ?? 50_000;
  const userKycApproved = meQuery.data?.user?.kycStatus === 'APPROVED';

  // amountNum est TOUJOURS en FCFA cote interne (backend ne connait que FCFA).
  // Si l user saisit en EUR on convertit a la volee.
  const amountNum = parseAmountToFcfa(raw || '0', currency);
  const afterBalance = Math.max(0, balance - amountNum);
  const tooLow = amountNum > 0 && amountNum < minCard;
  const kycRequired = !userKycApproved && amountNum > maxNoKyc;
  const blockNext = tooLow || kycRequired;

  // Affichage : si EUR, on montre directement ce que l user a tape (avec virgule).
  // Si FCFA, on formate avec espace milliers.
  const formatted = currency === 'EUR'
    ? (raw || '0').replace('.', ',')
    : Number(raw || '0').toLocaleString('fr-FR').replace(/,/g, ' ');

  const onKey = (k: string) => {
    if (k === 'back') {
      setRaw((r) => r.slice(0, -1));
    } else if (k === '000') {
      setRaw((r) => (r === '0' || r === '' ? '0' : r + '000').replace(/^0+(?=\d)/, ''));
    } else {
      setRaw((r) => ((r === '0' ? '' : r) + k).replace(/^0+(?=\d)/, ''));
    }
  };

  const onPreset = (p: string) => setRaw(p.replace(/\s/g, ''));

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <StepHeader step={3} of={5} title="Combien ?" sub="Montant" onBack={() => navigation.goBack()} />

      {/* Currency toggle compact en haut a droite */}
      <View style={{ paddingHorizontal: 22, paddingTop: 10, alignItems: 'flex-end' }}>
        <CurrencyToggle value={currency} onChange={(c) => { setCurrency(c); setRaw(''); }} />
      </View>

      {/* Big amount */}
      <View style={styles.amountWrap}>
        <Sparkle size={16} color={colors.mango} style={{ position: 'absolute', top: 12, right: 30 }} />
        <Sparkle size={12} color={colors.pink} delay={0.8} style={{ position: 'absolute', bottom: 12, left: 30 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Text style={styles.amount}>{formatted}</Text>
          <Animated.View style={[blinkStyle, styles.cursor]} />
        </View>
        <Text style={styles.amountUnit}>{currency === 'EUR' ? '€' : 'FCFA'}</Text>
        {currency === 'EUR' && amountNum > 0 && (
          <Text style={styles.conv}>≈ {amountNum.toLocaleString('fr-FR').replace(/,/g, ' ')} FCFA</Text>
        )}
        <Text style={styles.afterBalance}>
          Solde après envoi :{' '}
          <Text style={styles.afterBalanceNum}>
            {currency === 'EUR'
              ? `${fcfaToEur(afterBalance).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
              : `${afterBalance.toLocaleString('fr-FR').replace(/,/g, ' ')} FCFA`}
          </Text>
        </Text>
      </View>

      {/* Quick chips — adaptes a la devise */}
      <View style={{ paddingHorizontal: 22, paddingTop: 14 }}>
        <View style={styles.chipsRow}>
          {(currency === 'EUR' ? PRESETS_EUR : PRESETS_FCFA).map((p) => {
            const on = p.replace(/\s/g, '') === raw;
            return (
              <Pressable
                key={p}
                onPress={() => onPreset(p)}
                style={[styles.chip, on && { backgroundColor: colors.coral, transform: [{ scale: 1.04 }] }]}
              >
                <Text style={[styles.chipText, on && { color: colors.bg }]}>
                  {currency === 'EUR' ? `${p} €` : p}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ padding: 14, marginTop: 16 }}>
        <KeyPad onPress={onKey} />
      </View>

      {/* Compact recap */}
      <View style={{ paddingHorizontal: 22, marginTop: 14 }}>
        <View style={styles.recap}>
          <View>
            <Text style={styles.recapLabel}>Total à débiter</Text>
            <View style={styles.recapHint}>
              <IconCheck size={9} color={colors.green} strokeWidth={3} />
              <Text style={styles.recapHintText}>Aucun frais à l'envoi</Text>
            </View>
          </View>
          <Text style={styles.recapAmt}>{formatted} {currency === 'EUR' ? '€' : 'FCFA'}</Text>
        </View>

        {/* Garde-fous : montants min/max appliqués depuis la conf admin */}
        {tooLow && (
          <Text style={styles.warn}>
            ⚠️ Minimum {minCard.toLocaleString('fr-FR').replace(/,/g, ' ')} FCFA par carte.
          </Text>
        )}
        {kycRequired && (
          <Text style={styles.warn}>
            🪪 Au-delà de {maxNoKyc.toLocaleString('fr-FR').replace(/,/g, ' ')} FCFA, la vérification d'identité (KYC) est obligatoire.
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          label="Continuer"
          pulse
          disabled={!raw || amountNum <= 0 || blockNext}
          onPress={() =>
            navigation.navigate('SendStyle', {
              categoryKey,
              recipientPhone,
              recipientName,
              // Toujours envoyer le montant en FCFA aux ecrans suivants
              // (le backend n attend que des FCFA).
              amount: amountNum.toLocaleString('fr-FR').replace(/,/g, ' '),
            })
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  amountWrap: { paddingTop: 22, alignItems: 'center', position: 'relative' },
  amount: { fontFamily: fonts.bodyBold, fontSize: 64, color: colors.ink, letterSpacing: -2.5, lineHeight: 64 },
  cursor: { width: 3, height: 56, borderRadius: 2, backgroundColor: colors.coral },
  amountUnit: { marginTop: 6, fontFamily: fonts.displayItalic, fontSize: 15, color: colors.ink2 },
  afterBalance: { marginTop: 6, fontSize: 11, color: colors.ink2 },
  afterBalanceNum: { fontFamily: fonts.bodyBold, color: colors.ink },
  conv: { marginTop: 2, fontSize: 11, color: colors.ink3, fontFamily: fonts.displayItalic },
  chipsRow: { flexDirection: 'row', gap: 8 },
  chip: { flex: 1, height: 36, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  recap: { backgroundColor: colors.surface, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.lineSoft, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recapLabel: { fontSize: 11, color: colors.ink2 },
  recapHint: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  recapHintText: { fontSize: 10, color: colors.green, fontStyle: 'italic' },
  recapAmt: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.coral, letterSpacing: -0.5 },
  warn: { marginTop: 10, fontSize: 12, color: colors.coralDeep, fontFamily: fonts.bodyMedium, textAlign: 'center', lineHeight: 17 },
  footer: { position: 'absolute', bottom: 22, left: 22, right: 22 },
});
