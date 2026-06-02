// Signup — formulaire complet (prénom · sexe · DOB · tel · WhatsApp · email · mdp + confirm)
// Branché sur POST /v1/auth/signup
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, TextInput } from 'react-native';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { Sparkle } from '../../components/deco/Sparkle';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { IconCheck } from '../../components/ui/Icons';
import { colors, radius, spacing } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import * as authApi from '../../api/auth';
import { getApiErrorMessage } from '../../api/client';
import { useAuthStore } from '../../store/auth';

type Sex = 'F' | 'H' | 'A';

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) return '+' + digits;
  if (digits.startsWith('229')) return '+' + digits;
  return '+229' + digits;
}

export function SignupScreen({ navigation }: RootStackScreenProps<'Signup'>) {
  const [name, setName] = useState('');
  const [sex, setSex] = useState<Sex>('F');
  const [phone, setPhone] = useState('');
  const [waSame, setWaSame] = useState(true);
  const [wa, setWa] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [cgu, setCgu] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  const pwMatch = pw.length > 0 && pw === pw2;
  const signIn = useAuthStore((s) => s.signIn);

  async function onSubmit() {
    if (loading) return;
    if (!name.trim()) return Alert.alert('Prénom manquant');
    if (!phone) return Alert.alert('Numéro de téléphone manquant');
    if (pw.length < 8) return Alert.alert('Mot de passe trop court', 'Min. 8 caractères.');
    if (!pwMatch) return Alert.alert('Mots de passe différents');
    if (!cgu) return Alert.alert('Tu dois accepter les CGU pour continuer');
    setLoading(true);
    try {
      const phoneE164 = normalizePhone(phone);
      const res = await authApi.signup({
        name: name.trim(),
        phone: phoneE164,
        whatsapp: waSame ? phoneE164 : normalizePhone(wa),
        email: email.trim() || undefined,
        password: pw,
        sex: sex === 'F' ? 'F' : sex === 'H' ? 'M' : 'OTHER',
        country: 'BJ',
        dob: dobDay && dobMonth && dobYear ? `${dobYear}-${dobMonth.padStart(2, '0')}-${dobDay.padStart(2, '0')}` : undefined,
      });
      signIn(res);
      navigation.navigate('OTP', { phone: phoneE164 });
    } catch (e) {
      Alert.alert('Inscription échouée', getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer avoidKeyboard>
      <FunBackground palette="cream" density="sparse" />
      <View style={styles.header}>
        <Text style={styles.title}>
          Crée ton compte <Sparkle size={18} color={colors.mango} />
        </Text>
        <Text style={styles.subtitle}>Quelques infos pour démarrer.</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
        <Input label="Prénom et nom" placeholder="Awa Diallo" value={name} onChangeText={setName} />

        <Text style={styles.fieldLabel}>Sexe</Text>
        <SegmentedControl
          value={sex}
          onChange={setSex}
          options={[
            { value: 'F', label: 'Femme' },
            { value: 'H', label: 'Homme' },
            { value: 'A', label: 'Autre' },
          ]}
        />

        <View style={{ marginTop: spacing.sm }} />
        <Text style={styles.fieldLabel}>Date de naissance (optionnel)</Text>
        <View style={styles.dobRow}>
          <TextInput
            placeholder="Jour"
            placeholderTextColor={colors.ink3}
            keyboardType="number-pad"
            maxLength={2}
            value={dobDay}
            onChangeText={(v) => setDobDay(v.replace(/\D/g, ''))}
            style={styles.dobInput}
          />
          <TextInput
            placeholder="Mois"
            placeholderTextColor={colors.ink3}
            keyboardType="number-pad"
            maxLength={2}
            value={dobMonth}
            onChangeText={(v) => setDobMonth(v.replace(/\D/g, ''))}
            style={styles.dobInput}
          />
          <TextInput
            placeholder="Année"
            placeholderTextColor={colors.ink3}
            keyboardType="number-pad"
            maxLength={4}
            value={dobYear}
            onChangeText={(v) => setDobYear(v.replace(/\D/g, ''))}
            style={styles.dobInput}
          />
        </View>

        <View style={{ marginTop: spacing.sm }} />
        <Input label="Numéro de téléphone" placeholder="+229 90 12 34 56" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

        <View style={styles.waHeader}>
          <Text style={styles.fieldLabel}>💬 Numéro WhatsApp</Text>
          <Pressable onPress={() => setWaSame((v) => !v)} style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Identique</Text>
            <View style={[styles.toggle, waSame && { backgroundColor: colors.mint }]}>
              <View style={[styles.toggleDot, { left: waSame ? 16 : 2 }]} />
            </View>
          </Pressable>
        </View>
        {waSame ? (
          <View style={styles.waSame}>
            <Text style={styles.waSameText}>{phone || '+229 …'}</Text>
            <Text style={styles.waSameHint}>· même que téléphone</Text>
          </View>
        ) : (
          <Input placeholder="+229 …" keyboardType="phone-pad" value={wa} onChangeText={setWa} />
        )}

        <Input label="Email (optionnel)" placeholder="ton@email.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Input label="Mot de passe" placeholder="••••••••" secureTextEntry value={pw} onChangeText={setPw} />
        <Input label="Confirmer le mot de passe" placeholder="••••••••" secureTextEntry value={pw2} onChangeText={setPw2}
          rightIcon={pwMatch ? (
            <View style={styles.checkBubble}>
              <IconCheck size={11} color={colors.bg} strokeWidth={3.5} />
            </View>
          ) : undefined}
        />

        <Pressable onPress={() => setCgu((v) => !v)} style={styles.cguRow}>
          <View style={[styles.cguBox, cgu && { backgroundColor: colors.coral }]}>
            {cgu && <IconCheck size={12} color={colors.bg} strokeWidth={3} />}
          </View>
          <Text style={styles.cguText}>
            J'accepte les <Text style={styles.cguLink}>CGU</Text> et la <Text style={styles.cguLink}>politique de confidentialité</Text>
          </Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Button label={loading ? 'Création…' : 'Continuer'} pulse disabled={loading} onPress={onSubmit} />
        <Pressable onPress={() => navigation.replace('Login')} style={{ marginTop: 10 }}>
          <Text style={styles.signin}>
            Déjà inscrit ? <Text style={{ color: colors.coral, fontFamily: fonts.bodyBold }}>Se connecter</Text>
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12 },
  title: { fontFamily: fonts.displayMedium, fontSize: 28, color: colors.ink, letterSpacing: -0.6, lineHeight: 30 },
  subtitle: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2, marginTop: 4 },
  fieldLabel: { fontFamily: fonts.displayItalic, fontSize: 12, color: colors.ink2, marginBottom: 5, marginTop: spacing.xs },
  dobRow: { flexDirection: 'row', gap: 6 },
  dobBox: { flex: 1, height: 46, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(42,15,26,0.08)', justifyContent: 'center', paddingHorizontal: 12 },
  dobPlaceholder: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.ink3 },
  waHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toggleLabel: { fontSize: 11, color: colors.ink2 },
  toggle: { width: 32, height: 18, borderRadius: 99, backgroundColor: colors.ink3 },
  toggleDot: { position: 'absolute', top: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.bg },
  waSame: { flexDirection: 'row', alignItems: 'center', height: 46, borderRadius: 12, backgroundColor: 'rgba(93,191,160,0.10)', borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(93,191,160,0.4)', paddingHorizontal: 12, gap: 8 },
  waSameText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  waSameHint: { fontFamily: fonts.displayItalic, fontSize: 10, color: colors.green },
  checkBubble: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  cguRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 4 },
  cguBox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: colors.ink3, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  cguText: { flex: 1, fontSize: 11, color: colors.ink2, lineHeight: 16 },
  cguLink: { color: colors.coral, fontFamily: fonts.bodyBold },
  footer: { paddingHorizontal: 24, paddingBottom: 22, paddingTop: 12 },
  signin: { textAlign: 'center', fontSize: 12, color: colors.ink2 },
  dobInput: { flex: 1, height: 46, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(42,15,26,0.08)', paddingHorizontal: 12, fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.ink, textAlign: 'center' },
});
