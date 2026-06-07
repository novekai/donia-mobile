// ForgotPassword — saisie contact + choix canal (WhatsApp/Email) — branché API
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Alert, Modal, FlatList, ScrollView } from 'react-native';
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
  { id: 'WHATSAPP', title: 'Par WhatsApp', emoji: '📲', accent: '#25D366', placeholder: '90 12 34 56', help: 'On t’enverra un code WhatsApp.' },
  { id: 'EMAIL', title: 'Par email', emoji: '✉️', accent: colors.indigo, placeholder: 'ton@email.com', help: 'On t’enverra un code par email.' },
];

// Pays supportés : 8 d'Afrique de l'Ouest/Centrale + diaspora. L'ordre met les 8 du marché Donia en premier.
type Country = { code: string; flag: string; name: string; dial: string };
const COUNTRIES: Country[] = [
  { code: 'BJ', flag: '🇧🇯', name: 'Bénin', dial: '+229' },
  { code: 'CI', flag: '🇨🇮', name: "Côte d'Ivoire", dial: '+225' },
  { code: 'SN', flag: '🇸🇳', name: 'Sénégal', dial: '+221' },
  { code: 'TG', flag: '🇹🇬', name: 'Togo', dial: '+228' },
  { code: 'BF', flag: '🇧🇫', name: 'Burkina Faso', dial: '+226' },
  { code: 'ML', flag: '🇲🇱', name: 'Mali', dial: '+223' },
  { code: 'NE', flag: '🇳🇪', name: 'Niger', dial: '+227' },
  { code: 'CM', flag: '🇨🇲', name: 'Cameroun', dial: '+237' },
  { code: 'FR', flag: '🇫🇷', name: 'France', dial: '+33' },
  { code: 'BE', flag: '🇧🇪', name: 'Belgique', dial: '+32' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada', dial: '+1' },
  { code: 'US', flag: '🇺🇸', name: 'États-Unis', dial: '+1' },
  { code: 'GB', flag: '🇬🇧', name: 'Royaume-Uni', dial: '+44' },
  { code: 'DE', flag: '🇩🇪', name: 'Allemagne', dial: '+49' },
  { code: 'CH', flag: '🇨🇭', name: 'Suisse', dial: '+41' },
  { code: 'ES', flag: '🇪🇸', name: 'Espagne', dial: '+34' },
  { code: 'IT', flag: '🇮🇹', name: 'Italie', dial: '+39' },
  { code: 'PT', flag: '🇵🇹', name: 'Portugal', dial: '+351' },
];

export function ForgotPasswordScreen({ navigation }: RootStackScreenProps<'ForgotPassword'>) {
  const [selected, setSelected] = useState<Channel>('WHATSAPP');
  const [country, setCountry] = useState<Country>(COUNTRIES[0]!);
  const [localPhone, setLocalPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const bobStyle = useBob();

  const method = METHODS.find((m) => m.id === selected)!;

  async function onSend() {
    let normalized = '';

    if (selected === 'EMAIL') {
      const trimmed = email.trim().toLowerCase();
      if (!trimmed) {
        Alert.alert('Champ vide', 'Entre l’adresse email de ton compte.');
        return;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
        Alert.alert('Email invalide', 'Vérifie le format de ton adresse email.');
        return;
      }
      normalized = trimmed;
    } else {
      const digits = localPhone.replace(/\D/g, '');
      if (!digits) {
        Alert.alert('Champ vide', 'Entre le numéro WhatsApp de ton compte.');
        return;
      }
      if (digits.length < 6 || digits.length > 12) {
        Alert.alert('Numéro invalide', 'Tape ton numéro local sans l’indicatif (ex: 90 12 34 56).');
        return;
      }
      normalized = `${country.dial}${digits}`;
    }

    setSending(true);
    try {
      await forgotPassword(normalized, selected);
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

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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

          {selected === 'WHATSAPP' ? (
            <View style={styles.phoneRow}>
              <Pressable style={styles.dialBtn} onPress={() => setPickerOpen(true)}>
                <Text style={styles.dialFlag}>{country.flag}</Text>
                <Text style={styles.dialCode}>{country.dial}</Text>
                <Text style={styles.dialChevron}>▾</Text>
              </Pressable>
              <TextInput
                value={localPhone}
                onChangeText={setLocalPhone}
                placeholder={method.placeholder}
                placeholderTextColor={colors.ink3}
                keyboardType="phone-pad"
                returnKeyType="done"
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.input, styles.phoneInput]}
              />
            </View>
          ) : (
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={method.placeholder}
              placeholderTextColor={colors.ink3}
              keyboardType="email-address"
              returnKeyType="done"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          )}

          <Text style={styles.hint}>
            💡 Utilise exactement{' '}
            {selected === 'WHATSAPP' ? 'le numéro WhatsApp' : "l'adresse email"}{' '}
            de ton compte (celui utilisé lors de l'inscription).
          </Text>
        </View>

        <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
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
      </ScrollView>

      {/* Country picker modal */}
      <Modal visible={pickerOpen} animationType="slide" transparent onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choisis ton indicatif</Text>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(c) => c.code}
              renderItem={({ item }) => {
                const isCurrent = item.code === country.code;
                return (
                  <Pressable
                    onPress={() => {
                      setCountry(item);
                      setPickerOpen(false);
                    }}
                    style={[styles.countryRow, isCurrent && { backgroundColor: 'rgba(244,72,111,0.08)' }]}
                  >
                    <Text style={styles.countryFlag}>{item.flag}</Text>
                    <Text style={styles.countryName}>{item.name}</Text>
                    <Text style={styles.countryDial}>{item.dial}</Text>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  phoneRow: { flexDirection: 'row', gap: 8 },
  dialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  dialFlag: { fontSize: 20 },
  dialCode: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  dialChevron: { fontSize: 10, color: colors.ink2, marginLeft: 2 },
  phoneInput: { flex: 1 },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: colors.ink2,
    lineHeight: 17,
    fontFamily: fonts.bodyRegular,
  },
  back: { textAlign: 'center', fontSize: 13, color: colors.ink2 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(42,15,26,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 24,
    maxHeight: '75%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.ink3,
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 12,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  countryFlag: { fontSize: 22 },
  countryName: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink },
  countryDial: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink2 },
});
