// Language — sélecteur FR/EN. Sauvegarde la préférence côté backend (preferredLanguage).
// NOTE V1 : la traduction effective des chaînes (i18n complet) arrive en V1.1.
// Pour l'instant on ne fait que persister le choix.
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

type Lang = { code: 'fr-FR' | 'en-US'; label: string; native: string; flag: string };

const LANGS: Lang[] = [
  { code: 'fr-FR', label: 'Français', native: 'Français (France)', flag: '🇫🇷' },
  { code: 'en-US', label: 'English', native: 'English (United States)', flag: '🇺🇸' },
];

export function LanguageScreen({ navigation }: RootStackScreenProps<'Language'>) {
  const queryClient = useQueryClient();
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const [busy, setBusy] = React.useState<string | null>(null);

  const current = meQuery.data?.user.preferredLanguage ?? 'fr-FR';

  async function pick(code: Lang['code']) {
    if (busy || code === current) return;
    setBusy(code);
    try {
      await updateMe({ preferredLanguage: code } as Record<string, string>);
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      Alert.alert(
        code === 'fr-FR' ? 'Français activé 🇫🇷' : 'English enabled 🇺🇸',
        code === 'fr-FR'
          ? "La traduction complète de l'app sera disponible dans une prochaine version. Ta préférence est enregistrée."
          : 'Full app translation is coming in a future update. Your preference has been saved.',
      );
    } catch (e) {
      Alert.alert('Erreur', getApiErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Langue & région 🌍" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 40 }}>
        <Text style={styles.intro}>
          Choisis la langue dans laquelle tu veux utiliser Donia. Les emails, les notifications et l'interface s'adapteront à ton choix.
        </Text>

        {meQuery.isLoading && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.coral} />
          </View>
        )}

        {meQuery.data && (
          <Card pad={0}>
            {LANGS.map((l, i) => {
              const selected = current === l.code;
              const isBusy = busy === l.code;
              return (
                <Pressable
                  key={l.code}
                  onPress={() => pick(l.code)}
                  disabled={isBusy}
                  style={[styles.row, i < LANGS.length - 1 && styles.rowDivider, selected && styles.rowSelected]}
                >
                  <Text style={styles.flag}>{l.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, selected && { color: colors.coralDeep }]}>{l.label}</Text>
                    <Text style={styles.sub}>{l.native}</Text>
                  </View>
                  {isBusy ? (
                    <ActivityIndicator color={colors.coral} size="small" />
                  ) : selected ? (
                    <View style={styles.check}><Text style={styles.checkText}>✓</Text></View>
                  ) : null}
                </Pressable>
              );
            })}
          </Card>
        )}

        <Text style={styles.footnote}>
          La traduction complète de l'interface arrive en V1.1. Ta préférence est sauvegardée et sera appliquée automatiquement dès qu'elle sera disponible.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, color: colors.ink2, marginBottom: 18, lineHeight: 19, fontFamily: fonts.bodyRegular },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 16 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  rowSelected: { backgroundColor: 'rgba(214,46,85,0.06)' },
  flag: { fontSize: 28 },
  label: { fontFamily: fonts.displaySemiBold, fontSize: 15, color: colors.ink },
  sub: { fontSize: 12, color: colors.ink3, marginTop: 2 },
  check: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center' },
  checkText: { color: colors.bg, fontFamily: fonts.bodyBold, fontSize: 14 },
  footnote: { marginTop: 20, fontSize: 11, color: colors.ink3, fontStyle: 'italic', textAlign: 'center', lineHeight: 16 },
});
