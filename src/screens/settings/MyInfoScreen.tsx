// MyInfo — affiche et édite les vraies infos de l'utilisateur connecté.
// Remplace le mock hardcoded "Awa Diallo".
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { IconLock } from '../../components/ui/Icons';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { getMe, updateMe } from '../../api/me';
import { getApiErrorMessage } from '../../api/client';
import type { Sex } from '../../api/types';

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'F', label: 'Femme' },
  { value: 'M', label: 'Homme' },
  { value: 'OTHER', label: 'Autre' },
];

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatPhone(phone: string): string {
  const e164 = phone.startsWith('+') ? phone : `+${phone}`;
  if (e164.startsWith('+229') && e164.length >= 12) {
    const local = e164.slice(4);
    return `+229 ${local.slice(0, 2)} ${local.slice(2, 4)} ${local.slice(4, 6)} ${local.slice(6, 8)}`;
  }
  return e164;
}

export function MyInfoScreen({ navigation }: RootStackScreenProps<'MyInfo'>) {
  const queryClient = useQueryClient();
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [whatsapp, setWhatsapp] = React.useState('');
  const [sex, setSex] = React.useState<Sex | null>(null);
  const [city, setCity] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    if (!meQuery.data?.user || hydrated) return;
    const u = meQuery.data.user;
    setName(u.name ?? '');
    setEmail(u.email ?? '');
    setWhatsapp(u.whatsapp ?? u.phone ?? '');
    setSex((u.sex as Sex | null) ?? null);
    setCity(u.city ?? '');
    setHydrated(true);
  }, [meQuery.data, hydrated]);

  if (meQuery.isLoading) {
    return (
      <ScreenContainer tabBar="home">
        <FunBackground palette="cream" density="sparse" />
        <ScreenHeader title="Mes informations" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.coral} />
        </View>
      </ScreenContainer>
    );
  }

  if (meQuery.isError || !meQuery.data) {
    return (
      <ScreenContainer tabBar="home">
        <FunBackground palette="cream" density="sparse" />
        <ScreenHeader title="Mes informations" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontFamily: fonts.displayMedium, fontSize: 17, color: colors.ink, textAlign: 'center' }}>
            Impossible de charger ton profil
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const user = meQuery.data.user;
  const sameAsPhone = whatsapp === user.phone || whatsapp === '';

  async function onSave() {
    if (saving) return;
    setSaving(true);
    try {
      const patch: Parameters<typeof updateMe>[0] = {
        name: name.trim(),
        email: email.trim() || undefined,
        sex: sex ?? undefined,
        city: city.trim() || undefined,
      };
      if (whatsapp.trim() && whatsapp.trim() !== user.phone) {
        patch.whatsapp = whatsapp.trim();
      }
      await updateMe(patch);
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      Alert.alert('Enregistré', 'Tes informations ont été mises à jour.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Enregistrement échoué', getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer tabBar="home">
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Mes informations" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 22, paddingBottom: 130, gap: 14 }}
        keyboardShouldPersistTaps="handled"
      >
        <Field label="Prénom et nom">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ton nom"
            placeholderTextColor={colors.ink3}
            style={styles.value}
          />
        </Field>

        <Field label="Email">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="ton@email.com"
            placeholderTextColor={colors.ink3}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.value}
          />
        </Field>

        <Field label="Numéro de téléphone" locked>
          <Text style={styles.value}>{formatPhone(user.phone)}</Text>
        </Field>

        <Field
          label="Numéro WhatsApp"
          wa
          sub={sameAsPhone ? 'identique au téléphone' : 'différent du téléphone'}
        >
          <TextInput
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder="+229 ..."
            placeholderTextColor={colors.ink3}
            keyboardType="phone-pad"
            style={styles.value}
          />
        </Field>

        <Field label="Sexe">
          <View style={styles.sexRow}>
            {SEX_OPTIONS.map((opt) => {
              const on = sex === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setSex(opt.value)}
                  style={[styles.sexChip, on && styles.sexChipOn]}
                >
                  <Text style={[styles.sexText, on && { color: colors.bg }]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="Date de naissance" locked>
          <Text style={styles.value}>{user.dob ? formatDate(user.dob) : '—'}</Text>
        </Field>

        <Field label="Ville">
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Ex. Cotonou"
            placeholderTextColor={colors.ink3}
            style={styles.value}
          />
        </Field>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={saving ? 'Enregistrement…' : 'Enregistrer'}
          pulse
          disabled={saving}
          onPress={onSave}
        />
      </View>
    </ScreenContainer>
  );
}

function Field({
  label,
  locked,
  wa,
  sub,
  children,
}: {
  label: string;
  locked?: boolean;
  wa?: boolean;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>
          {wa && <Text style={{ color: '#25D366' }}>💬 </Text>}
          {label}
        </Text>
        {locked && (
          <View style={styles.lock}>
            <IconLock color={colors.mangoDeep} />
            <Text style={styles.lockText}>VERROUILLÉ</Text>
          </View>
        )}
        {sub && <Text style={styles.sub}>{sub}</Text>}
      </View>
      <View
        style={[
          styles.field,
          locked && { backgroundColor: colors.bg2 },
          wa && {
            backgroundColor: 'rgba(93,191,160,0.10)',
            borderColor: 'rgba(93,191,160,0.4)',
            borderStyle: 'dashed',
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2 },
  lock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
    backgroundColor: 'rgba(249,160,28,0.18)',
  },
  lockText: { fontSize: 10, fontFamily: fonts.bodyBold, color: colors.mangoDeep, letterSpacing: 0.4 },
  sub: { fontSize: 10, fontFamily: fonts.displayItalic, color: colors.green },
  field: {
    minHeight: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  value: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  sexRow: { flexDirection: 'row', gap: 8 },
  sexChip: {
    flex: 1,
    height: 38,
    borderRadius: 99,
    backgroundColor: colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sexChipOn: { backgroundColor: colors.coral },
  sexText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  footer: { position: 'absolute', bottom: 28, left: 22, right: 22 },
});
