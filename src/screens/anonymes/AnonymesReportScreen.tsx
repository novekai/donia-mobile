// Anonymes — signalement d'un message inapproprié.
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { IconCheck, IconAnonyme } from '../../components/ui/Icons';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { reportAnonymousMessage } from '../../api/anonymes';
import { getApiErrorMessage } from '../../api/client';
import type { AnonymousReportReason } from '../../api/types';

const REASONS: { key: AnonymousReportReason; label: string; emoji: string; color: string }[] = [
  { key: 'HARASSMENT', label: 'Harcèlement', emoji: '😡', color: colors.coralDeep },
  { key: 'THREAT', label: 'Menace', emoji: '⚠️', color: colors.mango },
  { key: 'SPAM', label: 'Spam', emoji: '🔁', color: colors.indigo },
  { key: 'SEXUAL', label: 'Contenu sexuel', emoji: '🔞', color: colors.plum },
  { key: 'HATE', label: 'Discours de haine', emoji: '🚫', color: colors.coralDeep },
  { key: 'OTHER', label: 'Autre', emoji: '✏️', color: colors.ink2 },
];

export function AnonymesReportScreen({ navigation, route }: RootStackScreenProps<'AnonymesReport'>) {
  const messageId = route.params?.messageId ?? '';
  const [reason, setReason] = useState<AnonymousReportReason | null>(null);
  const queryClient = useQueryClient();

  const reportMutation = useMutation({
    mutationFn: () => {
      if (!reason) throw new Error('Choisis une raison');
      return reportAnonymousMessage(messageId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anon-messages'] });
      Alert.alert('Signalement envoyé ✓', 'Le message est masqué et envoyé à notre équipe de modération.', [
        { text: 'OK', onPress: () => navigation.popToTop() },
      ]);
    },
    onError: (e) => Alert.alert('Erreur', getApiErrorMessage(e)),
  });

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader subtitle="Aide-nous à modérer" title="Signaler" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 130 }}>
        <Text style={styles.question}>Pourquoi signales-tu ce message ?</Text>

        <View style={{ gap: 8 }}>
          {REASONS.map((r) => {
            const on = r.key === reason;
            return (
              <Pressable
                key={r.key}
                onPress={() => setReason(r.key)}
                style={[styles.row, on && { borderColor: r.color, borderWidth: 2 }]}
              >
                <View style={[styles.icon, { backgroundColor: `${r.color}1f` }]}>
                  <Text style={{ fontSize: 18 }}>{r.emoji}</Text>
                </View>
                <Text style={styles.label}>{r.label}</Text>
                <View style={[styles.check, { backgroundColor: on ? r.color : 'transparent', borderColor: on ? r.color : colors.ink3 }]}>
                  {on && <IconCheck size={12} color={colors.bg} strokeWidth={3.5} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeEmoji}>🛡️</Text>
          <Text style={styles.noticeText}>
            Le message sera masqué immédiatement et envoyé à notre équipe de modération.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={reportMutation.isPending ? 'Envoi…' : 'Envoyer le signalement'}
          disabled={!reason || reportMutation.isPending}
          onPress={() => reportMutation.mutate()}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  question: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.ink, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineSoft },
  icon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  notice: { marginTop: 16, padding: 12, borderRadius: 12, backgroundColor: 'rgba(93,191,160,0.12)', flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  noticeEmoji: { fontSize: 14 },
  noticeText: { flex: 1, fontSize: 12, color: colors.ink, lineHeight: 18 },
  footer: { position: 'absolute', bottom: 28, left: 22, right: 22 },
});
