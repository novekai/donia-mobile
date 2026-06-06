// Settings — menu Paramètres (Phase 1 : navigation OK pour les écrans existants,
// Alert "bientôt" sur les options Phase 3 non-encore-implémentées).
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { FunBackground } from '../../components/deco/FunBackground';
import { ScreenHeader } from '../../components/composed/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { IconChevR } from '../../components/ui/Icons';
import { colors, radius } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { RootStackScreenProps, RootStackParams } from '../../navigation/types';

type Item = {
  emoji: string;
  label: string;
  sub: string;
  color: string;
  route?: keyof RootStackParams;
  url?: string;
  badge?: string;
  comingSoon?: boolean;
  // helpDialog : ouvre un popup pour choisir entre support email et WhatsApp
  helpDialog?: boolean;
};

const SUPPORT_EMAIL = 'contact@doniia.com';
const SUPPORT_WHATSAPP_NUMBER = '+22969949481';

async function openSupportWhatsApp() {
  const digits = SUPPORT_WHATSAPP_NUMBER.replace(/\D/g, '');
  const deepLink = `whatsapp://send?phone=${digits}&text=${encodeURIComponent('Bonjour, j\'ai besoin d\'aide sur Donia.')}`;
  const webFallback = `https://wa.me/${digits}?text=${encodeURIComponent('Bonjour, j\'ai besoin d\'aide sur Donia.')}`;
  try {
    const ok = await Linking.canOpenURL(deepLink);
    if (ok) { await Linking.openURL(deepLink); return; }
    await Linking.openURL(webFallback);
  } catch {
    Alert.alert('WhatsApp indisponible', `Contacte-nous au ${SUPPORT_WHATSAPP_NUMBER}`);
  }
}

async function openSupportEmail() {
  const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Aide Donia')}`;
  try {
    const ok = await Linking.canOpenURL(url);
    if (ok) { await Linking.openURL(url); return; }
    Alert.alert("Aucune app mail", `Écris-nous à ${SUPPORT_EMAIL}`);
  } catch {
    Alert.alert("Aucune app mail", `Écris-nous à ${SUPPORT_EMAIL}`);
  }
}
type Section = { title: string; items: Item[] };

export function SettingsScreen({ navigation }: RootStackScreenProps<'Settings'>) {
  const { t, i18n } = useTranslation();
  const langSubKey = i18n.language === 'en' ? 'settings.languageSubEN' : 'settings.languageSub';
  const SECTIONS: Section[] = [
    {
      title: t('settings.sectionAccount'),
      items: [
        { emoji: '👤', label: t('settings.myInfo'), sub: t('settings.myInfoSub'), color: colors.coral, route: 'MyInfo' },
        { emoji: '🪪', label: t('settings.kyc'), sub: t('settings.kycSub'), color: colors.mango, route: 'KYC' },
        { emoji: '🔒', label: t('settings.security'), sub: t('settings.securitySub'), color: colors.indigo, route: 'Security' },
      ],
    },
    {
      title: t('settings.sectionPreferences'),
      items: [
        { emoji: '🎂', label: t('settings.birthday'), sub: t('settings.birthdaySub'), color: colors.pink, route: 'Birthday' },
        { emoji: '🕶️', label: t('settings.privacy'), sub: t('settings.privacySub'), color: colors.indigo, route: 'Privacy' },
        { emoji: '🔔', label: t('settings.notifications'), sub: t('settings.notificationsSub'), color: colors.mango, route: 'NotificationsPref' },
        { emoji: '🌍', label: t('settings.language'), sub: t(langSubKey), color: colors.mint, route: 'Language' },
        { emoji: '🎁', label: t('settings.referralRow'), sub: t('settings.referralRowSub'), color: colors.plum, route: 'Referral' },
      ],
    },
    {
      title: t('settings.sectionLegal'),
      items: [
        { emoji: '💬', label: t('settings.helpCenter'), sub: t('settings.helpCenterSub'), color: colors.mint, helpDialog: true },
        { emoji: '📄', label: t('settings.cgu'), sub: t('settings.cguSub'), color: colors.ink2, url: 'https://doniia.com/cgu' },
        { emoji: '🔐', label: t('settings.privacyPolicy'), sub: t('settings.privacyPolicySub'), color: colors.ink2, url: 'https://doniia.com/confidentialite' },
        { emoji: 'ℹ️', label: t('settings.about'), sub: t('settings.aboutSub'), color: colors.indigo, url: 'https://doniia.com' },
      ],
    },
  ];
  function onPressItem(it: Item) {
    if (it.route) {
      navigation.navigate(it.route as never);
      return;
    }
    if (it.helpDialog) {
      // Popup pour choisir le canal de contact (email ou WhatsApp).
      Alert.alert(
        '💬  Centre d\'aide',
        'Comment veux-tu nous contacter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: '✉️  Email', onPress: openSupportEmail },
          { text: '💬  WhatsApp', onPress: openSupportWhatsApp },
        ],
      );
      return;
    }
    if (it.url) {
      Linking.canOpenURL(it.url).then((ok) => {
        if (ok) Linking.openURL(it.url!);
        else Alert.alert('Impossible d\'ouvrir', it.url!);
      });
      return;
    }
    if (it.comingSoon) {
      Alert.alert(
        `${it.emoji}  ${it.label}`,
        'Cette option arrive bientôt — elle sera disponible dans une prochaine mise à jour de Donia.',
        [{ text: 'OK', style: 'default' }],
      );
    }
  }

  return (
    <ScreenContainer tabBar="home">
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title={t('settings.title')} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 22, paddingTop: 8 }}>
          {SECTIONS.map((s) => (
            <View key={s.title} style={{ marginBottom: 18 }}>
              <Text style={styles.sectionLabel}>{s.title}</Text>
              <Card pad={0}>
                {s.items.map((it, i) => (
                  <Pressable
                    key={it.label}
                    onPress={() => onPressItem(it)}
                    style={[styles.row, i < s.items.length - 1 && styles.rowDivider]}
                  >
                    <View style={[styles.icon, { backgroundColor: `${it.color}22` }]}>
                      <Text style={{ fontSize: 16 }}>{it.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.label}>{it.label}</Text>
                        {it.badge && (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>{it.badge}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.sub}>{it.sub}</Text>
                    </View>
                    <IconChevR color={colors.ink3} />
                  </Pressable>
                ))}
              </Card>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { fontFamily: fonts.displayItalic, fontSize: 13, color: colors.ink2, marginBottom: 8, paddingLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.lineSoft },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.ink },
  sub: { fontSize: 12, color: colors.ink3, marginTop: 2 },
  badge: { backgroundColor: 'rgba(237,70,115,0.14)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 9.5, color: colors.coralDeep, letterSpacing: 0.4, textTransform: 'uppercase' },
});
