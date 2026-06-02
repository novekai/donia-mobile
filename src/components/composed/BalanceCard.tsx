// BalanceCard — carte indigo avec gradient + soleil + sparkles + balance + 2 CTA
// Réutilisée par Home et Wallet
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BrandGradient } from '../brand/BrandGradient';
import { SunRays } from '../deco/SunRays';
import { Sparkle } from '../deco/Sparkle';
import { HibiscusBurst } from '../deco/HibiscusBurst';
import { KenteStrip } from '../deco/KenteStrip';
import { Button } from '../ui/Button';
import { Shimmer } from '../ui/Shimmer';
import { IconPlus, IconArrowDown } from '../ui/Icons';
import { colors, radius, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';

type Props = {
  amount: string;
  label?: string;
  sublabel?: string;
  onTopUp?: () => void;
  onWithdraw?: () => void;
  withHibiscus?: boolean;
};

export function BalanceCard({
  amount,
  label = 'Solde Donia',
  sublabel = 'FCFA · MOBILE MONEY OUEST',
  onTopUp,
  onWithdraw,
  withHibiscus = true,
}: Props) {
  return (
    <BrandGradient variant="indigo" style={[styles.card, shadow.indigo]}>
      {/* Decorations */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <SunRays size={200} color={colors.mango} style={{ position: 'absolute', top: -70, right: -70, opacity: 0.35 }} />
        <Sparkle size={14} color={colors.mango} delay={0.4} style={{ position: 'absolute', top: 28, right: 90 }} />
        {withHibiscus && (
          <HibiscusBurst size={50} color={colors.coral} anim="float" style={{ position: 'absolute', bottom: -10, right: 30, opacity: 0.5 }} />
        )}
      </View>

      <View style={{ position: 'relative' }}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amount}>
            {amount}
            <Text style={styles.amountUnit}> FCFA</Text>
          </Text>
          <Shimmer style={{ borderRadius: 4 }} />
        </View>
        <KenteStrip height={5} width={'30%'} style={{ marginTop: 14 }} />
        <View style={styles.actions}>
          <Button label="Recharger" variant="mango" size="md" leftIcon={<IconPlus color={colors.indigo} />} onPress={onTopUp} style={{ flex: 1 }} />
          <Button label="Retirer" variant="ghost" size="md" leftIcon={<IconArrowDown color={colors.bg} />} onPress={onWithdraw} style={{ flex: 1 }} />
        </View>
        <Text style={styles.sublabel}>{sublabel}</Text>
      </View>
    </BrandGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: 24,
    overflow: 'hidden',
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.mango,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  amountRow: { marginTop: 8, position: 'relative' },
  amount: {
    fontFamily: fonts.bodyBold,
    fontSize: 44,
    color: colors.bg,
    letterSpacing: -1.3,
    lineHeight: 44,
  },
  amountUnit: { fontSize: 17, color: colors.bg, fontFamily: fonts.bodySemiBold, opacity: 0.8 },
  actions: { marginTop: 16, flexDirection: 'row', gap: 8 },
  sublabel: { marginTop: 12, fontSize: 11, color: colors.bg, opacity: 0.6, letterSpacing: 0.8, fontFamily: fonts.bodyMedium },
});
