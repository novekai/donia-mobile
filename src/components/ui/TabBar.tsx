// TabBar — bottom nav V2 : 4 onglets (Accueil / Envoyer / Anonymes / Activité)
// Le Profil est déplacé en haut à droite via HeaderAvatar (le Solde devient une section du Profil).
// Badge numérique sur l'onglet Anonymes pour les messages non-lus.
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { colors, radius, shadow } from '../../theme/tokens';
import { fonts } from '../../theme/typography';
import { IconHome, IconSend, IconAnonyme, IconHistory } from './Icons';
import { countUnreadAnonymousMessages } from '../../api/anonymes';
import { useAuthStore } from '../../store/auth';

export type TabId = 'home' | 'send' | 'anonyme' | 'history';

type TabDef = { id: TabId; labelKey: string; Icon: typeof IconHome };
const TABS: TabDef[] = [
  { id: 'home', labelKey: 'tabs.home', Icon: IconHome },
  { id: 'send', labelKey: 'tabs.send', Icon: IconSend },
  { id: 'anonyme', labelKey: 'tabs.anonyme', Icon: IconAnonyme },
  { id: 'history', labelKey: 'tabs.history', Icon: IconHistory },
];

type Props = {
  active: TabId;
  onPress?: (id: TabId) => void;
};

export function TabBar({ active, onPress }: Props) {
  const { t } = useTranslation();
  const isAuthed = useAuthStore((s) => !!s.token);
  const unreadQuery = useQuery({
    queryKey: ['anon-unread'],
    queryFn: countUnreadAnonymousMessages,
    enabled: isAuthed,
    refetchInterval: 60_000,
  });
  const unreadCount = unreadQuery.data?.count ?? 0;

  return (
    <LinearGradient
      colors={['rgba(255,241,220,0)', colors.bg]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 0.5 }}
      style={styles.wrap}
    >
      <View style={[styles.bar, shadow.e2]}>
        {TABS.map(({ id, labelKey, Icon }) => {
          const on = id === active;
          const showBadge = id === 'anonyme' && unreadCount > 0;
          return (
            <Pressable
              key={id}
              onPress={() => onPress?.(id)}
              style={[styles.tab, on && { backgroundColor: colors.coralSoft }]}
            >
              {showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
              <Icon color={on ? colors.coral : colors.ink2} />
              <Text style={[styles.label, { color: on ? colors.coral : colors.ink2, fontFamily: on ? fonts.displaySemiBold : fonts.displayMedium }]}>
                {t(labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingTop: 14, paddingBottom: 22,
    zIndex: 5,
  },
  bar: {
    marginHorizontal: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 6,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(42,15,26,0.05)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 16,
    gap: 3,
    position: 'relative',
  },
  label: { fontSize: 10 },
  badge: {
    position: 'absolute',
    top: 2,
    right: '50%',
    marginRight: -22,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 99,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.bg,
    zIndex: 2,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.bg,
  },
});
