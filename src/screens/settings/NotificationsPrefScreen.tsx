// Notifications — préférences : push système, email, WhatsApp.
// L'écran distinct de NotificationsScreen qui affiche la LISTE des notifs reçues.
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

type ToggleKey = 'notifPushEnabled' | 'notifEmailEnabled' | 'notifWhatsAppEnabled';

type Toggle = { key: ToggleKey; emoji: string; color: string };

const TOGGLES: Toggle[] = [
  { key: 'notifPushEnabled', emoji: '🔔', color: colors.coral },
  { key: 'notifEmailEnabled', emoji: '✉️', color: colors.indigo },
  { key: 'notifWhatsAppEnabled', emoji: '💬', color: '#25D366' },
];

export function NotificationsPrefScreen({ navigation }: RootStackScreenProps<'NotificationsPref'>) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const [busy, setBusy] = React.useState<string | null>(null);

  const LABELS: Record<ToggleKey, { label: string; sub: string }> = {
    notifPushEnabled: { label: t('notifPref.push'), sub: t('notifPref.pushSub') },
    notifEmailEnabled: { label: t('notifPref.email'), sub: t('notifPref.emailSub') },
    notifWhatsAppEnabled: { label: t('notifPref.whatsapp'), sub: t('notifPref.whatsappSub') },
  };

  async function toggle(key: ToggleKey) {
    if (busy || !meQuery.data) return;
    setBusy(key);
    const current = Boolean((meQuery.data.user as Record<string, unknown>)[key] ?? true);
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
      <ScreenHeader title={t('notifPref.title')} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 40 }}>
        <Text style={styles.intro}>{t('notifPref.intro')}</Text>

        {meQuery.isLoading && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.coral} />
          </View>
        )}

        {meQuery.data && (
          <Card pad={0}>
            {TOGGLES.map((tog, i) => {
              const on = Boolean((meQuery.data!.user as Record<string, unknown>)[tog.key] ?? true);
              const isBusy = busy === tog.key;
              return (
                <Pressable
                  key={tog.key}
                  onPress={() => toggle(tog.key)}
                  disabled={isBusy}
                  style={[styles.row, i < TOGGLES.length - 1 && styles.rowDivider]}
                >
                  <View style={[styles.iconBox, { backgroundColor: `${tog.color}22` }]}>
                    <Text style={{ fontSize: 22 }}>{tog.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>{LABELS[tog.key].label}</Text>
                    <Text style={styles.sub}>{LABELS[tog.key].sub}</Text>
                  </View>
                  <View style={[styles.toggle, on && { backgroundColor: colors.coral }]}>
                    <View style={[styles.toggleDot, { left: on ? 22 : 2 }]} />
                  </View>
                </Pressable>
              );
            })}
          </Card>
        )}

        <Text style={styles.footnote}>{t('notifPref.footnote')}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, color: colors.ink2, marginBottom: 18, lineHeight: 19, fontFamily: fonts.bodyRegular },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 16 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  sub: { fontSize: 12, color: colors.ink3, marginTop: 3, lineHeight: 16 },
  toggle: { width: 46, height: 26, borderRadius: 99, backgroundColor: colors.ink3, justifyContent: 'center' },
  toggleDot: { position: 'absolute', top: 2, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.bg },
  footnote: { marginTop: 18, fontSize: 11, color: colors.ink3, fontStyle: 'italic', textAlign: 'center', lineHeight: 16 },
});
