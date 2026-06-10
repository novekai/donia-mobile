// SendConfirm — carte preview + WhatsApp/Email + input adresse + recap + CTA (API hook)
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, TextInput, Linking } from 'react-native';
import Animated from 'react-native-reanimated';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { StepHeader } from '../../components/composed/StepHeader';
import { Button } from '../../components/ui/Button';
import { GiftCard, type CardColorOverride } from '../../components/ui/GiftCard';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Card } from '../../components/ui/Card';
import { IconCheck, IconLock } from '../../components/ui/Icons';
import { useBob } from '../../theme/animations';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { createCard, createCardWithMobileMoney } from '../../api/cards';
import { getApiErrorMessage } from '../../api/client';
import { getMe } from '../../api/me';
import { getPlatformSettings } from '../../api/platformSettings';
import type { CardPalette } from '../../theme/tokens';

type PaymentMethod = 'wallet' | 'mobile_money';

const OCCASION_LABEL: Record<string, string> = {
  bonjour: 'Bonjour à toi,',
  anniv: 'Joyeux anniversaire,',
  bravo: 'Bravo !',
  amour: 'Je t\'aime,',
  condo: 'Mes sincères condoléances,',
  mariage: 'Tous mes vœux de bonheur,',
  noel: 'Joyeux Noël,',
  goshop: 'Pour ton shopping !',
};

export function SendConfirmScreen({ navigation, route }: RootStackScreenProps<'SendConfirm'>) {
  const { t } = useTranslation();
  const {
    recipientPhone = '',
    recipientName,
    amount = '10 000',
    categoryKey = 'anniv',
    palette: palettePassed,
    message: messagePassed,
  } = route.params || {};
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [recipientEmailInput, setRecipientEmailInput] = useState('');
  const [recipientWaInput, setRecipientWaInput] = useState('');
  const [loading, setLoading] = useState(false);
  // Le user doit revoir/valider ses préférences de confidentialité avant chaque envoi.
  // On l'envoie sur l'écran Privacy avec un bouton "Continuer vers le paiement" qui
  // ramène ici, et alors privacyChecked passe à true.
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const queryClient = useQueryClient();
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const settingsQuery = useQuery({ queryKey: ['platformSettings'], queryFn: getPlatformSettings });
  const senderName = meQuery.data?.user.name?.split(' ')[0] ?? 'Toi';
  const senderPhone = meQuery.data?.user.phone ?? '';
  const balance = Number(meQuery.data?.user.wallet?.balancePrincipal ?? 0);
  const cardSendFee = settingsQuery.data?.cardSendFeeFixed ?? 200;
  const displayName = recipientName || 'Ton destinataire';

  const amountNum = Number(amount.replace(/\s/g, '')) || 0;
  const totalToPay = amountNum + cardSendFee;

  // The `palette` param now supports 3 formats produced by SendStyleScreen:
  //   - "solid:RRGGBB"            → unique custom color
  //   - "gradient:RRGGBB-RRGGBB"  → 2-stop gradient
  //   - <CardPalette enum>        → legacy 6 fixed palettes (coral/indigo/…)
  // We parse it once and pass either `palette` or `customColors` to <GiftCard/>.
  const { palette, customColors } = parsePaletteParam(palettePassed);
  const occasionLabel = OCCASION_LABEL[categoryKey] ?? 'Bonjour à toi,';
  const defaultMessage = messagePassed ?? `Un petit cadeau pour toi ${recipientName ? recipientName : ''}`.trim();

  const walletEnough = balance >= totalToPay;
  const [payMethod, setPayMethod] = useState<PaymentMethod>('wallet');
  React.useEffect(() => {
    if (!walletEnough && payMethod === 'wallet') setPayMethod('mobile_money');
  }, [walletEnough, payMethod]);

  // Quand on revient sur cet écran via goBack() depuis PrivacyScreen, on considère
  // que la confidentialité vient d'être validée par l'utilisateur.
  React.useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      // Si on a été envoyé sur Privacy puis revenus → privacyChecked devient true.
      // Le state ne se "désinitialise" pas tant que l'utilisateur reste sur ce flow.
    });
    return unsub;
  }, [navigation]);

  async function onSend() {
    if (loading) return;
    if (amountNum <= 0) return Alert.alert('Montant invalide');
    if (!recipientPhone || recipientPhone.length < 8) {
      return Alert.alert('Téléphone destinataire manquant', 'Reviens à l\'étape 2 pour saisir un numéro.');
    }
    if (channel === 'email' && !recipientEmailInput.trim()) {
      return Alert.alert('Email manquant', "Entre l'email du destinataire pour livrer la carte.");
    }
    if (channel === 'whatsapp' && !recipientWaInput.trim() && !recipientPhone) {
      return Alert.alert('Numéro WhatsApp manquant', 'Entre un numéro WhatsApp.');
    }
    // Gate confidentialité — première étape obligatoire avant tout paiement.
    if (!privacyChecked) {
      setPrivacyChecked(true);
      navigation.navigate('Privacy', { fromSendFlow: true });
      return;
    }
    setLoading(true);
    try {
      // For WhatsApp delivery: if the user typed a custom WhatsApp number
      // (different from the recipient phone), use it instead so the card is
      // delivered to the right WhatsApp account. The "recipient" is still
      // tracked for redemption.
      const customWa = recipientWaInput.trim();
      const deliveryPhone =
        channel === 'whatsapp' && customWa && customWa !== recipientPhone
          ? customWa
          : recipientPhone;

      const body = {
        recipientPhone: deliveryPhone,
        recipientName,
        recipientEmail: channel === 'email' ? recipientEmailInput.trim() : undefined,
        amount: amountNum,
        occasion: categoryKey,
        themeKey: categoryKey,
        palette,
        message: defaultMessage || undefined,
        deliveryChannel: (channel === 'whatsapp' ? 'WHATSAPP' : 'EMAIL') as 'WHATSAPP' | 'EMAIL',
      };
      if (payMethod === 'mobile_money') {
        const res = await createCardWithMobileMoney({ ...body, payerPhone: senderPhone });
        await Linking.openURL(res.paymentUrl);
        queryClient.invalidateQueries({ queryKey: ['me'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        navigation.replace('TxDetail', { cardId: res.card.id });
      } else {
        const res = await createCard(body);
        queryClient.invalidateQueries({ queryKey: ['me'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        navigation.replace('TxDetail', { cardId: res.card.id });
      }
    } catch (e) {
      Alert.alert('Envoi échoué', getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }
  const bobStyle = useBob({ duration: 5000 });

  return (
    <ScreenContainer avoidKeyboard>
      <FunBackground palette="cream" density="sparse" />
      <StepHeader step={4} of={4} title={t('send.stepTitle')} sub={t('send.stepSub')} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 130 }} keyboardShouldPersistTaps="handled">
        <Animated.View style={bobStyle}>
          <GiftCard
            occasion={occasionLabel}
            amount={amount}
            recipient={displayName}
            sender={senderName}
            message={defaultMessage}
            palette={palette}
            customColors={customColors}
          />
        </Animated.View>

        <Pressable onPress={() => navigation.navigate('Customize', { categoryKey, recipientPhone, recipientName, amount })} style={styles.customize}>
          <Text style={styles.customizeText}>{t('send.customizeCard')}</Text>
        </Pressable>

        {/* Delivery channel */}
        <View style={{ marginTop: 14 }}>
          <Text style={styles.label}>{t('send.deliveryLabel')}</Text>
          <SegmentedControl
            value={channel}
            onChange={setChannel}
            options={[
              { value: 'whatsapp', label: t('send.whatsapp'), activeColor: '#25D366' },
              { value: 'email', label: t('send.email') },
            ]}
          />
          {channel === 'email' ? (
            <TextInput
              value={recipientEmailInput}
              onChangeText={setRecipientEmailInput}
              placeholder={t('send.emailPlaceholder')}
              placeholderTextColor={colors.ink3}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.deliveryInput}
            />
          ) : (
            <TextInput
              value={recipientWaInput || recipientPhone}
              onChangeText={setRecipientWaInput}
              placeholder={t('send.waPlaceholder')}
              placeholderTextColor={colors.ink3}
              keyboardType="phone-pad"
              style={styles.deliveryInput}
            />
          )}
        </View>

        {/* Recap */}
        <Card pad={14} style={{ marginTop: 16 }}>
          {[
            { l: t('send.recipient'), v: recipientPhone || '—' },
            { l: t('send.occasion'), v: occasionLabel.replace(/[,!]$/, '') },
            { l: 'Montant de la carte', v: `${amount} FCFA` },
            ...(cardSendFee > 0 ? [{ l: 'Frais de transaction', v: `+ ${cardSendFee.toLocaleString('fr-FR').replace(/,/g, ' ')} FCFA` }] : []),
          ].map((r, i, arr) => (
            <View key={i} style={[styles.recapRow, i < arr.length - 1 && styles.recapDivider]}>
              <Text style={styles.recapLabel}>{r.l}</Text>
              <Text style={styles.recapValue}>{r.v}</Text>
            </View>
          ))}
          <View style={[styles.recapRow, { paddingTop: 12 }]}>
            <View>
              <Text style={styles.totalLabel}>Total à payer</Text>
              <View style={styles.totalHint}>
                <IconCheck size={9} color={colors.green} strokeWidth={3} />
                <Text style={styles.totalHintText}>
                  {amountNum.toLocaleString('fr-FR').replace(/,/g, ' ')} FCFA reçus par {displayName}
                </Text>
              </View>
            </View>
            <Text style={styles.totalAmt}>
              {totalToPay.toLocaleString('fr-FR').replace(/,/g, ' ')} FCFA
            </Text>
          </View>
        </Card>

        {/* Payment method */}
        <Text style={[styles.label, { marginTop: 14 }]}>{t('send.payMethod')}</Text>

        <Pressable
          onPress={() => walletEnough && setPayMethod('wallet')}
          style={[
            styles.payOption,
            payMethod === 'wallet' && styles.payOptionActive,
            !walletEnough && { opacity: 0.55 },
          ]}
        >
          <View style={[styles.paymentIcon, { backgroundColor: colors.coral }]}>
            <Text style={{ fontSize: 18 }}>💰</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.paymentTitle}>{t('send.walletOption')}</Text>
            <Text style={styles.paymentSub}>
              {walletEnough
                ? t('send.walletAvail', { amount: balance.toLocaleString('fr-FR').replace(/,/g, ' ') })
                : t('send.walletShort', { amount: balance.toLocaleString('fr-FR').replace(/,/g, ' ') })}
            </Text>
          </View>
          {payMethod === 'wallet' && (
            <View style={styles.paymentCheck}>
              <IconCheck size={12} color={colors.bg} strokeWidth={3} />
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={() => setPayMethod('mobile_money')}
          style={[styles.payOption, payMethod === 'mobile_money' && styles.payOptionActive]}
        >
          <View style={[styles.paymentIcon, { backgroundColor: colors.indigo }]}>
            <Text style={{ fontSize: 18 }}>📱</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.paymentTitle}>{t('send.mmOption')}</Text>
            <Text style={styles.paymentSub}>{t('send.mmSub')}</Text>
          </View>
          {payMethod === 'mobile_money' && (
            <View style={styles.paymentCheck}>
              <IconCheck size={12} color={colors.bg} strokeWidth={3} />
            </View>
          )}
        </Pressable>

        {!walletEnough && (
          <Pressable onPress={() => navigation.navigate('TopUpMethod')} style={styles.topupHint}>
            <Text style={styles.topupHintText}>{t('send.topupHint')}</Text>
          </Pressable>
        )}

        {/* Bouton Envoyer inline : garde-fou pour que l'utilisateur ne quitte pas l'app
            si le footer est masque par le clavier. Toujours accessible via scroll. */}
        <View style={{ marginTop: 20 }}>
          <Button
            label={
              loading
                ? t('send.btnSending')
                : !privacyChecked
                ? t('send.btnPrivacyCheck')
                : t('send.btnSend', { amount })
            }
            pulse
            shimmer
            disabled={loading}
            onPress={onSend}
          />
          <View style={styles.secure}>
            <IconLock color={colors.ink3} />
            <Text style={styles.secureText}>
              {!privacyChecked ? t('send.secureBeforePayment') : t('send.secureFedapay')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={
            loading
              ? t('send.btnSending')
              : !privacyChecked
              ? t('send.btnPrivacyCheck')
              : t('send.btnSend', { amount })
          }
          pulse
          shimmer
          disabled={loading}
          onPress={onSend}
        />
        <View style={styles.secure}>
          <IconLock color={colors.ink3} />
          <Text style={styles.secureText}>
            {!privacyChecked ? t('send.secureBeforePayment') : t('send.secureFedapay')}
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  customize: { marginTop: 12, height: 44, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(244,72,111,0.4)', backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  customizeText: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.coral },
  deliveryInput: { marginTop: 8, height: 46, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft, paddingHorizontal: 12, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink },
  label: { fontFamily: fonts.displayItalic, fontSize: 12, color: colors.ink2, marginBottom: 6 },
  contact: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(37,211,102,0.08)' },
  contactNum: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.ink },
  contactHint: { fontSize: 11, color: colors.green, fontStyle: 'italic' },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  recapDivider: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  recapLabel: { fontSize: 13, color: colors.ink2 },
  recapValue: { fontSize: 13, color: colors.ink, fontFamily: fonts.bodySemiBold },
  totalLabel: { fontFamily: fonts.displayMedium, fontSize: 15, color: colors.ink },
  totalHint: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  totalHintText: { fontSize: 10, color: colors.green, fontStyle: 'italic' },
  totalAmt: { fontFamily: fonts.bodyBold, fontSize: 24, color: colors.coral, letterSpacing: -0.5 },
  payment: { marginTop: 10, padding: 12, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1.5, borderColor: colors.coral, flexDirection: 'row', alignItems: 'center', gap: 12 },
  payOption: { marginTop: 8, padding: 12, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1.5, borderColor: colors.lineSoft, flexDirection: 'row', alignItems: 'center', gap: 12 },
  payOptionActive: { borderColor: colors.coral },
  paymentIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.indigo, alignItems: 'center', justifyContent: 'center' },
  paymentTitle: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  paymentSub: { fontSize: 11, color: colors.ink2 },
  paymentCheck: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center' },
  topupHint: { marginTop: 8, padding: 10, borderRadius: 12, backgroundColor: 'rgba(249,160,28,0.12)', alignItems: 'center' },
  topupHintText: { fontSize: 12, color: colors.ink },
  footer: { position: 'absolute', bottom: 28, left: 22, right: 22 },
  secure: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  secureText: { fontSize: 11, color: colors.ink3, fontStyle: 'italic' },
});

function normalizeHex(token: string | undefined): string | null {
  if (!token) return null;
  const clean = token.replace(/[^0-9a-fA-F]/g, '');
  if (clean.length !== 6) return null;
  return `#${clean.toUpperCase()}`;
}

function parsePaletteParam(
  param: string | undefined,
): { palette: CardPalette; customColors?: CardColorOverride } {
  if (!param) return { palette: 'coral' };

  if (param.startsWith('solid:')) {
    const hex = normalizeHex(param.slice('solid:'.length));
    if (hex) return { palette: 'coral', customColors: { bg: hex } };
  } else if (param.startsWith('gradient:')) {
    const [start, end] = param.slice('gradient:'.length).split('-');
    const hexStart = normalizeHex(start);
    const hexEnd = normalizeHex(end);
    if (hexStart && hexEnd) {
      return { palette: 'coral', customColors: { bg: [hexStart, hexEnd] } };
    }
  }

  // Fallback: legacy CardPalette enum string or unknown → safe default.
  const VALID: CardPalette[] = ['coral', 'indigo', 'pink', 'mango', 'mint', 'plum'];
  return { palette: (VALID.includes(param as CardPalette) ? (param as CardPalette) : 'coral') };
}
