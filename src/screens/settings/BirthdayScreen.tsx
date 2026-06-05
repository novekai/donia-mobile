// Birthday — opt-in pour les notifications d'anniversaire (toi + tes proches).
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const [busy, setBusy] = React.useState<string | null>(null);

  const optIn = Boolean(meQuery.data?.user.birthdayOptIn ?? true);
  const pub = Boolean(meQuery.data?.user.birthdayPublic ?? false);
  const dob = meQuery.data?.user.dob ?? null;

  async function toggle(key: 'birthdayOptIn' | 'birthdayPublic', next: boolean) {
    if (busy) return;
    setBusy(key);
    try {
      await updateMe({ [key]: next } as Record<string, boolean>);
      await queryClient.invalidateQueries({ queryKey: ['me'] });
    } catch (e) {
      Alert.alert(t('common.error'), getApiErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <ScreenContainer tabBar="home">
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title={t('birthday.title')} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 40 }}>
        {meQuery.isLoading && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.coral} />
          </View>
        )}

        {meQuery.data && (
          <>
            <Card>
              <Text style={styles.intro}>{t('birthday.intro')}</Text>
            </Card>

            <Pressable onPress={() => toggle('birthdayOptIn', !optIn)} disabled={busy === 'birthdayOptIn'} style={{ marginTop: 14 }}>
              <Card pad={0}>
                <View style={styles.row}>
                  <View style={styles.iconBox}><Text style={{ fontSize: 22 }}>🎉</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>{t('birthday.notifsLabel')}</Text>
                    <Text style={styles.sub}>{t('birthday.notifsSub')}</Text>
                  </View>
                  <View style={[styles.toggle, optIn && { backgroundColor: colors.coral }]}>
                    <View style={[styles.toggleDot, { left: optIn ? 22 : 2 }]} />
                  </View>
                </View>
              </Card>
            </Pressable>

            <Pressable onPress={() => toggle('birthdayPublic', !pub)} disabled={busy === 'birthdayPublic'} style={{ marginTop: 10 }}>
              <Card pad={0}>
                <View style={styles.row}>
                  <View style={styles.iconBox}><Text style={{ fontSize: 22 }}>🎂</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>{t('birthday.publicLabel')}</Text>
                    <Text style={styles.sub}>{t('birthday.publicSub')}</Text>
                  </View>
                  <View style={[styles.toggle, pub && { backgroundColor: colors.coral }]}>
                    <View style={[styles.toggleDot, { left: pub ? 22 : 2 }]} />
                  </View>
                </View>
              </Card>
            </Pressable>

            <View style={styles.dobCard}>
              <Text style={styles.dobLabel}>{t('birthday.dobLabel')}</Text>
              {dob ? (
                <Text style={styles.dobValue}>
                  {new Date(dob).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              ) : (
                <Pressable onPress={() => navigation.navigate('MyInfo')}>
                  <Text style={[styles.dobValue, { color: colors.coralDeep }]}>{t('birthday.dobAdd')}</Text>
                </Pressable>
              )}
              <Text style={styles.dobHint}>{t('birthday.dobHint')}</Text>
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
