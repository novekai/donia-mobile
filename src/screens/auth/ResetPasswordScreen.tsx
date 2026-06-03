// ResetPassword — saisie code OTP + nouveau mot de passe + confirmation
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { Button } from '../../components/ui/Button';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { usePulse } from '../../theme/animations';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { forgotPassword, resetPassword } from '../../api/auth';
import { getApiErrorMessage } from '../../api/client';

export function ResetPasswordScreen({ navigation, route }: RootStackScreenProps<'ResetPassword'>) {
  const { contact, channel } = route.params;
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputs = useRef<(TextInput | null)[]>([]);
  const pulseStyle = usePulse();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const updateDigit = (i: number, v: string) => {
    const cleaned = v.slice(-1);
    const next = [...digits];
    next[i] = cleaned;
    setDigits(next);
    if (cleaned && i < 5) inputs.current[i + 1]?.focus();
    if (!cleaned && i > 0) inputs.current[i - 1]?.focus();
  };

  async function onSubmit() {
    const code = digits.join('');
    if (code.length !== 6) {
      Alert.alert('Code incomplet', 'Entre les 6 chiffres reçus.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Mot de passe trop court', 'Au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Mot de passe différent', 'La confirmation ne correspond pas.');
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(contact, channel, code, password);
      Alert.alert(
        'Mot de passe mis à jour ✨',
        'Tu peux maintenant te reconnecter avec ton nouveau mot de passe.',
        [{ text: 'Se connecter', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) }],
      );
    } catch (e) {
      Alert.alert('Échec', getApiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function onResend() {
    if (resending || secondsLeft > 0) return;
    setResending(true);
    try {
      await forgotPassword(contact, channel);
      setSecondsLeft(600);
      Alert.alert('Code renvoyé', `Nouveau code envoyé via ${channel === 'EMAIL' ? 'email' : 'WhatsApp'}.`);
    } catch (e) {
      Alert.alert('Renvoi échoué', getApiErrorMessage(e));
    } finally {
      setResending(false);
    }
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <ScreenContainer avoidKeyboard>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="" onBack={() => navigation.goBack()} />

      <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
        <Text style={styles.title}>Nouveau mot de passe 🔐</Text>
        <Text style={styles.subtitle}>
          Code envoyé via {channel === 'EMAIL' ? 'email' : 'WhatsApp'} à{' '}
          <Text style={styles.contact}>{contact}</Text>
        </Text>
      </View>

      <View style={styles.digitsRow}>
        {digits.map((d, i) => (
          <Animated.View key={i} style={i === digits.findIndex((x) => !x) ? pulseStyle : undefined}>
            <TextInput
              ref={(r) => { inputs.current[i] = r; }}
              value={d}
              onChangeText={(v) => updateDigit(i, v)}
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

      <Pressable onPress={onResend} disabled={secondsLeft > 0 || resending}>
        <Text style={styles.resend}>
          Pas reçu de code ?{' '}
          <Text style={{ color: colors.coral, fontFamily: fonts.bodyBold }}>
            {secondsLeft > 0
              ? `Renvoyer dans ${minutes}:${String(seconds).padStart(2, '0')}`
              : resending ? 'Envoi…' : 'Renvoyer'}
          </Text>
        </Text>
      </Pressable>

      <View style={{ paddingHorizontal: 24, marginTop: 24, gap: 12 }}>
        <PasswordInput
          label="Nouveau mot de passe"
          placeholder="Au moins 8 caractères"
          value={password}
          onChangeText={setPassword}
        />
        <PasswordInput
          label="Confirmation"
          placeholder="Retape le mot de passe"
          value={confirm}
          onChangeText={setConfirm}
        />
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ paddingHorizontal: 24, paddingBottom: 22 }}>
        <Button
          label={submitting ? 'Mise à jour…' : 'Réinitialiser'}
          pulse
          disabled={submitting}
          onPress={onSubmit}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.displayMedium, fontSize: 30, color: colors.ink, letterSpacing: -0.6 },
  subtitle: { fontSize: 13, color: colors.ink2, marginTop: 6, lineHeight: 18, fontFamily: fonts.bodyRegular },
  contact: { color: colors.ink, fontFamily: fonts.bodyBold },
  digitsRow: { marginTop: 22, paddingHorizontal: 24, flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  digit: {
    width: 46, height: 56, borderRadius: 14,
    borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed',
    textAlign: 'center', fontFamily: fonts.bodyBold, fontSize: 24, color: colors.ink,
  },
  digitFilled: { borderStyle: 'solid', backgroundColor: colors.surface },
  digitActive: { borderColor: colors.coral, borderWidth: 2 },
  resend: { marginTop: 14, textAlign: 'center', fontSize: 13, color: colors.ink2 },
  label: { fontFamily: fonts.displayItalic, fontSize: 12, color: colors.ink2, marginBottom: 6 },
  input: {
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    paddingHorizontal: 14,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
  },
});
