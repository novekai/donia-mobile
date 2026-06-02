// TxDetail — fetches the real card from the API and renders the right state
// (success / pending payment / failed). Replaces the previous mocked layout.
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Alert, AppState } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ConcentricRings } from '../../components/deco/ConcentricRings';
import { Sparkle } from '../../components/deco/Sparkle';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { IconCheck } from '../../components/ui/Icons';
import { colors, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { getCard, resendCard } from '../../api/cards';
import { getApiErrorMessage } from '../../api/client';
import type { Card as CardModel } from '../../api/types';

const OCCASION_EMOJI: Record<string, { emoji: string; label: string }> = {
  bonjour: { emoji: '👋', label: 'Bonjour' },
  anniversaire: { emoji: '🎂', label: 'Anniversaire' },
  anniv: { emoji: '🎂', label: 'Anniversaire' },
  bravo: { emoji: '🏆', label: 'Bravo' },
  jetaime: { emoji: '💖', label: "J'aime" },
  amour: { emoji: '💖', label: "J'aime" },
  'saint-valentin': { emoji: '💖', label: 'Saint-Valentin' },
  mariage: { emoji: '💍', label: 'Mariage' },
  condoleances: { emoji: '🕊️', label: 'Condoléances' },
  condo: { emoji: '🕊️', label: 'Condoléances' },
  tabaski: { emoji: '🌙', label: 'Tabaski' },
  noel: { emoji: '🎄', label: 'Noël' },
  naissance: { emoji: '👶', label: 'Naissance' },
  goshop: { emoji: '🛍️', label: 'GoShop' },
  diplome: { emoji: '🎓', label: 'Diplôme' },
};

const OPERATOR_DETECTION: { country: string; prefix: string; ops: { name: string; prefixes: string[] }[] }[] = [
  {
    country: 'Bénin', prefix: '+229',
    ops: [
      { name: 'MTN Bénin', prefixes: ['90', '91', '96', '97'] },
      { name: 'Moov Bénin', prefixes: ['94', '95', '98', '99'] },
      { name: 'Celtiis', prefixes: ['51', '52'] },
    ],
  },
  {
    country: "Côte d'Ivoire", prefix: '+225',
    ops: [
      { name: 'Orange CI', prefixes: ['07', '08', '09'] },
      { name: 'MTN CI', prefixes: ['05', '04', '03'] },
      { name: 'Moov CI', prefixes: ['01', '02', '40'] },
    ],
  },
  {
    country: 'Sénégal', prefix: '+221',
    ops: [
      { name: 'Orange SN', prefixes: ['77'] },
      { name: 'Free SN', prefixes: ['76'] },
      { name: 'Wave SN', prefixes: ['78', '70'] },
    ],
  },
];

function detectOperator(phone: string): string {
  const e164 = phone.startsWith('+') ? phone : `+229${phone}`;
  for (const country of OPERATOR_DETECTION) {
    if (!e164.startsWith(country.prefix)) continue;
    const local = e164.slice(country.prefix.length);
    for (const op of country.ops) {
      if (op.prefixes.some((p) => local.startsWith(p))) return op.name;
    }
    return country.country;
  }
  return 'Mobile Money';
}

function formatPhone(phone: string): string {
  const e164 = phone.startsWith('+') ? phone : `+${phone}`;
  if (e164.startsWith('+229') && e164.length >= 12) {
    const local = e164.slice(4);
    return `+229 ${local.slice(0, 2)} ${local.slice(2, 4)} ${local.slice(4, 6)} ${local.slice(6, 8)}`;
  }
  return e164;
}

function formatAmount(amount: string | number): string {
  return Number(amount).toLocaleString('fr-FR').replace(/,/g, ' ');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).replace(',', ' ·');
}

type StateMeta = {
  title: string;
  sub: (card: CardModel) => string;
  badge: 'mint' | 'mango' | 'coral';
  showResend: boolean;
};

const STATE_BY_STATUS: Record<CardModel['status'], StateMeta> = {
  CREATED: {
    title: 'En attente de paiement',
    sub: () => 'Termine le paiement pour livrer la carte.',
    badge: 'mango',
    showResend: false,
  },
  SENT: {
    title: 'Envoi réussi !',
    sub: (c) => `${formatAmount(c.amount)} FCFA à ${c.recipientName ?? formatPhone(c.recipientPhone)}`,
    badge: 'mint',
    showResend: true,
  },
  REDEEMED: {
    title: 'Carte convertie ✨',
    sub: (c) =>
      `${c.recipientName ?? formatPhone(c.recipientPhone)} a converti ta carte de ${formatAmount(c.amount)} FCFA.`,
    badge: 'mint',
    showResend: false,
  },
  EXPIRED: {
    title: 'Carte expirée',
    sub: () => 'Le délai de retrait est dépassé. Tu peux en envoyer une nouvelle.',
    badge: 'coral',
    showResend: false,
  },
  CANCELLED: {
    title: 'Carte annulée',
    sub: () => 'Cette carte a été annulée.',
    badge: 'coral',
    showResend: false,
  },
};

export function TxDetailScreen({ navigation, route }: RootStackScreenProps<'TxDetail'>) {
  const txId = route.params?.txId;
  const queryClient = useQueryClient();
  const [resending, setResending] = React.useState(false);

  const cardQuery = useQuery({
    queryKey: ['card', txId],
    queryFn: () => (txId ? getCard(txId).then((r) => r.card) : Promise.reject(new Error('No txId'))),
    enabled: Boolean(txId),
    // While the card is still CREATED (waiting for Mobile Money payment), poll
    // every 5 s so the screen flips to "Envoi réussi" automatically the moment
    // the FedaPay webhook lands.
    refetchInterval: (q) => (q.state.data?.status === 'CREATED' ? 5000 : false),
  });

  // When the user returns to the app (e.g. from the FedaPay payment page in
  // the browser), refetch immediately instead of waiting up to 5 seconds.
  React.useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && txId) {
        queryClient.invalidateQueries({ queryKey: ['card', txId] });
      }
    });
    return () => sub.remove();
  }, [txId, queryClient]);

  async function onResend() {
    if (!cardQuery.data) return;
    setResending(true);
    try {
      await resendCard(cardQuery.data.id);
      Alert.alert('Renvoyé !', 'Le destinataire vient de recevoir à nouveau la carte.');
    } catch (e) {
      Alert.alert('Renvoi échoué', getApiErrorMessage(e));
    } finally {
      setResending(false);
    }
  }

  if (cardQuery.isLoading) {
    return (
      <ScreenContainer>
        <FunBackground palette="cream" density="sparse" />
        <ScreenHeader title="Détail" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.coral} />
        </View>
      </ScreenContainer>
    );
  }

  if (cardQuery.isError || !cardQuery.data) {
    return (
      <ScreenContainer>
        <FunBackground palette="cream" density="sparse" />
        <ScreenHeader title="Détail" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontFamily: fonts.displayMedium, fontSize: 18, color: colors.ink, textAlign: 'center' }}>
            Impossible de charger cette carte
          </Text>
          <Text style={{ marginTop: 8, fontSize: 13, color: colors.ink2, textAlign: 'center' }}>
            {cardQuery.error ? getApiErrorMessage(cardQuery.error) : 'Réessaye plus tard.'}
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const card = cardQuery.data;
  const state = STATE_BY_STATUS[card.status];
  const occ = OCCASION_EMOJI[card.occasion ?? 'bonjour'] ?? { emoji: '🎁', label: card.occasion ?? 'Donia' };
  const operator = detectOperator(card.recipientPhone);

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader
        title="Détail"
        onBack={() => navigation.goBack()}
        rightAction={
          <Pressable onPress={() => Alert.alert('Code de retrait', card.redeemCode)}>
            <Text style={styles.share}>Partager</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 130 }}>
        <Card pad={22} style={styles.successWrap}>
          <View style={{ position: 'absolute', top: -50, left: '50%', marginLeft: -90 }} pointerEvents="none">
            <ConcentricRings size={180} color={colors.mint} opacity={0.18} anim="spin" />
          </View>
          <BrandGradient variant={state.badge} style={[styles.checkIcon, shadow.mint]}>
            <IconCheck size={28} color={colors.bg} strokeWidth={3.5} />
          </BrandGradient>
          <Sparkle size={14} color={colors.mango} style={{ position: 'absolute', top: 24, right: 60 }} />
          <Sparkle size={10} color={colors.pink} delay={0.8} style={{ position: 'absolute', top: 60, left: 50 }} />
          <Text style={styles.successTitle}>{state.title}</Text>
          <Text style={styles.successSub}>{state.sub(card)}</Text>
          <View style={styles.occBadge}>
            <Text style={{ fontSize: 13 }}>{occ.emoji}</Text>
            <Text style={styles.occText}>{occ.label}</Text>
          </View>
        </Card>

        <Card pad={0} style={{ marginTop: 14 }}>
          <Row label="Destinataire" value={card.recipientName ?? formatPhone(card.recipientPhone)} />
          <Row label="Téléphone" value={formatPhone(card.recipientPhone)} />
          <Row label="Opérateur" value={operator} />
          <Row label="Montant de la carte" value={`${formatAmount(card.amount)} FCFA`} accent bold />
          {/* Hide the redeem code while the payment is still pending — it
              should never be shared before the card has actually been paid. */}
          {card.status !== 'CREATED' && <Row label="Référence" value={card.redeemCode} mono />}
          <Row label="Date" value={formatDate(card.createdAt)} last />
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        {state.showResend && (
          <Button
            label={resending ? 'Envoi en cours…' : 'Renvoyer le même cadeau'}
            pulse
            disabled={resending}
            onPress={onResend}
          />
        )}
        <Pressable
          style={styles.report}
          onPress={() => Alert.alert('Signaler', 'Décris le problème par email à contact@doniia.com.')}
        >
          <Text style={styles.reportText}>Signaler un problème</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

function Row({
  label,
  value,
  accent,
  bold,
  mono,
  last,
}: {
  label: string;
  value: string;
  accent?: boolean;
  bold?: boolean;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={[
          styles.rowValue,
          accent && { color: colors.coral },
          bold && { fontFamily: fonts.bodyBold },
          mono && { fontFamily: fonts.bodyBold, letterSpacing: 0.3 },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  share: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.coral },
  successWrap: { alignItems: 'center', overflow: 'hidden' },
  checkIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  successTitle: {
    marginTop: 14,
    fontFamily: fonts.displayMedium,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  successSub: {
    marginTop: 4,
    fontSize: 13,
    color: colors.ink2,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  occBadge: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    backgroundColor: colors.coral,
  },
  occText: { fontSize: 11, fontFamily: fonts.bodyBold, color: colors.bg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    alignItems: 'center',
    gap: 12,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  rowLabel: { fontSize: 13, color: colors.ink2 },
  rowValue: {
    fontSize: 13,
    color: colors.ink,
    fontFamily: fonts.bodySemiBold,
    textAlign: 'right',
    flexShrink: 1,
  },
  footer: { position: 'absolute', bottom: 28, left: 22, right: 22, gap: 8 },
  report: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  reportText: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.ink2 },
});
