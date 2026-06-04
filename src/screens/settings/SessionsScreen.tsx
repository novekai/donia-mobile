// Sessions — liste des sessions actives + révocation à distance.
// Sert aussi pour "Appareils connectés" (même endpoint, vue regroupée par userAgent).
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
import { listSessions, revokeSession, revokeAllOtherSessions, type ActiveSession } from '../../api/me';
import { getApiErrorMessage } from '../../api/client';

type Variant = 'sessions' | 'devices';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// Extrait un libellé lisible à partir d'un user-agent (best-effort).
// "okhttp/4.9.2" → "Android · Donia app"
// "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ..." → "Windows · Chrome"
function shortenUA(ua: string | null): { os: string; emoji: string } {
  if (!ua) return { os: 'Appareil inconnu', emoji: '📱' };
  if (ua.toLowerCase().startsWith('okhttp')) return { os: 'Android · Donia app', emoji: '🤖' };
  if (ua.includes('iPhone') || ua.includes('iOS')) return { os: 'iPhone', emoji: '🍎' };
  if (ua.includes('iPad')) return { os: 'iPad', emoji: '🍎' };
  if (ua.includes('Mac OS X')) return { os: 'Mac', emoji: '💻' };
  if (ua.includes('Windows')) return { os: 'Windows', emoji: '🪟' };
  if (ua.includes('Android')) return { os: 'Android', emoji: '🤖' };
  if (ua.includes('Linux')) return { os: 'Linux', emoji: '🐧' };
  return { os: 'Navigateur web', emoji: '🌐' };
}

function SessionRow({ s, onRevoke, busy, variant }: { s: ActiveSession; onRevoke: (id: string) => void; busy: boolean; variant: Variant }) {
  const { os, emoji } = shortenUA(s.userAgent);
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.label}>{os}</Text>
          {s.isCurrent && <View style={styles.badge}><Text style={styles.badgeText}>CET APPAREIL</Text></View>}
        </View>
        <Text style={styles.sub}>
          {variant === 'sessions' ? `Connecté le ${formatDate(s.createdAt)}` : `Active depuis ${formatDate(s.createdAt)}`}
        </Text>
        {s.ip && <Text style={styles.subDim}>IP {s.ip}</Text>}
      </View>
      {!s.isCurrent && (
        <Pressable disabled={busy} onPress={() => onRevoke(s.id)} style={[styles.revokeBtn, busy && { opacity: 0.5 }]}>
          <Text style={styles.revokeText}>Révoquer</Text>
        </Pressable>
      )}
    </View>
  );
}

export function SessionsScreen({ navigation, route }: RootStackScreenProps<'Sessions'>) {
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
      Alert.alert('Révocation échouée', getApiErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  }

  function onRevokeAll() {
    if (revokingAll) return;
    Alert.alert(
      'Déconnecter tous les autres appareils ?',
      'Tu resteras connecté·e ici, mais les autres appareils seront déconnectés immédiatement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout déconnecter',
          style: 'destructive',
          onPress: async () => {
            setRevokingAll(true);
            try {
              const res = await revokeAllOtherSessions();
              Alert.alert('Sessions révoquées', `${res.revoked} session${res.revoked > 1 ? 's' : ''} déconnectée${res.revoked > 1 ? 's' : ''}.`);
              await queryClient.invalidateQueries({ queryKey: ['me', 'sessions'] });
            } catch (e) {
              Alert.alert('Échec', getApiErrorMessage(e));
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
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title={variant === 'sessions' ? 'Sessions récentes 🕐' : 'Appareils connectés 📱'} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 40 }}>
        {query.isLoading && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.coral} />
          </View>
        )}
        {query.isError && (
          <Text style={styles.errorText}>Impossible de charger {variant === 'sessions' ? 'les sessions' : 'les appareils'}.</Text>
        )}
        {!query.isLoading && sessions.length === 0 && (
          <Text style={styles.emptyText}>Aucune session active.</Text>
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
              {revokingAll ? 'Déconnexion…' : `Déconnecter ${others.length} autre${others.length > 1 ? 's' : ''} appareil${others.length > 1 ? 's' : ''}`}
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
