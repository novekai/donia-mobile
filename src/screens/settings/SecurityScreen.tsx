// Security — 5 rangs (mdp, biométrie, 2FA, devices, sessions) + zone sensible suppression compte
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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

// "Sessions récentes" retirée (06/2026) : elle utilisait le même endpoint que
// "Appareils connectés", donc rien ne justifiait 2 rangs séparés.
type Row = { id: 'password' | '2fa' | 'devices'; emoji: string; color: string } & (
  | { kind: 'chev' }
  | { kind: 'toggle' }
);

export function SecurityScreen({ navigation }: RootStackScreenProps<'Security'>) {
  const { t } = useTranslation();
  const [toggles, setToggles] = useState<Record<string, boolean>>({ '2fa': false });
  const [deleting, setDeleting] = useState(false);
  const signOut = useAuthStore((s) => s.signOut);
  const queryClient = useQueryClient();

  const ROWS: Row[] = [
    { kind: 'chev', id: 'password', emoji: '🔑', color: colors.mango },
    { kind: 'toggle', id: '2fa', emoji: '🛡️', color: colors.mint },
    { kind: 'chev', id: 'devices', emoji: '📱', color: colors.indigo },
  ];

  const ROW_LABELS: Record<Row['id'], { label: string; sub: string }> = {
    password: { label: t('security.password'), sub: t('security.passwordSub') },
    '2fa': { label: t('security.twofa'), sub: t('security.twofaSub') },
    devices: { label: t('security.devices'), sub: t('security.devicesSub') },
  };

  function onDeleteAccount() {
    if (deleting) return;
    Alert.alert(
      t('security.deleteAccount'),
      t('security.deleteBody'),
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
      <ScreenHeader title={t('security.title')} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 40, gap: 8 }}>
        {ROWS.map((r) => {
          const labels = ROW_LABELS[r.id];
          const onPressRow = () => {
            if (r.kind === 'toggle') return;
            if (r.id === 'password') navigation.navigate('ChangePassword');
            else if (r.id === 'devices') navigation.navigate('Sessions', { variant: 'devices' });
          };
          const on2FAToggle = () => {
            if (r.kind !== 'toggle') return;
            setToggles((prev) => {
              const next = { ...prev, [r.id]: !prev[r.id] };
              Alert.alert(
                next[r.id] ? t('security.twofaEnabledTitle') : t('security.twofaDisabledTitle'),
                next[r.id] ? t('security.twofaEnabledBody') : t('security.twofaDisabledBody'),
              );
              return next;
            });
          };
          return (
            <Pressable key={r.id} onPress={onPressRow}>
              <Card pad={14} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.icon, { backgroundColor: `${r.color}22` }]}>
                  <Text style={{ fontSize: 18 }}>{r.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{labels.label}</Text>
                  <Text style={styles.sub}>{labels.sub}</Text>
                </View>
                {r.kind === 'toggle' ? (
                  <Pressable onPress={on2FAToggle}>
                    <View style={[styles.toggle, toggles[r.id] && { backgroundColor: colors.coral }]}>
                      <View style={[styles.toggleDot, { left: toggles[r.id] ? 20 : 2 }]} />
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
          <Text style={styles.zoneLabel}>{t('security.zoneLabel')}</Text>
          <View style={styles.zone}>
            <View style={styles.zoneHeader}>
              <View style={styles.zoneIcon}>
                <Text style={{ fontSize: 18 }}>🗑️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.zoneTitle}>{t('security.deleteAccount')}</Text>
                <Text style={styles.zoneSub}>{t('security.deleteAccountSub')}</Text>
              </View>
            </View>
            <Text style={styles.zoneText}>{t('security.deleteBody')}</Text>
            <Pressable
              onPress={onDeleteAccount}
              disabled={deleting}
              style={[styles.zoneBtn, deleting && { opacity: 0.5 }]}
            >
              <Text style={styles.zoneBtnText}>
                {deleting ? t('security.deleteBtnBusy') : t('security.deleteBtn')}
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
