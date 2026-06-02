// ForgotPassword — saisie contact + choix canal (WhatsApp/Email) — branché API
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { BrandGradient } from '../../components/brand/BrandGradient';
import { IconCheck } from '../../components/ui/Icons';
import { useBob } from '../../theme/animations';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { forgotPassword } from '../../api/auth';
import { getApiErrorMessage } from '../../api/client';

type Channel = 'WHATSAPP' | 'EMAIL';

const METHODS: { id: Channel; title: string; emoji: string; accent: string; placeholder: string; help: string }[] = [
  { id: 'WHATSAPP', title: 'Par WhatsApp', emoji: '📲', accent: '#25D366', placeholder: '+229 …', help: 'On t’enverra un code WhatsApp.' },
  { id: 'EMAIL', title: 'Par email', emoji: '✉️', accent: colors.indigo, placeholder: 'ton@email.com', help: 'On t’enverra un code par email.' },
];

export function ForgotPasswordScreen({ navigation }: RootStackScreenProps<'ForgotPassword'>) {
  const [selected, setSelected] = useState<Channel>('WHATSAPP');
  const [contact, setContact] = useState('');
  const [sending, setSending] = useState(false);
  const bobStyle = useBob();

  const method = METHODS.find((m) => m.id === selected)!;

  async function onSend() {
    const trimmed = contact.trim();
    if (!trimmed) {
      Alert.alert('Champ vide', selected === 'WHATSAPP'
        ? 'Entre ton numéro WhatsApp.'
        : 'Entre ton adresse email.');
      return;
    }
    if (selected === 'EMAIL' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      Alert.alert('Email invalide', 'Vérifie le format de ton adresse email.');
      return;
    }
    if (selected === 'WHATSAPP' && !/^\+?\d{8,15}$/.test(trimmed.replace(/\s/g, ''))) {
      Alert.alert('Numéro invalide', 'Le numéro doit être au format international (ex: +22990123456).');
      return;
    }
    setSending(true);
    try {
      const normalized = selected === 'EMAIL'
        ? trimmed.toLowerCase()
        : trimmed.replace(/\s/g, '');
      await forgotPassword(normalized, selected);
      // For security, the backend always returns ok=true even if the contact doesn't exist
      // (to prevent account enumeration). We tell the user the code was sent regardless.
      navigation.navigate('ResetPassword', { contact: normalized, channel: selected });
    } catch (e) {
      Alert.alert('Envoi échoué', getApiErrorMessage(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <ScreenContainer avoidKeyboard>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="" onBack={() => navigation.goBack()} />

      <View style={{ paddingHorizontal: 24, marginTop: 28 }}>
        <Animated.View style={[bobStyle, styles.iconWrap]}>
          <BrandGradient variant="mango" style={styles.iconInner}>
            <Text style={styles.iconText}>🔑</Text>
          </BrandGradient>
        </Animated.View>
        <Text style={styles.title}>
          On va t'aider <Text style={styles.titleItalic}>à récupérer</Text> ton compte
        </Text>
        <Text style={styles.subtitle}>
          Choisis un canal — on t'enverra un code de réinitialisation.
        </Text>
      </View>

      <View style={styles.list}>
        {METHODS.map((m) => {
          const on = m.id === selected;
          return (
            <Pressable
              key={m.id}
              onPress={() => setSelected(m.id)}
              style={[styles.method, on && { borderWidth: 2, borderColor: m.accent }]}
            >
              <View style={[styles.methodIcon, { backgroundColor: `${m.accent}22` }]}>
                <Text style={{ fontSize: 18 }}>{m.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodTitle}>{m.title}</Text>
                <Text style={styles.methodSub}>{m.help}</Text>
              </View>
              <View style={[styles.radio, on && { backgroundColor: m.accent, borderWidth: 0 }]}>
                {on && <IconCheck size={12} color={colors.bg} strokeWidth={3.5} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ paddingHorizontal: 24, marginTop: 18 }}>
        <Text style={styles.label}>
          {selected === 'WHATSAPP' ? 'Ton numéro WhatsApp' : 'Ton adresse email'}
        </Text>
        <TextInput
          value={contact}
          onChangeText={setContact}
          placeholder={method.placeholder}
          placeholderTextColor={colors.ink3}
          keyboardType={selected === 'EMAIL' ? 'email-address' : 'phone-pad'}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ paddingHorizontal: 24, paddingBottom: 28 }}>
        <Button
          label={sending ? 'Envoi…' : 'Envoyer le code'}
          pulse
          disabled={sending}
          onPress={onSend}
        />
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 14 }}>
          <Text style={styles.back}>
            Ça te revient ? <Text style={{ color: colors.coral, fontFamily: fonts.bodyBold }}>Se connecter</Text>
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  iconWrap: { width: 80, height: 80, borderRadius: 24, overflow: 'hidden', marginBottom: 18 },
  iconInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 36 },
  title: { fontFamily: fonts.displayMedium, fontSize: 30, color: colors.ink, letterSpacing: -0.6, lineHeight: 32 },
  titleItalic: { fontFamily: fonts.displayItalic, color: colors.coral },
  subtitle: { marginTop: 6, fontSize: 14, color: colors.ink2, lineHeight: 20 },
  list: { paddingHorizontal: 24, marginTop: 24, gap: 8 },
  method: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.lineSoft },
  methodIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  methodTitle: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  methodSub: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.ink2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.ink3, alignItems: 'center', justifyContent: 'center' },
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
  back: { textAlign: 'center', fontSize: 13, color: colors.ink2 },
});
