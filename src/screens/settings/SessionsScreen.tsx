// Sessions — liste des sessions actives + révocation à distance.
// Sert aussi pour "Appareils connectés" (même endpoint, vue regroupée par userAgent).
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { listSessions, revokeSession, revokeAllOtherSessions, type ActiveSession } from '../../api/me';
import { getApiErrorMessage } from '../../api/client';

type Variant = 'sessions' | 'devices';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// Choisit l'emoji selon la marque/OS détecté dans deviceName ou user-agent.
function emojiFor(deviceName: string | null, ua: string | null): string {
  const s = `${deviceName ?? ''} ${ua ?? ''}`.toLowerCase();
  if (s.includes('iphone') || s.includes('ipad') || s.includes('apple') || s.includes('ios')) return '🍎';
  if (s.includes('windows')) return '🪟';
  if (s.includes('mac')) return '💻';
  if (s.includes('linux')) return '🐧';
  if (s.includes('android') || s.includes('tecno') || s.includes('infinix') || s.includes('samsung') || s.includes('xiaomi') || s.includes('redmi') || s.includes('huawei') || s.includes('itel') || s.includes('okhttp')) return '🤖';
  if (s.includes('mozilla') || s.includes('chrome') || s.includes('firefox') || s.includes('safari')) return '🌐';
  return '📱';
}

// Fallback si le mobile n'a pas envoyé deviceName (anciennes sessions / web).
function fallbackName(ua: string | null): string {
  if (!ua) return 'Appareil inconnu';
  if (ua.toLowerCase().startsWith('okhttp')) return 'Android · Donia app';
  if (ua.includes('iPhone')) return 'iPhone';
  if (ua.includes('iPad')) return 'iPad';
  if (ua.includes('Mac OS X')) return 'Mac';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('Linux')) return 'Linux';
  return 'Navigateur web';
}

function SessionRow({ s, onRevoke, busy, variant }: { s: ActiveSession; onRevoke: (id: string) => void; busy: boolean; variant: Variant }) {
  const { t } = useTranslation();
  // Affiche le deviceName envoyé par le mobile (ex: "Tecno Camon 20") en priorité.
  // Si absent (vieilles sessions ou web), on tombe sur le fallback user-agent.
  const displayName = s.deviceName ?? fallbackName(s.userAgent);
  const emoji = emojiFor(s.deviceName, s.userAgent);
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.label}>{displayName}</Text>
          {s.isCurrent && <View style={styles.badge}><Text style={styles.badgeText}>{t('sessions.currentBadge')}</Text></View>}
        </View>
        <Text style={styles.sub}>
          {variant === 'sessions'
            ? t('sessions.connectedAt', { when: formatDate(s.createdAt) })
            : t('sessions.activeSince', { when: formatDate(s.createdAt) })}
        </Text>
        {s.ip && <Text style={styles.subDim}>IP {s.ip}</Text>}
      </View>
      {!s.isCurrent && (
        <Pressable disabled={busy} onPress={() => onRevoke(s.id)} style={[styles.revokeBtn, busy && { opacity: 0.5 }]}>
          <Text style={styles.revokeText}>{t('sessions.revoke')}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function SessionsScreen({ navigation, route }: RootStackScreenProps<'Sessions'>) {
  const { t } = useTranslation();
  const variant: Variant = route.params?.variant ?? 'sessions';
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['me', 'sessions'], queryFn: listSessions });
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [revokingAll, setRevokingAll] = React.useState(false);

  async function onRevokeOne(id: string) {
    if (busyId) return;
    setBusyId(id);
    try {
      await revokeSession(id);
      await queryClient.invalidateQueries({ queryKey: ['me', 'sessions'] });
    } catch (e) {
      Alert.alert(t('common.error'), getApiErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  }

  function onRevokeAll() {
    if (revokingAll) return;
    Alert.alert(
      t('sessions.confirmTitle'),
      t('sessions.confirmBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('sessions.confirmBtn'),
          style: 'destructive',
          onPress: async () => {
            setRevokingAll(true);
            try {
              const res = await revokeAllOtherSessions();
              Alert.alert(t('sessions.revokedTitle'), t('sessions.revokedBody', { count: res.revoked }));
              await queryClient.invalidateQueries({ queryKey: ['me', 'sessions'] });
            } catch (e) {
              Alert.alert(t('common.error'), getApiErrorMessage(e));
            } finally {
              setRevokingAll(false);
            }
          },
        },
      ],
    );
  }

  const sessions = query.data?.sessions ?? [];
  const others = sessions.filter((s) => !s.isCurrent);

  return (
    <ScreenContainer tabBar="home">
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title={variant === 'sessions' ? t('sessions.titleSessions') : t('sessions.titleDevices')} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 40 }}>
        {query.isLoading && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.coral} />
          </View>
        )}
        {query.isError && (
          <Text style={styles.errorText}>{t('sessions.loadFail')}</Text>
        )}
        {!query.isLoading && sessions.length === 0 && (
          <Text style={styles.emptyText}>{t('sessions.empty')}</Text>
        )}

        {sessions.length > 0 && (
          <Card pad={0}>
            {sessions.map((s, i) => (
              <View key={s.id} style={i < sessions.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.lineSoft } : null}>
                <SessionRow s={s} onRevoke={onRevokeOne} busy={busyId === s.id} variant={variant} />
              </View>
            ))}
          </Card>
        )}

        {others.length > 0 && (
          <Pressable onPress={onRevokeAll} disabled={revokingAll} style={[styles.revokeAllBtn, revokingAll && { opacity: 0.5 }]}>
            <Text style={styles.revokeAllText}>
              {revokingAll ? t('sessions.revokingAll') : t('sessions.revokeAll', { count: others.length })}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  iconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.bg2, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  sub: { fontSize: 12, color: colors.ink2, marginTop: 2 },
  subDim: { fontSize: 11, color: colors.ink3, marginTop: 1, fontFamily: 'monospace' },
  badge: { backgroundColor: 'rgba(92,138,69,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 9, color: colors.green, letterSpacing: 0.4 },
  revokeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: 'rgba(214,46,85,0.3)' },
  revokeText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.coralDeep },
  revokeAllBtn: { marginTop: 18, padding: 14, borderRadius: radius.md, backgroundColor: 'rgba(214,46,85,0.10)', borderWidth: 1, borderColor: 'rgba(214,46,85,0.3)', alignItems: 'center' },
  revokeAllText: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.coralDeep },
  errorText: { textAlign: 'center', color: colors.ink2, paddingVertical: 40 },
  emptyText: { textAlign: 'center', color: colors.ink3, paddingVertical: 40, fontFamily: fonts.displayItalic },
});
