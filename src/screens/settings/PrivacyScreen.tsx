// Privacy — qui peut voir mon email, téléphone, avatar (toggles persistés via PATCH /v1/me).
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { getMe, updateMe } from '../../api/me';
import { getApiErrorMessage } from '../../api/client';

type ToggleKey = 'showEmailPublic' | 'showPhonePublic' | 'showAvatarPublic';
type Toggle = { key: ToggleKey; emoji: string };

const TOGGLES: Toggle[] = [
  { key: 'showAvatarPublic', emoji: '🖼️' },
  { key: 'showPhonePublic', emoji: '📞' },
  { key: 'showEmailPublic', emoji: '✉️' },
];

export function PrivacyScreen({ navigation, route }: RootStackScreenProps<'Privacy'>) {
  const { t } = useTranslation();
  const fromSendFlow = Boolean(route.params?.fromSendFlow);
  const queryClient = useQueryClient();
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const [busy, setBusy] = React.useState<string | null>(null);

  const TOGGLE_LABELS: Record<ToggleKey, { label: string; sub: string }> = {
    showAvatarPublic: { label: t('privacy.avatarLabel'), sub: t('privacy.avatarSub') },
    showPhonePublic: { label: t('privacy.phoneLabel'), sub: t('privacy.phoneSub') },
    showEmailPublic: { label: t('privacy.emailLabel'), sub: t('privacy.emailSub') },
  };

  async function toggle(key: ToggleKey) {
    if (busy || !meQuery.data) return;
    setBusy(key);
    const current = Boolean(meQuery.data.user[key]);
    try {
      await updateMe({ [key]: !current } as Record<string, boolean>);
      await queryClient.invalidateQueries({ queryKey: ['me'] });
    } catch (e) {
      Alert.alert(t('common.error'), getApiErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader
        title={fromSendFlow ? t('privacy.titleSendFlow') : t('privacy.titleDefault')}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: fromSendFlow ? 120 : 40 }}>
        <Text style={styles.intro}>
          {fromSendFlow ? t('privacy.introSendFlow') : t('privacy.introDefault')}
        </Text>

        {meQuery.isLoading && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.coral} />
          </View>
        )}

        {meQuery.data && (
          <Card pad={0}>
            {TOGGLES.map((toggleDef, i) => {
              const on = Boolean(meQuery.data!.user[toggleDef.key]);
              const isBusy = busy === toggleDef.key;
              return (
                <Pressable
                  key={toggleDef.key}
                  onPress={() => toggle(toggleDef.key)}
                  disabled={isBusy}
                  style={[styles.row, i < TOGGLES.length - 1 && styles.rowDivider]}
                >
                  <View style={styles.iconBox}><Text style={{ fontSize: 20 }}>{toggleDef.emoji}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>{TOGGLE_LABELS[toggleDef.key].label}</Text>
                    <Text style={styles.sub}>{TOGGLE_LABELS[toggleDef.key].sub}</Text>
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

      {fromSendFlow && (
        <View style={styles.footer}>
          <Button
            label={t('privacy.continueToPayment')}
            pulse
            onPress={() => navigation.goBack()}
          />
        </View>
      )}
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
  footer: { position: 'absolute', bottom: 28, left: 22, right: 22 },
});
