// Language — sélecteur FR/EN. Bascule l'app immédiatement via i18n.changeLanguage()
// + persiste dans AsyncStorage + synchronise vers backend (preferredLanguage).
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
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
import { changeLanguage, localLangToBackend, type Lang } from '../../i18n';

type LangOption = { code: Lang; label: string; native: string; flag: string };

const LANGS: LangOption[] = [
  { code: 'fr', label: 'Français', native: 'Français (France)', flag: '🇫🇷' },
  { code: 'en', label: 'English', native: 'English (United States)', flag: '🇺🇸' },
];

export function LanguageScreen({ navigation }: RootStackScreenProps<'Language'>) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const meQuery = useQuery({ queryKey: ['me'], queryFn: getMe });
  const [busy, setBusy] = React.useState<string | null>(null);

  const current = (i18n.language === 'en' ? 'en' : 'fr') as Lang;

  async function pick(code: Lang) {
    if (busy || code === current) return;
    setBusy(code);
    try {
      // 1. Change la langue de l'UI immédiatement (re-render tous les useTranslation)
      await changeLanguage(code);
      // 2. Persiste vers le backend (best-effort — n'empêche pas l'UI de switcher)
      try {
        await updateMe({ preferredLanguage: localLangToBackend(code) } as Record<string, string>);
        await queryClient.invalidateQueries({ queryKey: ['me'] });
      } catch {
        // silencieux — la langue est déjà appliquée localement
      }
      Alert.alert(
        code === 'fr' ? t('language.appliedTitleFR') : t('language.appliedTitleEN'),
        code === 'fr' ? t('language.appliedBodyFR') : t('language.appliedBodyEN'),
      );
    } catch (e) {
      Alert.alert(t('common.error'), getApiErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title={t('language.title')} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 40 }}>
        <Text style={styles.intro}>{t('language.intro')}</Text>

        {meQuery.isLoading && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={colors.coral} />
          </View>
        )}

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

        <Text style={styles.footnote}>{t('language.footnote')}</Text>
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
