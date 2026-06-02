// Login — segmented Téléphone/Email + form (branché sur l'API)
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { useWiggle } from '../../theme/animations';
import { colors } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import * as authApi from '../../api/auth';
import { getApiErrorMessage } from '../../api/client';
import { useAuthStore } from '../../store/auth';

function normalizePhone(raw: string): string {
  // Accept "90 12 34 56" or "+229 90 12 34 56" — return E.164 with +229 default
  const digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) return '+' + digits;
  if (digits.startsWith('229')) return '+' + digits;
  return '+229' + digits;
}

export function LoginScreen({ navigation }: RootStackScreenProps<'Login'>) {
  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const wiggleStyle = useWiggle();
  const signIn = useAuthStore((s) => s.signIn);

  async function onSubmit() {
    if (loading) return;
    if (!password) {
      Alert.alert('Mot de passe requis', 'Entre ton mot de passe pour te connecter.');
      return;
    }
    const identifier = mode === 'phone' ? normalizePhone(phone) : email.trim();
    if (!identifier) {
      Alert.alert('Identifiant manquant', mode === 'phone' ? 'Entre ton numéro.' : 'Entre ton email.');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(identifier, password);
      signIn(res);
      navigation.replace('Main', { screen: 'Home' });
    } catch (e) {
      Alert.alert('Connexion échouée', getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer avoidKeyboard>
      <FunBackground palette="cream" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingTop: 32 }}>
          <Animated.Text style={[wiggleStyle, { fontSize: 38 }]}>👋</Animated.Text>
          <Text style={styles.title}>Bon retour</Text>
          <Text style={styles.subtitle}>Connecte-toi pour envoyer un cadeau.</Text>
        </View>

        <View style={{ marginTop: 24 }}>
          <SegmentedControl
            value={mode}
            onChange={setMode}
            options={[
              { value: 'phone', label: 'Téléphone' },
              { value: 'email', label: 'Email' },
            ]}
          />
        </View>

        <View style={{ marginTop: 18 }}>
          {mode === 'phone' ? (
            <Input
              label="Numéro de téléphone"
              placeholder="+229 90 12 34 56"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          ) : (
            <Input
              label="Adresse email"
              placeholder="ton@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          )}
          <Input
            label="Mot de passe"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgot}>Mot de passe oublié ?</Text>
          </Pressable>
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ paddingBottom: 28, marginTop: 28 }}>
          <Button label={loading ? 'Connexion…' : 'Se connecter'} pulse disabled={loading} onPress={onSubmit} />
          <Pressable onPress={() => navigation.replace('Signup')} style={{ marginTop: 14 }}>
            <Text style={styles.signup}>
              Nouveau sur Donia ? <Text style={{ color: colors.coral, fontFamily: fonts.bodyBold }}>Créer un compte</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.displayMedium, fontSize: 36, color: colors.ink, marginTop: 8, letterSpacing: -0.7, lineHeight: 38 },
  subtitle: { marginTop: 4, fontFamily: fonts.displayItalic, fontSize: 16, color: colors.ink2 },
  forgot: { textAlign: 'right', fontSize: 13, color: colors.coral, fontFamily: fonts.bodyBold, marginTop: 4 },
  signup: { textAlign: 'center', fontSize: 13, color: colors.ink2 },
});
