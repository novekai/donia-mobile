// TopUpCode — hero 🔓 qui bobbe + 8 inputs + validation live + preview carte + breakdown (API hook)
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { useQueryClient } from '@tanstack/react-query';
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
import { topupCode } from '../../api/wallet';
import { getApiErrorMessage } from '../../api/client';

const EMPTY = ['', '', '', '', '', '', '', ''];

export function TopUpCodeScreen({ navigation }: RootStackScreenProps<'TopUpCode'>) {
  const [code, setCode] = useState<string[]>(EMPTY);
  const [loading, setLoading] = useState(false);
  const bobStyle = useBob();
  const queryClient = useQueryClient();
  const valid = code.every((c) => c.length === 1);

  async function onSubmit() {
    if (loading) return;
    if (!valid) return Alert.alert('Code incomplet', 'Entre les 8 caractères.');
    const fullCode = `DON-2026-${code.join('').toUpperCase()}`;
    setLoading(true);
    try {
      const res = await topupCode(fullCode);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      Alert.alert(
        '✅ Recharge effectuée',
        `Tu as reçu ${Number(res.credited).toLocaleString('fr-FR')} FCFA sur ton solde (commission ${Number(res.commission).toLocaleString('fr-FR')} FCFA).`,
        [{ text: 'OK', onPress: () => navigation.navigate('Wallet') }],
      );
    } catch (e) {
      Alert.alert('Code invalide', getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer avoidKeyboard>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Code de carte" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        {/* Hero icon */}
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
        <Text style={styles.subtitle}>8 caractères, reçus par email ou WhatsApp avec ta carte.</Text>

        {/* Code inputs */}
        <View style={styles.codeRow}>
          {code.map((c, i) => (
            <TextInput
              key={i}
              value={c}
              onChangeText={(v) => {
                const next = [...code];
                next[i] = v.slice(-1).toUpperCase();
                setCode(next);
              }}
              maxLength={1}
              autoCapitalize="characters"
              style={[styles.codeInput, c && styles.codeFilled]}
            />
          ))}
        </View>
        {valid && (
          <View style={styles.codeValid}>
            <IconCheck size={11} color={colors.green} strokeWidth={3.5} />
            <Text style={styles.codeValidText}>Code valide — carte de 5 000 FCFA de Marie</Text>
          </View>
        )}

        {/* Card preview */}
        <View style={{ paddingHorizontal: 22, marginTop: 20 }}>
          <BrandGradient variant="pinkPlum" style={styles.preview}>
            <Sparkle size={12} color={colors.mango} style={{ position: 'absolute', top: 12, right: 14 }} />
            <HibiscusBurst size={40} color={colors.mango} anim="float" style={{ position: 'absolute', bottom: -10, right: -6, opacity: 0.5 }} />
            <View style={styles.previewIcon}><Text style={{ fontSize: 18 }}>🎂</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.previewKicker}>Anniversaire · de Marie</Text>
              <Text style={styles.previewAmount}>5 000 FCFA</Text>
            </View>
          </BrandGradient>
        </View>

        {/* Breakdown */}
        <View style={{ paddingHorizontal: 22, marginTop: 14 }}>
          <View style={styles.breakdown}>
            <View style={[styles.brRow, { borderBottomWidth: 1, borderBottomColor: colors.lineSoft, paddingBottom: 8 }]}>
              <Text style={styles.brLabel}>Montant carte</Text>
              <Text style={styles.brValue}>5 000 FCFA</Text>
            </View>
            <View style={[styles.brRow, { paddingVertical: 6 }]}>
              <Text style={styles.brLabel}>Commission Donia (5%)</Text>
              <Text style={[styles.brValue, { color: colors.coralDeep }]}>−250 FCFA</Text>
            </View>
            <View style={styles.brTotalRow}>
              <View>
                <Text style={styles.brTotalLabel}>Crédité sur ton solde</Text>
                <Text style={styles.brTotalSub}>Nouveau solde : 130 550 FCFA</Text>
              </View>
              <Text style={styles.brTotalValue}>+4 750 FCFA</Text>
            </View>
          </View>
        </View>

        <View style={{ padding: 22 }}>
          <Button label={loading ? 'Recharge…' : 'Recharger'} pulse disabled={loading || !valid} onPress={onSubmit} />
          <Text style={styles.help}>
            Pas reçu de code ?{' '}
            <Text style={{ color: colors.coral, fontFamily: fonts.bodyBold }}>Demande-le à l'expéditeur</Text>
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
  title: { fontFamily: fonts.displayMedium, fontSize: 24, color: colors.ink, textAlign: 'center', marginTop: 18, letterSpacing: -0.5 },
  titleItalic: { fontFamily: fonts.displayItalic, color: colors.coral },
  subtitle: { fontSize: 13, color: colors.ink2, textAlign: 'center', marginTop: 6 },
  codeRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 18, marginTop: 26 },
  codeInput: { flex: 1, aspectRatio: 0.78, borderRadius: 11, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.line, textAlign: 'center', fontFamily: fonts.bodyBold, fontSize: 20, color: colors.indigo, backgroundColor: 'transparent' },
  codeFilled: { backgroundColor: colors.surface, borderStyle: 'solid', borderColor: colors.lineSoft },
  codeValid: { marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 },
  codeValidText: { fontSize: 11, color: colors.green, fontFamily: fonts.bodyBold },
  preview: { padding: 14, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden' },
  previewIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(253,247,246,0.2)', alignItems: 'center', justifyContent: 'center' },
  previewKicker: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.bg, letterSpacing: 0.7, textTransform: 'uppercase' },
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
