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

const PRESETS = ['1 000', '5 000', '10 000', '25 000'];

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
  const blinkStyle = useBlink();

  // Real wallet balance — used to show the user how much they'll have left after sending.
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const balance = Number(meQuery.data?.user?.wallet?.balancePrincipal ?? 0);
  const afterBalance = Math.max(0, balance - Number(raw || '0'));

  const formatted = Number(raw || '0').toLocaleString('fr-FR').replace(/,/g, ' ');

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

      {/* Big amount */}
      <View style={styles.amountWrap}>
        <Sparkle size={16} color={colors.mango} style={{ position: 'absolute', top: 12, right: 30 }} />
        <Sparkle size={12} color={colors.pink} delay={0.8} style={{ position: 'absolute', bottom: 12, left: 30 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Text style={styles.amount}>{formatted}</Text>
          <Animated.View style={[blinkStyle, styles.cursor]} />
        </View>
        <Text style={styles.amountUnit}>FCFA</Text>
        <Text style={styles.afterBalance}>
          Solde après envoi : <Text style={styles.afterBalanceNum}>{afterBalance.toLocaleString('fr-FR').replace(/,/g, ' ')} FCFA</Text>
        </Text>
      </View>

      {/* Quick chips */}
      <View style={{ paddingHorizontal: 22, paddingTop: 14 }}>
        <View style={styles.chipsRow}>
          {PRESETS.map((p) => {
            const on = p.replace(/\s/g, '') === raw;
            return (
              <Pressable
                key={p}
                onPress={() => onPreset(p)}
                style={[styles.chip, on && { backgroundColor: colors.coral, transform: [{ scale: 1.04 }] }]}
              >
                <Text style={[styles.chipText, on && { color: colors.bg }]}>{p}</Text>
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
          <Text style={styles.recapAmt}>{formatted} FCFA</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Continuer" pulse disabled={!raw || Number(raw) <= 0} onPress={() => navigation.navigate('SendStyle', { categoryKey, recipientPhone, recipientName, amount: formatted })} />
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
  chipsRow: { flexDirection: 'row', gap: 8 },
  chip: { flex: 1, height: 36, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  recap: { backgroundColor: colors.surface, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.lineSoft, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recapLabel: { fontSize: 11, color: colors.ink2 },
  recapHint: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  recapHintText: { fontSize: 10, color: colors.green, fontStyle: 'italic' },
  recapAmt: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.coral, letterSpacing: -0.5 },
  footer: { position: 'absolute', bottom: 22, left: 22, right: 22 },
});
