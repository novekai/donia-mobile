// Login — segmented Téléphone/Email + form (branché sur l'API)
// - Mode "phone" utilise PhoneInput (dropdown indicatif pays)
// - Champ mot de passe utilise PasswordInput (oeil show/hide)
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PhoneInput, DEFAULT_COUNTRY, toE164, type Country } from '../../components/ui/PhoneInput';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { useWiggle } from '../../theme/animations';
import { colors } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import * as authApi from '../../api/auth';
import { getApiErrorMessage } from '../../api/client';
import { useAuthStore } from '../../store/auth';

export function LoginScreen({ navigation }: RootStackScreenProps<'Login'>) {
  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [localPhone, setLocalPhone] = useState('');
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
    let identifier = '';
    if (mode === 'phone') {
      const digits = localPhone.replace(/\D/g, '');
      if (!digits) {
        Alert.alert('Numéro manquant', 'Entre ton numéro de téléphone.');
        return;
      }
      identifier = toE164(country, localPhone);
    } else {
      identifier = email.trim().toLowerCase();
      if (!identifier) {
        Alert.alert('Email manquant', 'Entre ton adresse email.');
        return;
      }
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

        <View style={{ marginTop: 18, gap: 14 }}>
          {mode === 'phone' ? (
            <PhoneInput
              label="Numéro de téléphone"
              country={country}
              onCountryChange={setCountry}
              localNumber={localPhone}
              onLocalNumberChange={setLocalPhone}
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
          <PasswordInput label="Mot de passe" value={password} onChangeText={setPassword} />
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
