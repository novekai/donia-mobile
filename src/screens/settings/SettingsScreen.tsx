// Settings — menu Paramètres (Phase 1 : navigation OK pour les écrans existants,
// Alert "bientôt" sur les options Phase 3 non-encore-implémentées).
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Linking } from 'react-native';
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
};
type Section = { title: string; items: Item[] };

const SECTIONS: Section[] = [
  {
    title: 'Compte',
    items: [
      { emoji: '👤', label: 'Mes informations', sub: 'Nom, email, téléphone, date de naissance', color: colors.coral, route: 'MyInfo' },
      { emoji: '🪪', label: "Vérification d'identité", sub: 'KYC pour les retraits', color: colors.mango, route: 'KYC' },
      { emoji: '🔒', label: 'Sécurité', sub: 'Mot de passe, 2FA, sessions', color: colors.indigo, route: 'Security' },
    ],
  },
  {
    title: 'Préférences',
    items: [
      { emoji: '🎂', label: 'Anniversaire', sub: 'Opt-in / opt-out du jour J', color: colors.pink, route: 'Birthday' },
      { emoji: '🕶️', label: 'Confidentialité', sub: 'Qui peut voir mon email / numéro', color: colors.indigo, route: 'Privacy' },
      { emoji: '🔔', label: 'Notifications', sub: 'Push, email, WhatsApp', color: colors.mango, route: 'NotificationsPref' },
      { emoji: '🌍', label: 'Langue & région', sub: 'Français · FCFA', color: colors.mint, route: 'Language' },
      { emoji: '🎁', label: 'Parrainage', sub: 'Invite tes amis · 1 % à vie', color: colors.plum, route: 'Referral' },
    ],
  },
  {
    title: 'Aide & légal',
    items: [
      { emoji: '💬', label: 'Centre d\'aide', sub: 'Nous contacter', color: colors.mint, url: 'mailto:contact@doniia.com?subject=Aide%20Donia' },
      { emoji: '📄', label: 'CGU', sub: 'Conditions générales d\'utilisation', color: colors.ink2, url: 'https://doniia.com/cgu' },
      { emoji: '🔐', label: 'Confidentialité', sub: 'Politique de confidentialité', color: colors.ink2, url: 'https://doniia.com/confidentialite' },
      { emoji: 'ℹ️', label: 'À propos de Donia', sub: 'NOVEKAI LTD · doniia.com', color: colors.indigo, url: 'https://doniia.com' },
    ],
  },
];

export function SettingsScreen({ navigation }: RootStackScreenProps<'Settings'>) {
  function onPressItem(it: Item) {
    if (it.route) {
      navigation.navigate(it.route as never);
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
    <ScreenContainer>
      <FunBackground palette="cream" density="sparse" />
      <ScreenHeader title="Paramètres" onBack={() => navigation.goBack()} />

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
