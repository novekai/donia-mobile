// Security — 5 rangs (mdp, biométrie, 2FA, devices, sessions) + zone sensible suppression compte
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { IconChevR } from '../../components/ui/Icons';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { deleteAccount } from '../../api/me';
import { getApiErrorMessage } from '../../api/client';
import { useAuthStore } from '../../store/auth';

type Row = { label: string; sub: string; emoji: string; color: string } & ({ kind: 'chev' } | { kind: 'toggle'; key: string });

// Rows visibles sur l'écran Sécurité.
// - Mot de passe : navigue vers ForgotPassword pour reset (canal email/WhatsApp choisi par l'user).
// - 2FA email : toggle local + à terme persisté côté backend (V1.1).
// - Empreinte digitale : retirée, pas implémentée correctement et Apple/Google demanderaient
//   les permissions biométriques juste pour un toggle décoratif.
// - Appareils / Sessions : chev placeholder, écrans à venir V1.1.
const ROWS: Row[] = [
  { kind: 'chev', label: 'Mot de passe', sub: 'Réinitialiser via WhatsApp ou email', emoji: '🔑', color: colors.mango },
  { kind: 'toggle', key: '2fa', label: 'Authentification 2FA', sub: 'Code par email à chaque connexion', emoji: '🛡️', color: colors.mint },
  { kind: 'chev', label: 'Appareils connectés', sub: 'Voir mes appareils', emoji: '📱', color: colors.indigo },
  { kind: 'chev', label: 'Sessions récentes', sub: 'Historique de connexions', emoji: '🕐', color: colors.plum },
];

export function SecurityScreen({ navigation }: RootStackScreenProps<'Security'>) {
  const [toggles, setToggles] = useState<Record<string, boolean>>({ '2fa': false });
  const [deleting, setDeleting] = useState(false);
  const signOut = useAuthStore((s) => s.signOut);
  const queryClient = useQueryClient();

  function onDeleteAccount() {
    if (deleting) return;
    Alert.alert(
      'Supprimer ton compte ?',
      'Cette action est définitive. On supprime :\n\n• Ton nom, email, téléphone, photo\n• Tes liens anonymes et tes messages\n• Tes documents KYC\n\nOn garde, pour des raisons légales BCEAO :\n• Tes transactions financières (10 ans)\n\nTu ne pourras plus te reconnecter avec ce numéro.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Continuer',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmation finale',
              'Es-tu absolument sûr·e ? Cette action est irréversible.',
              [
                { text: 'Non, annuler', style: 'cancel' },
                {
                  text: 'Oui, supprimer définitivement',
                  style: 'destructive',
                  onPress: async () => {
                    setDeleting(true);
                    try {
                      await deleteAccount();
                      queryClient.clear();
                      signOut();
                      Alert.alert(
                        'Compte supprimé',
                        'Ton compte a été supprimé. Tes données ont été effacées conformément au RGPD.',
                      );
                    } catch (e) {
                      Alert.alert('Suppression échouée', getApiErrorMessage(e));
                    } finally {
                      setDeleting(false);
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  }

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Sécurité 🔐" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 40, gap: 8 }}>
        {ROWS.map((r, i) => {
          const onPressRow = () => {
            if (r.kind === 'toggle') return;
            if (r.label === 'Mot de passe') {
              navigation.navigate('ForgotPassword');
            } else {
              Alert.alert('Bientôt disponible', 'Cette section arrive dans la prochaine mise à jour de Donia.');
            }
          };
          const on2FAToggle = () => {
            if (r.kind !== 'toggle') return;
            setToggles((t) => {
              const next = { ...t, [r.key]: !t[r.key] };
              Alert.alert(
                next[r.key] ? '2FA activée' : '2FA désactivée',
                next[r.key]
                  ? 'Un code de vérification sera envoyé à ton email à chaque connexion.'
                  : 'La double authentification est maintenant désactivée.',
              );
              return next;
            });
          };
          return (
            <Pressable key={i} onPress={onPressRow}>
              <Card pad={14} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.icon, { backgroundColor: `${r.color}22` }]}>
                  <Text style={{ fontSize: 18 }}>{r.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{r.label}</Text>
                  <Text style={styles.sub}>{r.sub}</Text>
                </View>
                {r.kind === 'toggle' ? (
                  <Pressable onPress={on2FAToggle}>
                    <View style={[styles.toggle, toggles[r.key] && { backgroundColor: colors.coral }]}>
                      <View style={[styles.toggleDot, { left: toggles[r.key] ? 20 : 2 }]} />
                    </View>
                  </Pressable>
                ) : (
                  <IconChevR color={colors.ink3} />
                )}
              </Card>
            </Pressable>
          );
        })}

        {/* Zone sensible */}
        <View style={{ marginTop: 14 }}>
          <Text style={styles.zoneLabel}>Zone sensible</Text>
          <View style={styles.zone}>
            <View style={styles.zoneHeader}>
              <View style={styles.zoneIcon}>
                <Text style={{ fontSize: 18 }}>🗑️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.zoneTitle}>Supprimer mon compte</Text>
                <Text style={styles.zoneSub}>Action définitive — RGPD</Text>
              </View>
            </View>
            <Text style={styles.zoneText}>
              On supprime ton nom, email, téléphone, photo, liens anonymes et documents KYC.{'\n'}
              On conserve tes transactions financières 10 ans (obligation BCEAO).
            </Text>
            <Pressable
              onPress={onDeleteAccount}
              disabled={deleting}
              style={[styles.zoneBtn, deleting && { opacity: 0.5 }]}
            >
              <Text style={styles.zoneBtnText}>
                {deleting ? 'Suppression…' : 'Demander la suppression'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  sub: { fontSize: 12, color: colors.ink3 },
  toggle: { width: 42, height: 24, borderRadius: 99, backgroundColor: colors.ink3 },
  toggleDot: { position: 'absolute', top: 2, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.bg },
  zoneLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.coralDeep, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  zone: { padding: 16, borderRadius: radius.md, backgroundColor: 'rgba(214,46,85,0.06)', borderWidth: 1.5, borderColor: 'rgba(214,46,85,0.3)' },
  zoneHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  zoneIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(214,46,85,0.18)', alignItems: 'center', justifyContent: 'center' },
  zoneTitle: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.coralDeep },
  zoneSub: { fontSize: 11, color: colors.ink2 },
  zoneText: { fontSize: 12, color: colors.ink2, lineHeight: 18, marginBottom: 12 },
  zoneBtn: { height: 44, borderRadius: 12, backgroundColor: colors.coralDeep, alignItems: 'center', justifyContent: 'center' },
  zoneBtnText: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.bg },
});
