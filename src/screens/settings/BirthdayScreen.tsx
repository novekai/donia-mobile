// Birthday — opt-in pour les notifications d'anniversaire (toi + tes proches).
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { getMe, updateMe } from '../../api/me';
import { getApiErrorMessage } from '../../api/client';

export function BirthdayScreen({ navigation }: RootStackScreenProps<'Birthday'>) {
  const queryClient = useQueryClient();
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const [busy, setBusy] = React.useState(false);

  const on = Boolean(meQuery.data?.user.birthdayOptIn ?? true);
  const dob = meQuery.data?.user.dob ?? null;

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      await updateMe({ birthdayOptIn: !on });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
    } catch (e) {
      Alert.alert('Erreur', getApiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Anniversaire 🎂" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 40 }}>
        {meQuery.isLoading && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.coral} />
          </View>
        )}

        {meQuery.data && (
          <>
            <Card>
              <Text style={styles.intro}>
                Donia peut te rappeler les anniversaires de tes proches et leur souhaiter pour toi avec une carte cadeau prête à envoyer. Tu peux activer ou désactiver cette fonctionnalité à tout moment.
              </Text>
            </Card>

            <Pressable onPress={toggle} disabled={busy} style={{ marginTop: 14 }}>
              <Card pad={0}>
                <View style={styles.row}>
                  <View style={styles.iconBox}><Text style={{ fontSize: 22 }}>🎉</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Notifications d'anniversaire</Text>
                    <Text style={styles.sub}>Reçois un rappel 3 jours avant l'anniversaire de tes destinataires</Text>
                  </View>
                  <View style={[styles.toggle, on && { backgroundColor: colors.coral }]}>
                    <View style={[styles.toggleDot, { left: on ? 22 : 2 }]} />
                  </View>
                </View>
              </Card>
            </Pressable>

            <View style={styles.dobCard}>
              <Text style={styles.dobLabel}>Ta date de naissance</Text>
              {dob ? (
                <Text style={styles.dobValue}>
                  {new Date(dob).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              ) : (
                <Pressable onPress={() => navigation.navigate('MyInfo')}>
                  <Text style={[styles.dobValue, { color: colors.coralDeep }]}>Ajouter ma date de naissance →</Text>
                </Pressable>
              )}
              <Text style={styles.dobHint}>
                Tes proches sur Donia recevront un rappel pour ton anniversaire et pourront t'envoyer une carte facilement.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, color: colors.ink2, lineHeight: 20, fontFamily: fonts.bodyRegular },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  iconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.bg2, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  sub: { fontSize: 12, color: colors.ink3, marginTop: 3, lineHeight: 16 },
  toggle: { width: 46, height: 26, borderRadius: 99, backgroundColor: colors.ink3, justifyContent: 'center' },
  toggleDot: { position: 'absolute', top: 2, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.bg },

  dobCard: { marginTop: 20, padding: 16, borderRadius: 18, backgroundColor: 'rgba(255,199,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,199,0,0.3)' },
  dobLabel: { fontFamily: fonts.displayItalic, fontSize: 12, color: colors.ink2, marginBottom: 6 },
  dobValue: { fontFamily: fonts.displaySemiBold, fontSize: 16, color: colors.ink },
  dobHint: { marginTop: 10, fontSize: 12, color: colors.ink2, lineHeight: 17, fontFamily: fonts.bodyRegular },
});
