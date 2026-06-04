// Privacy — qui peut voir mon email, téléphone, avatar (toggles persistés via PATCH /v1/me).
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { getMe, updateMe } from '../../api/me';
import { getApiErrorMessage } from '../../api/client';

type Toggle = {
  key: 'showEmailPublic' | 'showPhonePublic' | 'showAvatarPublic';
  emoji: string;
  label: string;
  sub: string;
};

const TOGGLES: Toggle[] = [
  { key: 'showAvatarPublic', emoji: '🖼️', label: 'Photo de profil visible', sub: 'Les destinataires voient ton avatar sur les cartes que tu leur envoies' },
  { key: 'showPhonePublic', emoji: '📞', label: 'Numéro visible aux contacts', sub: 'Tes filleuls et destinataires peuvent voir ton numéro de téléphone' },
  { key: 'showEmailPublic', emoji: '✉️', label: 'Email visible aux contacts', sub: 'Ton email apparaît sur ta fiche de contact (rare)' },
];

export function PrivacyScreen({ navigation }: RootStackScreenProps<'Privacy'>) {
  const queryClient = useQueryClient();
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const [busy, setBusy] = React.useState<string | null>(null);

  async function toggle(key: Toggle['key']) {
    if (busy || !meQuery.data) return;
    setBusy(key);
    const current = Boolean(meQuery.data.user[key]);
    try {
      await updateMe({ [key]: !current } as Record<string, boolean>);
      await queryClient.invalidateQueries({ queryKey: ['me'] });
    } catch (e) {
      Alert.alert('Erreur', getApiErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Confidentialité 🔐" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 40 }}>
        <Text style={styles.intro}>
          Choisis qui peut voir tes informations personnelles. Tes données sont toujours sécurisées et chiffrées.
        </Text>

        {meQuery.isLoading && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.coral} />
          </View>
        )}

        {meQuery.data && (
          <Card pad={0}>
            {TOGGLES.map((t, i) => {
              const on = Boolean(meQuery.data!.user[t.key]);
              const isBusy = busy === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => toggle(t.key)}
                  disabled={isBusy}
                  style={[styles.row, i < TOGGLES.length - 1 && styles.rowDivider]}
                >
                  <View style={styles.iconBox}><Text style={{ fontSize: 20 }}>{t.emoji}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>{t.label}</Text>
                    <Text style={styles.sub}>{t.sub}</Text>
                  </View>
                  <View style={[styles.toggle, on && { backgroundColor: colors.coral }]}>
                    <View style={[styles.toggleDot, { left: on ? 22 : 2 }]} />
                  </View>
                </Pressable>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, color: colors.ink2, marginBottom: 18, lineHeight: 19, fontFamily: fonts.bodyRegular },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.bg2, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  sub: { fontSize: 12, color: colors.ink3, marginTop: 3, lineHeight: 16 },
  toggle: { width: 46, height: 26, borderRadius: 99, backgroundColor: colors.ink3, justifyContent: 'center' },
  toggleDot: { position: 'absolute', top: 2, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.bg },
});
