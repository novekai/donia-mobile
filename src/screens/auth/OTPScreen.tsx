// OTP — 6 digits + chips 3 canaux (SMS / WhatsApp / Email) — branché API
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { Sparkle } from '../../components/deco/Sparkle';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { usePulse } from '../../theme/animations';
import { colors, radius, spacing } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import * as authApi from '../../api/auth';
import { getApiErrorMessage } from '../../api/client';
import { useAuthStore } from '../../store/auth';

type Channel = 'WHATSAPP' | 'EMAIL';

export function OTPScreen({ navigation, route }: RootStackScreenProps<'OTP'>) {
  const phoneFromRoute = route.params?.phone;
  const whatsappFromRoute = route.params?.whatsapp;
  const emailFromRoute = route.params?.email;
  const user = useAuthStore((s) => s.user);
  // Un user a parfois un numéro de téléphone et un numéro WhatsApp distincts.
  // Le canal WHATSAPP doit utiliser le numéro WhatsApp en priorité.
  const contactPhone = phoneFromRoute ?? user?.phone ?? '';
  const contactWhatsApp = whatsappFromRoute ?? (user as { whatsapp?: string } | null)?.whatsapp ?? contactPhone;
  const contactEmail = emailFromRoute ?? user?.email ?? '';

  // Le canal Email est prioritaire si l'utilisateur a un email (SMS non supporté).
  const initialChannel: Channel = contactEmail ? 'EMAIL' : 'WHATSAPP';
  const [activeChannel, setActiveChannel] = useState<Channel>(initialChannel);

  const CHANNELS: { ch: Channel; l: string; emoji: string; sub: string; color: string }[] = [
    ...(contactEmail
      ? [{ ch: 'EMAIL' as const, l: 'Email', emoji: '✉️', sub: contactEmail, color: colors.indigo }]
      : []),
    { ch: 'WHATSAPP' as const, l: 'WhatsApp', emoji: '📲', sub: contactWhatsApp || '—', color: '#25D366' },
  ];

  const activeContact = activeChannel === 'EMAIL' ? contactEmail : contactWhatsApp;

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputs = useRef<(TextInput | null)[]>([]);
  const pulseStyle = usePulse();
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  // Envoie automatiquement l'OTP au mount + à chaque changement de canal
  useEffect(() => {
    if (!activeContact) return;
    setSending(true);
    setSecondsLeft(0);
    authApi
      .sendOtp(activeContact, activeChannel)
      .then((r) => setSecondsLeft(r.expiresInSeconds ?? 600))
      .catch((e) => Alert.alert("Envoi échoué", getApiErrorMessage(e)))
      .finally(() => setSending(false));
  }, [activeContact, activeChannel]);

  const update = (i: number, v: string) => {
    const cleaned = v.slice(-1);
    const next = [...digits];
    next[i] = cleaned;
    setDigits(next);
    if (cleaned && i < 5) inputs.current[i + 1]?.focus();
  };

  async function onVerify() {
    if (verifying) return;
    const code = digits.join('');
    if (code.length !== 6) return Alert.alert('Code incomplet', 'Entre les 6 chiffres.');
    if (!activeContact) return Alert.alert("Pas d'identifiant associé");
    setVerifying(true);
    try {
      await authApi.verifyOtp(activeContact, activeChannel, code);
      navigation.replace('Main', { screen: 'Home' });
    } catch (e) {
      Alert.alert('Code invalide', getApiErrorMessage(e));
    } finally {
      setVerifying(false);
    }
  }

  async function onResend() {
    if (sending || secondsLeft > 0) return;
    if (!activeContact) return;
    setSending(true);
    try {
      const r = await authApi.sendOtp(activeContact, activeChannel);
      setSecondsLeft(r.expiresInSeconds ?? 600);
      Alert.alert('Code renvoyé', `Nouveau code envoyé via ${activeChannel === 'EMAIL' ? 'email' : 'WhatsApp'}.`);
    } catch (e) {
      Alert.alert('Renvoi échoué', getApiErrorMessage(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <ScreenContainer avoidKeyboard>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="" onBack={() => navigation.goBack()} />

      <View style={{ paddingHorizontal: 24, marginTop: 28 }}>
        <Text style={styles.title}>Vérification 🔐</Text>
        <Text style={styles.subtitle}>
          On vient de t'envoyer un code à 6 chiffres. Tape sur un canal pour basculer.
        </Text>

        <View style={styles.chips}>
          {CHANNELS.map((c) => {
            const isActive = c.ch === activeChannel;
            return (
              <Pressable
                key={c.l}
                onPress={() => setActiveChannel(c.ch)}
                style={[
                  styles.chip,
                  { borderColor: isActive ? c.color : `${c.color}33` },
                  isActive && { backgroundColor: `${c.color}10`, borderWidth: 2 },
                ]}
              >
                <Text style={{ fontSize: 13 }}>{c.emoji}</Text>
                <View>
                  <Text style={[styles.chipL, { color: c.color }]}>{c.l}</Text>
                  <Text style={styles.chipS}>{c.sub}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.digitsRow}>
        {digits.map((d, i) => (
          <Animated.View key={i} style={i === digits.findIndex((x) => !x) ? pulseStyle : undefined}>
            <TextInput
              ref={(r) => { inputs.current[i] = r; }}
              value={d}
              onChangeText={(v) => update(i, v)}
              keyboardType="number-pad"
              maxLength={1}
              style={[
                styles.digit,
                d ? styles.digitFilled : null,
                !d && i === digits.findIndex((x) => !x) ? styles.digitActive : null,
              ]}
            />
          </Animated.View>
        ))}
      </View>

      <Pressable onPress={onResend} disabled={secondsLeft > 0 || sending}>
        <Text style={styles.resend}>
          Pas reçu de code ?{' '}
          <Text style={{ color: colors.coral, fontFamily: fonts.bodyBold }}>
            {secondsLeft > 0 ? `Renvoyer dans 00:${String(secondsLeft).padStart(2, '0')}` : sending ? 'Envoi…' : 'Renvoyer'}
          </Text>
        </Text>
      </Pressable>

      <View style={styles.tip}>
        <Sparkle size={16} color={colors.mint} />
        <Text style={styles.tipText}>Astuce : on remplit le code automatiquement quand il arrive.</Text>
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ paddingHorizontal: 24, paddingBottom: 22 }}>
        <Button label={verifying ? 'Vérification…' : 'Vérifier'} pulse disabled={verifying} onPress={onVerify} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.displayMedium, fontSize: 32, color: colors.ink, letterSpacing: -0.6 },
  subtitle: { fontSize: 14, color: colors.ink2, marginTop: 6, lineHeight: 20, fontFamily: fonts.bodyRegular },
  chips: { marginTop: 14, flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1 },
  chipL: { fontFamily: fonts.displaySemiBold, fontSize: 11 },
  chipS: { fontFamily: fonts.bodyMedium, fontSize: 9, color: colors.ink2 },
  digitsRow: { marginTop: 32, paddingHorizontal: 24, flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  digit: {
    width: 46, height: 56, borderRadius: 14,
    borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed',
    textAlign: 'center', fontFamily: fonts.bodyBold, fontSize: 24, color: colors.ink,
  },
  digitFilled: { borderStyle: 'solid', backgroundColor: colors.surface },
  digitActive: { borderColor: colors.coral, borderWidth: 2 },
  resend: { marginTop: 18, textAlign: 'center', fontSize: 13, color: colors.ink2 },
  tip: { marginTop: 28, marginHorizontal: 24, padding: 14, backgroundColor: 'rgba(93,191,160,0.12)', borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  tipText: { fontSize: 12, color: colors.ink, flex: 1, lineHeight: 16 },
});
