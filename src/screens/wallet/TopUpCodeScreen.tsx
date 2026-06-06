// TopUpCode — entrée du code de retrait avec auto-focus + preview live de la carte.
// La carte (montant, sender, commission) n'apparaît qu'APRÈS validation du code,
// jamais en mock.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ConcentricRings } from '../../components/deco/ConcentricRings';
import { Sparkle } from '../../components/deco/Sparkle';
import { HibiscusBurst } from '../../components/deco/HibiscusBurst';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { IconCheck } from '../../components/ui/Icons';
import { useBob } from '../../theme/animations';
import { colors, radius, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { topupCode, previewTopupCode } from '../../api/wallet';
import { getMe } from '../../api/me';
import { getApiErrorMessage } from '../../api/client';

// Le backend genere un code au format DON-2026-XXXXX ou XXXXX = 5 caracteres
// alphanumeriques. Le mobile affiche les 5 cases + le prefixe en label visuel.
// On accepte aussi le format complet si l'utilisateur colle (auto-strip du prefixe).
const CODE_PREFIX = 'DON-2026-';
const CODE_LENGTH = 5;
const EMPTY_CODE = Array.from({ length: CODE_LENGTH }, () => '');

const OCCASION_EMOJI: Record<string, string> = {
  bonjour: '👋',
  anniversaire: '🎂',
  anniv: '🎂',
  bravo: '🏆',
  jetaime: '💖',
  'saint-valentin': '💖',
  mariage: '💍',
  condoleances: '🕊️',
  tabaski: '🌙',
  noel: '🎄',
  naissance: '👶',
  goshop: '🛍️',
  diplome: '🎓',
};

const OCCASION_LABEL: Record<string, string> = {
  bonjour: 'Bonjour',
  anniversaire: 'Anniversaire',
  anniv: 'Anniversaire',
  bravo: 'Bravo',
  jetaime: "J'aime",
  'saint-valentin': 'Saint-Valentin',
  mariage: 'Mariage',
  condoleances: 'Condoléances',
  tabaski: 'Tabaski',
  noel: 'Noël',
  naissance: 'Naissance',
  goshop: 'GoShop',
  diplome: 'Diplôme',
};

function fmt(n: number): string {
  return Math.round(n).toLocaleString('fr-FR').replace(/,/g, ' ');
}

export function TopUpCodeScreen({ navigation }: RootStackScreenProps<'TopUpCode'>) {
  const [code, setCode] = useState<string[]>(EMPTY_CODE);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const bobStyle = useBob();
  const queryClient = useQueryClient();

  const fullCode = `${CODE_PREFIX}${code.join('').toUpperCase()}`;
  const valid = code.every((c) => c.length === 1);

  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const currentBalance = Number(meQuery.data?.user.wallet?.balancePrincipal ?? 0);

  // Live preview: as soon as the 8 chars are filled, fetch the card details
  // from the backend. Cached per code so revisiting the screen is instant.
  const previewQuery = useQuery({
    queryKey: ['topup-code-preview', fullCode],
    queryFn: () => previewTopupCode(fullCode),
    enabled: valid,
    retry: false,
  });

  function setCharAt(index: number, char: string) {
    // Strip auto si l'utilisateur colle le code complet "DON-2026-PCCVH" : on
    // garde uniquement les 5 derniers caracteres alphanumeriques.
    const cleaned = char
      .replace(new RegExp(`^${CODE_PREFIX.replace(/-/g, '\\-')}`, 'i'), '')
      .replace(/-/g, '')
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase();

    // Cas du paste : plusieurs caracteres d'un coup -> on dispatche dans les cases
    if (cleaned.length > 1) {
      setCode(() => {
        const next = Array.from({ length: CODE_LENGTH }, () => '');
        for (let i = 0; i < Math.min(cleaned.length, CODE_LENGTH); i++) {
          next[i] = cleaned[i] ?? '';
        }
        return next;
      });
      const focusAt = Math.min(cleaned.length, CODE_LENGTH - 1);
      inputsRef.current[focusAt]?.focus();
      return;
    }

    setCode((prev) => {
      const next = [...prev];
      next[index] = cleaned.slice(-1);
      return next;
    });
    if (cleaned && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function onKey(index: number, key: string) {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      setCode((prev) => {
        const next = [...prev];
        next[index - 1] = '';
        return next;
      });
    }
  }

  async function onSubmit() {
    if (loading || !valid) return;
    if (!previewQuery.data) {
      Alert.alert('Code invalide', 'Vérifie le code et réessaye.');
      return;
    }
    setLoading(true);
    try {
      const res = await topupCode(fullCode);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      Alert.alert(
        '✅ Recharge effectuée',
        `Tu as reçu ${fmt(Number(res.credited))} FCFA sur ton solde.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Wallet') }],
      );
    } catch (e) {
      Alert.alert('Recharge impossible', getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  const previewError = previewQuery.isError ? getApiErrorMessage(previewQuery.error) : null;
  const preview = previewQuery.data;
  const newBalance = useMemo(
    () => (preview ? currentBalance + preview.net : currentBalance),
    [currentBalance, preview],
  );

  useEffect(() => {
    const t = setTimeout(() => inputsRef.current[0]?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <ScreenContainer avoidKeyboard>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Code de carte" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <View style={styles.heroWrap}>
          <View style={{ position: 'absolute' }}>
            <ConcentricRings size={100} color={colors.coral} opacity={0.25} anim="spin" />
          </View>
          <Animated.View style={[bobStyle, styles.heroIcon, shadow.indigo]}>
            <BrandGradient variant="indigo" style={styles.heroIconInner}>
              <Text style={{ fontSize: 32 }}>🔓</Text>
            </BrandGradient>
          </Animated.View>
          <Sparkle size={14} color={colors.mango} style={{ position: 'absolute', top: -4, right: '38%' }} />
        </View>

        <Text style={styles.title}>
          Entre ton <Text style={styles.titleItalic}>code de retrait</Text>
        </Text>
        <Text style={styles.subtitle}>
          5 caractères après <Text style={styles.prefixInline}>{CODE_PREFIX}</Text> (reçu par email ou WhatsApp).
        </Text>

        <View style={styles.codeRow}>
          <Text style={styles.codePrefix}>{CODE_PREFIX}</Text>
          {code.map((c, i) => (
            <TextInput
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={c}
              onChangeText={(v) => setCharAt(i, v)}
              onKeyPress={({ nativeEvent }) => onKey(i, nativeEvent.key)}
              maxLength={CODE_LENGTH}
              autoCapitalize="characters"
              autoCorrect={false}
              selectTextOnFocus
              style={[styles.codeInput, c && styles.codeFilled]}
            />
          ))}
        </View>

        {/* Status under the inputs — loading / error / valid */}
        {valid && previewQuery.isLoading && (
          <View style={styles.codeStatus}>
            <ActivityIndicator size="small" color={colors.coral} />
            <Text style={styles.codeStatusText}>Vérification du code…</Text>
          </View>
        )}
        {valid && previewError && (
          <View style={styles.codeStatus}>
            <Text style={[styles.codeStatusText, { color: colors.coralDeep }]}>
              ⚠️  {previewError}
            </Text>
          </View>
        )}
        {valid && preview && (
          <View style={styles.codeStatus}>
            <IconCheck size={11} color={colors.green} strokeWidth={3.5} />
            <Text style={[styles.codeStatusText, { color: colors.green }]}>
              Code valide — carte de {fmt(preview.amount)} FCFA de {preview.senderName.split(' ')[0]}
            </Text>
          </View>
        )}

        {/* Card preview + breakdown — ONLY after backend validation */}
        {preview && (
          <>
            <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
              <BrandGradient variant="pinkPlum" style={styles.preview}>
                <Sparkle size={12} color={colors.mango} style={{ position: 'absolute', top: 12, right: 14 }} />
                <HibiscusBurst
                  size={40}
                  color={colors.mango}
                  anim="float"
                  style={{ position: 'absolute', bottom: -10, right: -6, opacity: 0.5 }}
                />
                <View style={styles.previewIcon}>
                  <Text style={{ fontSize: 18 }}>{OCCASION_EMOJI[preview.occasion] ?? '🎁'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewKicker}>
                    {(OCCASION_LABEL[preview.occasion] ?? preview.occasion).toUpperCase()} · DE{' '}
                    {preview.senderName.split(' ')[0].toUpperCase()}
                  </Text>
                  <Text style={styles.previewAmount}>{fmt(preview.amount)} FCFA</Text>
                </View>
              </BrandGradient>
            </View>

            <View style={{ paddingHorizontal: 22, marginTop: 14 }}>
              <View style={styles.breakdown}>
                <View style={[styles.brRow, { borderBottomWidth: 1, borderBottomColor: colors.lineSoft, paddingBottom: 8 }]}>
                  <Text style={styles.brLabel}>Montant carte</Text>
                  <Text style={styles.brValue}>{fmt(preview.amount)} FCFA</Text>
                </View>
                <View style={[styles.brRow, { paddingVertical: 6 }]}>
                  <Text style={styles.brLabel}>
                    Commission Donia ({Math.round(preview.commissionRate * 100)} %)
                  </Text>
                  <Text style={[styles.brValue, { color: colors.coralDeep }]}>
                    −{fmt(preview.commission)} FCFA
                  </Text>
                </View>
                <View style={styles.brTotalRow}>
                  <View>
                    <Text style={styles.brTotalLabel}>Crédité sur ton solde</Text>
                    <Text style={styles.brTotalSub}>Nouveau solde : {fmt(newBalance)} FCFA</Text>
                  </View>
                  <Text style={styles.brTotalValue}>+{fmt(preview.net)} FCFA</Text>
                </View>
              </View>
            </View>
          </>
        )}

        <View style={{ padding: 22 }}>
          <Button
            label={loading ? 'Recharge…' : 'Recharger'}
            pulse
            disabled={loading || !valid || !preview}
            onPress={onSubmit}
          />
          <Text style={styles.help}>
            Pas reçu de code ?{' '}
            <Text style={{ color: colors.coral, fontFamily: fonts.bodyBold }}>
              Demande-le à l'expéditeur
            </Text>
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroWrap: { width: 100, height: 100, alignSelf: 'center', marginTop: 24, alignItems: 'center', justifyContent: 'center' },
  heroIcon: { width: 64, height: 64, borderRadius: 18, overflow: 'hidden' },
  heroIconInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontFamily: fonts.displayMedium,
    fontSize: 24,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 18,
    letterSpacing: -0.5,
  },
  titleItalic: { fontFamily: fonts.displayItalic, color: colors.coral },
  subtitle: { fontSize: 13, color: colors.ink2, textAlign: 'center', marginTop: 6 },
  codeRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 18, marginTop: 26, alignItems: 'center' },
  codePrefix: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink2, marginRight: 4 },
  prefixInline: { fontFamily: fonts.bodyBold, color: colors.coralDeep },
  codeInput: {
    flex: 1,
    aspectRatio: 0.78,
    borderRadius: 11,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.line,
    textAlign: 'center',
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    color: colors.indigo,
    backgroundColor: 'transparent',
  },
  codeFilled: { backgroundColor: colors.surface, borderStyle: 'solid', borderColor: colors.lineSoft },
  codeStatus: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 22,
  },
  codeStatusText: { fontSize: 12, color: colors.ink2, fontFamily: fonts.bodyBold, textAlign: 'center' },
  preview: {
    padding: 14,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  previewIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(253,247,246,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewKicker: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.bg,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  previewAmount: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.bg, marginTop: 2 },
  breakdown: { padding: 14, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.lineSoft },
  brRow: { flexDirection: 'row', justifyContent: 'space-between' },
  brLabel: { fontSize: 12, color: colors.ink2 },
  brValue: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.ink },
  brTotalRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  brTotalLabel: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.ink },
  brTotalSub: { fontSize: 10, color: colors.green, fontStyle: 'italic', marginTop: 1 },
  brTotalValue: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.green, letterSpacing: -0.4 },
  help: { marginTop: 8, textAlign: 'center', fontSize: 11, color: colors.ink2, fontFamily: fonts.displayItalic },
});
