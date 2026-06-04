// ChangePassword — l'utilisateur connaît son mot de passe actuel et veut le changer.
// 3 champs : mot de passe actuel, nouveau, confirmation.
// Différent du flow ForgotPassword (qui passe par WhatsApp/Email + code).
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { IconCheck } from '../../components/ui/Icons';
import { colors, spacing } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps } from '../../navigation/types';
import { changePassword } from '../../api/me';
import { getApiErrorMessage } from '../../api/client';

export function ChangePasswordScreen({ navigation }: RootStackScreenProps<'ChangePassword'>) {
  const { t } = useTranslation();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const tooShort = next.length > 0 && next.length < 8;
  const sameAsOld = current.length > 0 && next.length > 0 && current === next;
  const matches = next.length >= 8 && next === confirm;
  const canSubmit = current.length > 0 && matches && !sameAsOld;

  async function onSubmit() {
    if (loading || !canSubmit) return;
    setLoading(true);
    try {
      await changePassword(current, next);
      Alert.alert(
        t('changePassword.successTitle'),
        t('changePassword.successBody'),
        [{ text: t('common.ok'), onPress: () => navigation.goBack() }],
      );
    } catch (e) {
      Alert.alert(t('common.error'), getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer avoidKeyboard>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title={t('changePassword.title')} onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 12, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.intro}>{t('changePassword.intro')}</Text>

        <View style={{ marginTop: spacing.md }} />
        <PasswordInput
          label={t('changePassword.current')}
          value={current}
          onChangeText={setCurrent}
        />

        <View style={{ marginTop: spacing.sm }} />
        <PasswordInput
          label={t('changePassword.next')}
          value={next}
          onChangeText={setNext}
        />
        {tooShort && <Text style={styles.helperError}>{t('changePassword.tooShort')}</Text>}
        {sameAsOld && <Text style={styles.helperError}>{t('changePassword.sameAsOld')}</Text>}

        <View style={{ marginTop: spacing.sm }} />
        <PasswordInput
          label={t('changePassword.confirm')}
          value={confirm}
          onChangeText={setConfirm}
        />
        {next.length >= 8 && confirm.length > 0 && next !== confirm && (
          <Text style={styles.helperError}>{t('changePassword.mismatch')}</Text>
        )}
        {matches && !sameAsOld && (
          <View style={styles.helperOk}>
            <View style={styles.checkBubble}>
              <IconCheck size={11} color={colors.bg} strokeWidth={3.5} />
            </View>
            <Text style={styles.helperOkText}>{t('changePassword.match')}</Text>
          </View>
        )}

        <View style={{ marginTop: spacing.lg }} />
        <Button
          label={loading ? t('changePassword.submitBusy') : t('changePassword.submit')}
          pulse
          disabled={!canSubmit || loading}
          onPress={onSubmit}
        />

        <Text style={styles.forgotHint}>
          {t('changePassword.forgotHint')}{' '}
          <Text style={styles.forgotLink} onPress={() => navigation.replace('ForgotPassword')}>
            {t('changePassword.forgotLink')}
          </Text>
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, color: colors.ink2, lineHeight: 19, fontFamily: fonts.bodyRegular },
  helperError: { marginTop: 6, fontSize: 11, color: colors.coralDeep, fontFamily: fonts.bodyMedium },
  helperOk: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkBubble: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  helperOkText: { fontSize: 11, color: colors.green, fontFamily: fonts.bodyBold },
  forgotHint: { marginTop: 18, textAlign: 'center', fontSize: 12, color: colors.ink2 },
  forgotLink: { color: colors.coral, fontFamily: fonts.bodyBold },
});
